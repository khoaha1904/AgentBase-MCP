import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { CallToolResult } from "@modelcontextprotocol/server";

import {
  createInventoryReceipt,
  rebaseInventoryReceipt,
  DISCOVERY_LANES,
  validateDiscoverySeed,
  type DiscoveryInventory,
  type DiscoveryGroup,
  type DiscoveryLane,
  type DiscoverySeed,
  type DiscoverySourceIdentity,
  type InventoryReceipt,
  type OkfAuthoringGuidance,
  type OkfAuthoringGuidanceRequest,
  validateInventoryReceipt,
} from "../../core/knowledge/index.ts";
import type { SourceSnapshot } from "../../providers/github-hub/index.ts";
import { templateDiscovery } from "./template-discovery.ts";

const MAX_CENSUS_ENTRIES = 4_096;
const MAX_FILE_BYTES = 64 * 1024;
const WEB_INTERFACE_ANNOTATION = /@(?:(?:org\.springframework\.web\.bind\.annotation|org\.springframework\.stereotype|(?:javax|jakarta)\.ws\.rs)\.)?(?:GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping|RestController|Controller|Path|GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/;

type CensusSignal = Readonly<{
  lane: DiscoveryLane;
  kind: string;
  priority: "p0" | "p1" | "p2";
  title: string;
  path: string;
  line: number;
  hint: string;
}>;

type ArmedSource = Readonly<{
  snapshot: SourceSnapshot;
  mode: "new" | "refresh";
  authority?: Readonly<{ hubProfileId: string; publishedBase: string }>;
}>;

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizedPath(value: string): string | undefined {
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").some((part) => !part || part === "." || part === "..")) {
    return undefined;
  }
  return normalized;
}

export function isDeniedDiscoveryPath(value: string): boolean {
  const normalized = normalizedPath(value);
  if (!normalized) return true;
  const parts = normalized.toLowerCase().split("/");
  const deniedDirectories = new Set([
    ".git", ".agentbase", ".codebase-memory", "node_modules", "vendor", "dist", "build",
    "coverage", "target", ".terraform", ".terragrunt-cache", ".gradle", ".serverless",
    ".cache", ".next", ".nuxt", "__pycache__",
  ]);
  if (parts.some((part) => deniedDirectories.has(part))) return true;
  const name = parts.at(-1)!;
  return name === ".env" || name.startsWith(".env.") || name.endsWith(".env")
    || [".netrc", ".npmrc", ".pypirc", "credentials", "credentials.json", "id_rsa", "id_ed25519"].includes(name)
    || [".pem", ".key", ".p12", ".pfx", ".crt", ".cer"].some((suffix) => name.endsWith(suffix));
}

function candidateFile(relative: string): boolean {
  const name = path.posix.basename(relative).toLowerCase();
  const extension = path.posix.extname(name);
  return /^readme(?:\.|$)/i.test(name) || ["codeowners", "dockerfile", "makefile", "terragrunt.hcl", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts"].includes(name)
    || [".tf", ".hcl", ".yaml", ".yml", ".json", ".template", ".toml", ".md", ".ts", ".tsx", ".js", ".mjs",
      ".cjs", ".py", ".go", ".java", ".sh", ".cs", ".kt", ".kts"].includes(extension);
}

function isTestOrDocumentationPath(relative: string): boolean {
  return /(?:^|\/)(?:tests?|__tests__|fixtures|__fixtures__|docs?|documentation)\//i.test(relative)
    || /\.(?:md|markdown|mdx)$/i.test(relative)
    || /(?:Test|Tests|Spec)\.(?:java|kt|kts)$/.test(relative)
    || /(?:^|[\/._-])(?:test|spec)[._-]/i.test(relative)
    || /(?:_test\.go|_test\.py|\/test_[^/]+\.py)$/i.test(relative);
}

function priorityFile(relative: string): boolean {
  const name = path.posix.basename(relative).toLowerCase();
  return /^readme(?:\.|$)/.test(name)
    || ["package.json", "pyproject.toml", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts",
      "dockerfile", "makefile", "codeowners", "terragrunt.hcl"].includes(name)
    || /\.(tf|hcl)$/.test(name) || /^(template|sam|serverless|compose|docker-compose)(?:\.|$)/.test(name)
    || /^(runbook|deploy|deployment|release).*\.md$/.test(name) || relative.startsWith(".github/workflows/")
    || !isTestOrDocumentationPath(relative) && /\.(?:java|kt|kts)$/.test(name) && (/(?:controller|resource|endpoint|application|main)(?:impl)?\.(?:java|kt|kts)$/.test(name)
      || /(?:^|\/)(?:controllers?|resources?|endpoints?)\//i.test(relative));
}

function walkCensusFiles(root: string, mode: "standard" | "expanded") {
  const pending = [""];
  const files: string[] = [];
  const fileLimit = mode === "expanded" ? 1_024 : 256;
  let entries = 0;
  let entriesTruncated = false, oversized = 0;
  while (pending.length && entries < MAX_CENSUS_ENTRIES) {
    const relativeDirectory = pending.shift()!;
    const absoluteDirectory = relativeDirectory ? path.join(root, relativeDirectory) : root;
    const children = fs.readdirSync(absoluteDirectory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of children) {
      if (entries >= MAX_CENSUS_ENTRIES) { entriesTruncated = true; break; }
      entries += 1;
      const relative = normalizedPath(relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name);
      if (!relative || isDeniedDiscoveryPath(relative) || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) pending.push(relative);
      else if (entry.isFile() && candidateFile(relative)) {
        if (fs.lstatSync(path.join(root, relative)).size <= MAX_FILE_BYTES) files.push(relative);
        else oversized += 1;
      }
    }
  }
  entriesTruncated ||= Boolean(pending.length);
  const ordered = files.sort();
  const priority = ordered.filter((file) => priorityFile(file));
  const ordinary = ordered.filter((file) => !priorityFile(file));
  const reserved = Math.min(ordinary.length, Math.floor(fileLimit / 4));
  const selected = new Set([...priority.slice(0, fileLimit - reserved), ...ordinary.slice(0, reserved)]);
  for (const file of [...priority, ...ordinary]) {
    if (selected.size >= fileLimit) break;
    selected.add(file);
  }
  return { files: [...selected].sort(), truncated: entriesTruncated || files.length > fileLimit, oversized,
    accounting: { mode, fileLimit, selectedFiles: selected.size, eligibleFiles: files.length,
      omittedPriorityFiles: priority.filter((file) => !selected.has(file)).length, entriesTruncated } };
}

function addMatchSignals(signals: CensusSignal[], relative: string, lines: readonly string[]): void {
  const lowerPath = relative.toLowerCase();
  const production = !isTestOrDocumentationPath(relative);
  const javaOrKotlin = /\.(?:java|kt|kts)$/.test(lowerPath);
  const add = (lane: DiscoveryLane, kind: string, priority: CensusSignal["priority"], title: string,
    line: number, hint: string) => signals.push({ lane, kind, priority, title, path: relative, line, hint });
  if (/^readme(?:\.|$)/i.test(path.posix.basename(relative)) || /(?:^|\/)package\.json$/.test(lowerPath)
    || /(?:^|\/)pyproject\.toml$/.test(lowerPath) || /(?:^|\/)go\.mod$/.test(lowerPath)) {
    add("identity-product", "repository-identity", "p0", "Repository identity and stated purpose", 1, relative);
  }
  if (/\.tf$/.test(lowerPath) || /(?:^|\/)terragrunt\.hcl$/.test(lowerPath)) {
    add("deploy-operations", "infrastructure-workload", "p0", "Terraform/Terragrunt deployment workload", 1, relative);
  } else if (/(?:^|\/)(dockerfile|docker-compose[^/]*|compose[^/]*)$/.test(lowerPath)
    || /(?:^|\/)\.github\/workflows\//.test(lowerPath) || /(?:^|\/)(makefile|codeowners)$/.test(lowerPath)
    || /(?:^|\/)(runbook|deploy|deployment|release)[^/]*\.md$/.test(lowerPath)) {
    add("deploy-operations", "operations-surface", "p2", "Operational and delivery surface", 1, relative);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!, number = index + 1;
    if (production && (/resource\s+"(?:aws_lambda_function|aws_ecs_service|aws_instance|aws_autoscaling_group|azurerm_linux_function_app|azurerm_linux_virtual_machine|google_cloudfunctions_function)"/i.test(line)
      || /(?:^|[^a-z])(handler|main|bootstrap)\s*[=:]/i.test(line)
      || javaOrKotlin && /@(?:org\.springframework\.boot\.autoconfigure\.)?SpringBootApplication\b/.test(line)
      || lowerPath.endsWith(".java") && /\bpublic\s+static\s+void\s+main\s*\(/.test(line))) {
      add("runtime-entrypoint", "runtime-entrypoint", "p0", "Evidenced runtime or entrypoint", number, redactDiscoveryHint(line));
    }
    if (production && (/resource\s+"(?:aws_apigatewayv2_route|aws_api_gateway_method|aws_lambda_event_source_mapping|aws_s3_bucket_notification|aws_sns_topic_subscription)"/i.test(line)
      || /\b(?:app|router)\.(?:get|post|put|patch|delete)\s*\(/i.test(line)
      || javaOrKotlin && WEB_INTERFACE_ANNOTATION.test(line)
      || /\b(?:route|trigger|event_source)\b\s*[=:]/i.test(line))) {
      add("interface-event-trigger", "interface-trigger", "p0", "Explicit interface, event or trigger", number, redactDiscoveryHint(line));
    }
    if (/resource\s+"(?:aws_sqs_queue|aws_sns_topic|aws_dynamodb_table|aws_db_instance|aws_rds_cluster|aws_s3_bucket|azurerm_servicebus_queue|google_pubsub_topic)"/i.test(line)
      || /\b(?:queue_url|topic_arn|endpoint|base_url|database_url)\b\s*[=:]/i.test(line)
      || /https?:\/\/[A-Za-z0-9.-]+(?:[:/][^\s"']*)?/i.test(line)) {
      add("integration-data-channel", "outbound-integration", "p0", "Explicit outbound dependency, data store or channel", number, redactDiscoveryHint(line));
    }
  }
}

export function redactDiscoveryHint(value: string): string {
  let redacted = value.trim();
  redacted = redacted.replace(/([A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s/@"']+):[^\s/@"']+@/gi, "$1:[REDACTED]@");
  redacted = redacted.replace(/\bAuthorization\b(\s*[:=]\s*)Bearer\s+[^\s,;]+/gi, "Authorization$1Bearer [REDACTED]");
  redacted = redacted.replace(/\b(password|passwd|token|secret|api[_-]?key|access[_-]?key|client[_-]?secret|private[_-]?key)\b(\s*[:=]\s*)(["'`]?)([^\s,"'`}]+)\3/gi,
    "$1$2$3[REDACTED]$3");
  redacted = redacted.replace(/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, "[REDACTED_AWS_KEY]");
  redacted = redacted.replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_TOKEN]");
  return redacted.slice(0, 240);
}

function census(root: string, mode: "standard" | "expanded") {
  const discovered = walkCensusFiles(root, mode);
  const signals: CensusSignal[] = [];
  const templateLimitations = new Set<string>();
  for (const relative of discovered.files) {
    if (isDeniedDiscoveryPath(relative)) continue;
    const absolute = path.join(root, relative);
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE_BYTES) continue;
    const text = fs.readFileSync(absolute, "utf8");
    addMatchSignals(signals, relative, text.split(/\r?\n/));
    if (/\.(ya?ml|json|template)$/i.test(relative)) {
      const template = templateDiscovery(text);
      for (const issue of template.limitations) templateLimitations.add(issue);
      for (const hint of template.hints) {
        if (isTestOrDocumentationPath(relative) && (hint.kind === "runtime" || hint.kind === "interface")) continue;
        signals.push({
          lane: hint.kind === "runtime" ? "runtime-entrypoint" : hint.kind === "interface" ? "interface-event-trigger" : "deploy-operations",
          kind: `template-${hint.kind}`, priority: "p0", title: `Template ${hint.kind} evidence`,
          path: relative, line: hint.line, hint: redactDiscoveryHint(hint.text),
        });
      }
    }
  }
  return { signals, truncated: discovered.truncated, oversized: discovered.oversized, accounting: discovered.accounting,
    templateLimitations: [...templateLimitations] };
}

function compactGroups(signals: readonly CensusSignal[]): readonly DiscoveryGroup[] {
  const grouped = new Map<string, CensusSignal[]>();
  for (const signal of signals) {
    // JVM launcher markers describe one file; infrastructure declarations remain distinct.
    const scope = signal.lane === "runtime-entrypoint"
      ? /\.(?:java|kt|kts)$/i.test(signal.path) ? signal.path : `${signal.path}:${signal.line}`
      : "";
    const key = `${signal.lane}\u0000${signal.kind}\u0000${signal.priority}\u0000${signal.title}\u0000${scope}`;
    grouped.set(key, [...(grouped.get(key) ?? []), signal]);
  }
  return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, values]) => {
    const first = values[0]!;
    const locations = [...new Map(values.map((value) => [`${value.path}:${value.line}`, {
      path: value.path, startLine: value.line, endLine: value.line,
    }])).values()];
    const perFile = new Map<string, number>();
    const sources = locations.map((source) => {
      const round = perFile.get(source.path) ?? 0;
      perFile.set(source.path, round + 1);
      return { source, round };
    }).sort((left, right) => left.round - right.round).slice(0, 8).map(({ source }) => source);
    const hints = [...new Set(values.map((value) => value.hint))].sort().slice(0, 16);
    const body = { lane: first.lane, kind: first.kind, priority: first.priority, title: first.title, sources, hints };
    return {
      id: `discovery-group-${digest(body).slice(0, 24)}`,
      ...body,
      count: values.length,
      limitations: values.length > hints.length || sources.length < new Set(values.map((value) => `${value.path}:${value.line}`)).size
        ? ["group samples are bounded; count retains the full observed signal total"] : [],
    };
  });
}

function sourceIdentity(snapshot: SourceSnapshot): DiscoverySourceIdentity {
  return { repositoryId: snapshot.repositoryId, remote: snapshot.remote.canonicalHttpsUrl,
    defaultBranch: snapshot.defaultBranch, commit: snapshot.commit };
}

function buildSeed(input: Readonly<{
  snapshot: SourceSnapshot;
  censusTruncated: boolean;
  censusOversized: number;
  templateLimitations: readonly string[];
  census: NonNullable<DiscoverySeed["capture"]["census"]>;
  signals: readonly CensusSignal[];
}>): DiscoverySeed {
  const limitations: string[] = ["source census uses bounded filename/line heuristics; symbols, calls and framework dispatch are not resolved",
    ...input.templateLimitations];
  if (input.censusTruncated) limitations.push("bounded source census reached its entry/file limit");
  if (input.censusOversized) limitations.push(`${input.censusOversized} admitted source files exceeded the 64 KiB census read limit`);
  const flowSignals = input.signals.filter((signal) => signal.lane === "integration-data-channel" && signal.priority === "p0")
    .map((signal) => ({ ...signal, kind: "flow-candidate", priority: "p1" as const,
      title: "Cross-boundary Flow candidate" }));
  let groups = compactGroups([...input.signals, ...flowSignals]);
  if (!groups.some((group) => group.lane === "identity-product")) {
    const fallback = input.signals[0];
    if (fallback) groups = compactGroups([...input.signals, { ...fallback, lane: "identity-product", kind: "repository-identity",
      priority: "p0", title: "Repository identity requires semantic confirmation", hint: fallback.path }]);
  }
  const identityUnavailable = !groups.some((group) => group.lane === "identity-product");
  if (identityUnavailable) limitations.push("repository identity evidence was not available in the bounded safe census");
  const lanes = DISCOVERY_LANES.map((lane) => {
    const laneGroups = groups.filter((group) => group.lane === lane);
    if (laneGroups.length) return { lane, status: "covered" as const };
    return { lane, status: "limited" as const,
      limitation: "not detected by bounded source heuristics; source qualification is required before claiming absence" };
  });
  const body = {
    source: sourceIdentity(input.snapshot),
    engine: { id: "agentbase-source-census", version: "1", profile: "bounded-source-v1" },
    lanes,
    groups,
    capture: {
      truncated: input.censusTruncated,
      p1P2Overflow: 0,
      limitations: [...new Set(limitations)].sort(),
      census: input.census,
    },
    state: identityUnavailable ? "invalid" as const : "ready" as const,
  };
  const hex = digest(body);
  const seed = { id: `discovery-seed-${hex.slice(0, 24)}`, digest: `sha256:${hex}`, ...body };
  validateDiscoverySeed(seed);
  return seed;
}

function appendSeed(result: CallToolResult, seed: DiscoverySeed): CallToolResult {
  const summary = {
    agentbase_discovery_seed: {
      id: seed.id,
      digest: seed.digest,
      state: seed.state,
      source: seed.source,
      engine: seed.engine,
      lanes: seed.lanes,
      groups: seed.groups,
      capture: seed.capture,
    },
  };
  return { ...result, content: [...result.content, { type: "text", text: JSON.stringify(summary) }] };
}

export class DiscoverySession {
  readonly #stateRoot: string | undefined;
  #armed: ArmedSource | undefined;
  #seed: DiscoverySeed | undefined;
  #captured: Parameters<typeof buildSeed>[0] | undefined;
  #expanded = false;
  readonly #receipts = new Map<string, InventoryReceipt>();

  constructor(stateRoot?: string) {
    this.#stateRoot = stateRoot ? path.resolve(stateRoot) : undefined;
  }

  #receiptPath(id: string): string | undefined {
    if (!this.#stateRoot || !/^discovery-receipt-[a-f0-9]{24}$/.test(id)) return undefined;
    return path.join(this.#stateRoot, "discovery-receipts", `${id}.json`);
  }

  #persistReceipt(receipt: InventoryReceipt): void {
    const target = this.#receiptPath(receipt.id);
    if (!target) return;
    fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
    fs.chmodSync(path.dirname(target), 0o700);
    if (fs.existsSync(target)) {
      const existing = JSON.parse(fs.readFileSync(target, "utf8")) as InventoryReceipt;
      validateInventoryReceipt(existing);
      if (existing.digest !== receipt.digest) throw new Error("discovery Receipt identity collision");
      return;
    }
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    fs.renameSync(temporary, target);
  }

  arm(snapshot: SourceSnapshot, mode: "new" | "refresh",
    authority?: Readonly<{ hubProfileId: string; publishedBase: string }>): void {
    this.#armed = mode === "new" ? { snapshot, mode, ...(authority ? { authority } : {}) } : undefined;
    this.#seed = undefined;
    this.#captured = undefined;
    this.#expanded = false;
  }

  get activeSeed(): DiscoverySeed | undefined { return this.#seed; }

  expand(repositoryRoot: string, confirmation: unknown): CallToolResult {
    const seed = this.#seed, captured = this.#captured, armed = this.#armed;
    if (!seed || !captured || !armed || this.#expanded || seed.state !== "ready"
      || fs.realpathSync(repositoryRoot) !== fs.realpathSync(armed.snapshot.analysisRoot)
      || seed.capture.census?.mode !== "standard"
      || seed.capture.census.eligibleFiles <= seed.capture.census.selectedFiles
      || [...this.#receipts.values()].some((receipt) => receipt.seedId === seed.id)) {
      throw new Error("expanded discovery requires an unfrozen standard Seed with omitted files on the same armed repository");
    }
    const value = confirmation as Record<string, unknown> | null;
    if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).some((key) => !["seed_id", "user_confirmed", "reason"].includes(key))
      || value.seed_id !== seed.id || value.user_confirmed !== true
      || typeof value.reason !== "string" || !value.reason.trim() || value.reason.length > 512) {
      throw new Error("expanded discovery requires current seed_id, user_confirmed:true and a concrete coverage reason");
    }
    const direct = census(armed.snapshot.analysisRoot, "expanded");
    const expanded = buildSeed({ ...captured, census: direct.accounting, templateLimitations: direct.templateLimitations,
      censusTruncated: direct.truncated, censusOversized: direct.oversized, signals: direct.signals });
    this.#expanded = true;
    this.#seed = expanded;
    return appendSeed({ content: [] }, expanded);
  }

  freezeReceipt(input: Readonly<{
    inventory: DiscoveryInventory;
    guidanceRequest: OkfAuthoringGuidanceRequest;
    guidance: OkfAuthoringGuidance;
    createdAt?: string;
  }>): InventoryReceipt {
    const seed = this.#seed, authority = this.#armed?.authority;
    if (!seed || !authority) throw new Error("Initial Ingest discovery Seed or Hub authority is unavailable");
    const receipt = createInventoryReceipt({ seed, inventory: input.inventory,
      guidanceRequest: input.guidanceRequest, guidance: input.guidance,
      hubProfileId: authority.hubProfileId, publishedBase: authority.publishedBase,
      createdAt: input.createdAt ?? new Date().toISOString() });
    const existing = this.#receipts.get(receipt.id);
    if (existing && existing.digest !== receipt.digest) throw new Error("discovery Receipt identity collision");
    this.#persistReceipt(receipt);
    this.#receipts.set(receipt.id, existing ?? receipt);
    return existing ?? receipt;
  }

  resolveReceipt(id: string): InventoryReceipt | undefined {
    const active = this.#receipts.get(id);
    if (active) return active;
    const target = this.#receiptPath(id);
    if (!target || !fs.existsSync(target)) return undefined;
    const receipt = JSON.parse(fs.readFileSync(target, "utf8")) as InventoryReceipt;
    validateInventoryReceipt(receipt);
    this.#receipts.set(receipt.id, receipt);
    return receipt;
  }

  rebaseReceipt(id: string, publishedBase: string, createdAt?: string): InventoryReceipt | undefined {
    const receipt = this.resolveReceipt(id);
    if (!receipt) return undefined;
    const replacement = rebaseInventoryReceipt(receipt, publishedBase, createdAt);
    this.#persistReceipt(replacement);
    this.#receipts.set(replacement.id, replacement);
    return replacement;
  }

  capture(repositoryRoot: string): CallToolResult {
    const armed = this.#armed;
    if (!armed || fs.realpathSync(repositoryRoot) !== fs.realpathSync(armed.snapshot.analysisRoot)) {
      throw new Error("discovery requires the exact preflight-armed Initial Ingest repository");
    }
    if (this.#seed && [...this.#receipts.values()].some((receipt) => receipt.seedId === this.#seed!.id)) {
      throw new Error("discovery Seed is frozen by an Inventory Receipt; run a new preflight before discovery");
    }
    const direct = census(armed.snapshot.analysisRoot, "standard");
    const input = { snapshot: armed.snapshot, censusTruncated: direct.truncated, censusOversized: direct.oversized,
      census: direct.accounting, templateLimitations: direct.templateLimitations, signals: direct.signals };
    const seed = buildSeed(input);
    this.#captured = input;
    this.#seed = seed;
    return appendSeed({ content: [] }, seed);
  }

  clear(): void {
    this.#armed = undefined;
    this.#seed = undefined;
    this.#captured = undefined;
    this.#expanded = false;
  }
}
