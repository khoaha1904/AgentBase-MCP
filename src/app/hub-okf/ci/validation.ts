import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  getOkfConceptSchema,
  loadOkfBundle,
  parseQuestionDocument,
  readHubFreshness,
  readRepositoryIdentityRecord,
  validateAgentBaseDraft,
  validateBundleExternalIdentities,
  validateBundleObservedValues,
  validateConceptAgainstSchema,
  validateOkfRelationships,
  type HubFreshnessProjection,
  type OkfValue,
} from "../../../core/knowledge/index.ts";
import { validateSharedQuestionBundle } from "../authoring/questions.ts";
import {
  HUB_CI_FORMAT_VERSION,
  HUB_CI_MANIFEST_PATH,
  HUB_CI_VALIDATOR_PATH,
  HUB_CI_WORKFLOW_PATH,
  hubCiBytesDigest,
  renderHubCiWorkflow,
} from "./workflow.ts";

const MAX_FILES = 4096;
const MAX_FILE_BYTES = 256 * 1024;
const SECRET = /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b|[?&](?:X-Amz-Signature|token|secret)=[^\s&#]{16,})/i;
const SECRET_ASSIGNMENT = /(?:^|[\s"'])(?:password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|access[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9/+_.=-]{16,}/im;
const FORBIDDEN_PATH = /(?:^|\/)(?:\.env(?:\..*)?|credentials?|id_(?:rsa|dsa|ecdsa|ed25519)|[^/]+\.(?:pem|p12|pfx|key)|(?:graph|codegraph)\.(?:db|sqlite))$/i;
const CI_SUPPORT_FILES: ReadonlySet<string> = new Set([HUB_CI_WORKFLOW_PATH, HUB_CI_VALIDATOR_PATH, HUB_CI_MANIFEST_PATH]);

export type HubCiResult = Readonly<{
  passed: boolean;
  generated_at: string;
  tree_digest: string;
  errors: readonly string[];
  warnings: readonly string[];
  freshness: HubFreshnessProjection;
  summary_markdown: string;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function files(root: string): readonly string[] {
  const found: string[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name === ".git") continue;
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      if (entry.isSymbolicLink()) throw new Error(`${relative}: Hub symlinks are not allowed`);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) found.push(relative);
      if (found.length > MAX_FILES) throw new Error(`Hub contains more than ${MAX_FILES} files`);
    }
  };
  walk(root);
  return found.sort();
}

function treeDigest(root: string, relativeFiles: readonly string[]): string {
  const hash = createHash("sha256");
  for (const relative of relativeFiles) {
    const bytes = fs.readFileSync(path.join(root, ...relative.split("/")));
    hash.update(`${relative}\0${bytes.length}\0`); hash.update(bytes); hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

function indexTargetFailures(root: string, relativeFiles: readonly string[]): readonly string[] {
  const present = new Set(relativeFiles), failures: string[] = [];
  for (const relative of relativeFiles.filter((item) => path.posix.basename(item) === "index.md")) {
    const source = fs.readFileSync(path.join(root, ...relative.split("/")), "utf8");
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const raw = match[1]?.split("#")[0]?.split("?")[0];
      if (!raw || raw.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
      const target = raw.startsWith("/") ? path.posix.normalize(raw.slice(1))
        : path.posix.normalize(path.posix.join(path.posix.dirname(relative), raw));
      const resolved = target.endsWith("/") ? `${target}index.md` : target;
      if (resolved === ".." || resolved.startsWith("../") || !present.has(resolved)) {
        failures.push(`${relative}: index target is missing or unsafe: ${match[1]}`);
      }
    }
  }
  return failures;
}

function safety(root: string, relativeFiles: readonly string[]): Readonly<{ errors: readonly string[]; warnings: readonly string[] }> {
  const errors: string[] = [], warnings: string[] = [];
  for (const relative of relativeFiles) {
    const absolute = path.join(root, ...relative.split("/")), stat = fs.statSync(absolute);
    if (CI_SUPPORT_FILES.has(relative)) continue;
    if (FORBIDDEN_PATH.test(relative)) errors.push(`${relative}: secret/raw-state path is forbidden`);
    if (stat.size > MAX_FILE_BYTES) { errors.push(`${relative}: file exceeds ${MAX_FILE_BYTES} bytes`); continue; }
    let source: string;
    try { source = new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(absolute)); }
    catch { errors.push(`${relative}: Hub files must be valid UTF-8 text`); continue; }
    if (SECRET.test(source) || SECRET_ASSIGNMENT.test(source)) errors.push(`${relative}: obvious sensitive content detected`);
    if (!relative.endsWith(".md") && relative !== "README.md") {
      warnings.push(`${relative}: unrecognized Hub support file`);
    }
  }
  return { errors, warnings };
}

function validateCiSupport(root: string, relativeFiles: readonly string[]): readonly string[] {
  const errors: string[] = [];
  for (const required of CI_SUPPORT_FILES) if (!relativeFiles.includes(required)) errors.push(`${required}: required Hub CI file is missing`);
  if (!relativeFiles.includes(HUB_CI_WORKFLOW_PATH) || !relativeFiles.includes(HUB_CI_VALIDATOR_PATH)
    || !relativeFiles.includes(HUB_CI_MANIFEST_PATH)) return errors;
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, ...HUB_CI_MANIFEST_PATH.split("/")), "utf8")) as unknown;
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("manifest must be an object");
    const record = manifest as Record<string, unknown>, validator = record.validator;
    if (record.format !== HUB_CI_FORMAT_VERSION || !validator || typeof validator !== "object" || Array.isArray(validator)) {
      throw new Error("manifest format is invalid");
    }
    const value = validator as Record<string, unknown>;
    if (value.path !== HUB_CI_VALIDATOR_PATH || typeof value.version !== "string" || !/^\d+\.\d+\.\d+$/.test(value.version)
      || typeof value.sha256 !== "string" || !/^sha256:[a-f0-9]{64}$/.test(value.sha256)) {
      throw new Error("manifest validator identity is invalid");
    }
    const bytes = fs.readFileSync(path.join(root, ...HUB_CI_VALIDATOR_PATH.split("/")));
    const actual = hubCiBytesDigest(bytes);
    if (actual !== value.sha256) throw new Error("validator checksum mismatch");
    if (fs.readFileSync(path.join(root, ...HUB_CI_WORKFLOW_PATH.split("/")), "utf8") !== renderHubCiWorkflow(actual)) {
      throw new Error("workflow differs from the checksum-pinned released template");
    }
  } catch (error) {
    errors.push(`${HUB_CI_MANIFEST_PATH}: ${error instanceof Error ? error.message : "manifest validation failed"}`);
  }
  return errors;
}

function markdown(result: Omit<HubCiResult, "summary_markdown">): string {
  const lines = ["# AgentBase Hub CI", "", result.passed ? "✅ Integrity checks passed." : "❌ Integrity checks failed.", "",
    `- Tree: \`${result.tree_digest}\``, `- Repositories: ${result.freshness.summary.total}`,
    `- Observed checkpoints: ${result.freshness.summary.observed}`, `- Unknown checkpoints: ${result.freshness.summary.unknown}`];
  if (result.errors.length) lines.push("", "## Blocking errors", "", ...result.errors.map((value) => `- ${value}`));
  if (result.warnings.length) lines.push("", "## Warnings", "", ...result.warnings.map((value) => `- ${value}`));
  lines.push("", "## Repository freshness", "", "| Repository | Observed | Age (days) | Revision |", "|---|---:|---:|---|");
  for (const entry of result.freshness.repositories) lines.push(`| ${entry.title} (\`${entry.path}\`) | ${entry.observed_at ?? "unknown"} | ${entry.age_milliseconds === undefined ? "unknown" : Math.floor(entry.age_milliseconds / 86_400_000)} | \`${entry.source_revision ?? "unknown"}\` |`);
  if (!result.freshness.repositories.length) lines.push("| None | — | — | — |");
  lines.push("", "Freshness is warning context only; it does not trigger Refresh or mark knowledge incorrect.", "");
  return lines.join("\n");
}

export async function validateHubCi(
  hubRoot: string,
  now: () => Date = () => new Date(),
): Promise<HubCiResult> {
  const root = fs.realpathSync(path.resolve(hubRoot));
  if (!fs.statSync(root).isDirectory()) throw new Error("Hub CI root must be a directory");
  const relativeFiles = files(root), errors: string[] = [], warnings: string[] = [];
  const safe = safety(root, relativeFiles); errors.push(...safe.errors); warnings.push(...safe.warnings);
  errors.push(...validateCiSupport(root, relativeFiles));
  let bundle: ReturnType<typeof loadOkfBundle>;
  try { bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true }); }
  catch (error) {
    errors.push(error instanceof Error ? error.message : "Hub bundle validation failed");
    bundle = { root, concepts: new Map(), files: relativeFiles, warnings: [], treeDigest: treeDigest(root, relativeFiles) };
  }
  errors.push(...indexTargetFailures(root, relativeFiles));
  errors.push(...bundle.warnings);
  for (const concept of bundle.concepts.values()) {
    const generated = mapping(concept.frontmatter.generated);
    if (typeof generated?.by === "string" && generated.by.startsWith("agentbase/")) {
      errors.push(...validateAgentBaseDraft(concept));
    }
    if (getOkfConceptSchema(concept.type)) errors.push(...validateConceptAgainstSchema(concept));
    else if (concept.type !== "Question") warnings.push(`${concept.path}: custom OKF type ${concept.type} uses base validation only`);
    if (concept.type === "Question") {
      try { parseQuestionDocument(concept); }
      catch (error) { errors.push(error instanceof Error ? error.message : `${concept.path}: Question validation failed`); }
    }
  }
  if (bundle.concepts.size) {
    const relationships = validateOkfRelationships([...bundle.concepts].map(([identity, concept]) => ({ identity, concept })), {
      strictSourceIdentities: new Set([...bundle.concepts].filter(([, concept]) => Boolean(getOkfConceptSchema(concept.type))).map(([identity]) => identity)),
    });
    errors.push(...relationships.failures); warnings.push(...relationships.warnings);
  }
  errors.push(...validateBundleObservedValues(bundle.concepts.values()), ...validateBundleExternalIdentities(bundle.concepts.values()));
  const repositoryIds = new Map<string, string>();
  for (const concept of bundle.concepts.values()) {
    const identity = readRepositoryIdentityRecord(concept);
    if (!identity) continue;
    const previous = repositoryIds.get(identity.id);
    if (previous) errors.push(`${concept.path}: Repository ID ${identity.id} is already owned by ${previous}`);
    else repositoryIds.set(identity.id, concept.path);
  }
  try { validateSharedQuestionBundle(root); }
  catch (error) { errors.push(error instanceof Error ? error.message : "shared Question validation failed"); }
  const reader = {
    commit: treeDigest(root, relativeFiles),
    async listMarkdownPaths() { return relativeFiles.filter((relative) => relative.endsWith(".md")); },
    async readMarkdown(relative: string) { return fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"); },
  };
  const generatedAt = now();
  if (!Number.isFinite(generatedAt.getTime())) throw new Error("Hub CI report time is invalid");
  const freshness = await readHubFreshness(reader, () => generatedAt);
  const partial = { passed: errors.length === 0, generated_at: generatedAt.toISOString(),
    tree_digest: treeDigest(root, relativeFiles), errors: [...new Set(errors)].sort(),
    warnings: [...new Set(warnings)].sort(), freshness };
  return { ...partial, summary_markdown: markdown(partial) };
}
