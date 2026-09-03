import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildCodexArgs, isolateCodexEnvironment, portableAgentText, renderAgentPrompt,
} from "./benchmark-agent.mjs";
import { agentFailureFromEvents, seedPinnedContextHub } from "./benchmark-context.mjs";
import { benchmarkRoot, projectRoot } from "./benchmark-paths.mjs";

const ARMS = ["source-native", "source-plus-hub"];
const HUB_TOOL = "search_hub_okf";
const FIELDS = ["summary", "root_cause", "causal_chain", "minimal_repair", "ruled_out", "unknowns", "evidence_refs"];

const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const exact = (value, fields) => value && typeof value === "object" && !Array.isArray(value)
  && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...fields].sort());
const list = (value, label, failures, max = 24) => {
  if (!Array.isArray(value) || value.length > max) {
    failures.push(`${label} must be an array of at most ${max} values`);
    return false;
  }
  return true;
};
const text = (value, max, label, failures) => {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    failures.push(`${label} must be non-empty text of at most ${max} characters`);
  }
};

function resultObjects(result) {
  const values = [];
  if (result?.structured_content && typeof result.structured_content === "object") values.push(result.structured_content);
  if (result?.structuredContent && typeof result.structuredContent === "object") values.push(result.structuredContent);
  for (const block of result?.content ?? []) {
    if (block?.type !== "text" || typeof block.text !== "string") continue;
    try {
      const value = JSON.parse(block.text);
      if (value && typeof value === "object") values.push(value);
    } catch { /* Provider prose is not retained Hub evidence. */ }
  }
  return values;
}

function collectHubPaths(value, paths) {
  if (!value || typeof value !== "object") return;
  if (!Array.isArray(value) && typeof value.path === "string") paths.add(value.path);
  for (const child of Object.values(value)) collectHubPaths(child, paths);
}

function sourceObservations(command, output, sourceIds) {
  const repositories = new Set();
  const files = new Set();
  for (const id of sourceIds) {
    const marker = `repositories/${id}`;
    if (!command.includes(marker) && !output.includes(marker)) continue;
    repositories.add(id);
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const explicit = new RegExp(`repositories/${escaped}/([^\\s:'\"),;]+\\.[a-zA-Z0-9_.-]+)`, "g");
    const content = new RegExp(`(?:^|\\n)repositories/${escaped}/([^:\\n]+):(\\d+)(?::|-)`, "g");
    for (const match of command.matchAll(explicit)) files.add(`${id}/${match[1]}`);
    for (const match of output.matchAll(content)) files.add(`${id}/${match[1]}`);
  }
  return { repositories, files };
}

export function validateIncidentSession(events, { arm, sources, hub, limits = {} }) {
  if (!ARMS.includes(arm)) throw new Error(`unknown incident benchmark arm: ${arm}`);
  const failures = [], calls = [], commands = [], repositories = new Set(), files = new Set(), hubPaths = new Set();
  let sourceResultBytes = 0, hubResultBytes = 0, completedSearches = 0, firstRootEvidenceCommand = null;
  let accumulatedSource = "";
  const sourceIds = sources.map((source) => source.id);
  for (const [lineNo, line] of String(events ?? "").split("\n").entries()) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { failures.push(`malformed event JSON at line ${lineNo + 1}`); continue; }
    if (event?.type !== "item.completed") continue;
    const item = event.item;
    if (["file_change", "web_search"].includes(item?.type)) failures.push(`forbidden agent activity observed: ${item.type}`);
    if (item?.type === "command_execution") {
      const output = item.status === "completed" ? item.aggregated_output ?? "" : "";
      commands.push({ command: item.command ?? null, status: item.status ?? null,
        resultBytes: Buffer.byteLength(output) });
      sourceResultBytes += Buffer.byteLength(output);
      const observed = sourceObservations(item.command ?? "", output, sourceIds);
      for (const repository of observed.repositories) repositories.add(repository);
      for (const file of observed.files) files.add(file);
      accumulatedSource += `\n${item.command ?? ""}\n${output}`;
      if (firstRootEvidenceCommand === null && /crawler-publisher\/src\/handler\.py|Payload=json\.dumps/.test(accumulatedSource)
        && /CRAWLER_NAME/.test(accumulatedSource)) firstRootEvidenceCommand = commands.length;
      continue;
    }
    if (item?.type !== "mcp_tool_call") continue;
    calls.push({ tool: item.tool ?? null, arguments: item.arguments ?? null, status: item.status ?? null });
    if (arm === "source-native") {
      failures.push(`source-native arm must not call MCP: ${item.tool ?? "unknown"}`);
      continue;
    }
    if (item.tool !== HUB_TOOL) {
      failures.push(`MCP tool is not allowed: ${item.tool ?? "unknown"}`);
      continue;
    }
    if (item.arguments?.domain !== hub.domain || item.arguments?.global === true) {
      failures.push(`Hub search must remain scoped to ${hub.domain}`);
    }
    if (!Number.isInteger(item.arguments?.limit) || item.arguments.limit < 1
      || item.arguments.limit > (limits.hubResultLimit ?? 5)) failures.push("Hub search limit is invalid");
    if (item.status !== "completed") continue;
    completedSearches += 1;
    hubResultBytes += Buffer.byteLength(JSON.stringify(item.result ?? null));
    const objects = resultObjects(item.result);
    if (!objects.length) failures.push("Hub search completed without a structured JSON result");
    for (const object of objects) {
      if (object.commit !== hub.commit) failures.push(`Hub search is not pinned to ${hub.commit}`);
      collectHubPaths(object, hubPaths);
    }
  }
  if (commands.length > (limits.sourceCommands ?? 30)) failures.push(`source command limit exceeded: ${commands.length}`);
  if (sourceResultBytes > (limits.sourceResultBytes ?? 512 * 1024)) failures.push("source result byte limit exceeded");
  if (arm === "source-plus-hub") {
    if (completedSearches !== 1 || calls.length !== 1) failures.push(`Hub arm must complete exactly one search; observed ${completedSearches}`);
    if (hubResultBytes > (limits.hubResultBytes ?? 32 * 1024)) failures.push("Hub result byte limit exceeded");
  }
  return { failures: [...new Set(failures)], trace: {
    calls, commands, sourceCommands: commands.length, sourceResultBytes, hubResultBytes,
    repositoriesInspected: [...repositories].sort(), filesInspected: [...files].sort(),
    firstRootEvidenceCommand, hubPaths: [...hubPaths].sort(),
  } };
}

export function validateIncidentDiagnosis(value, { arm, sources, hub, trace }) {
  const failures = [];
  if (!exact(value, FIELDS)) return { failures: ["incident diagnosis must contain the exact contract fields"] };
  text(value.summary, 1600, "summary", failures);
  const sourceIdentity = (value) => sources.find((source) => value === source.id || value === `repositories/${source.id}`);
  if (!exact(value.root_cause, ["repository", "summary", "evidence_refs"])) failures.push("root_cause has invalid fields");
  else {
    text(value.root_cause.repository, 120, "root_cause.repository", failures);
    if (!sourceIdentity(value.root_cause.repository)) failures.push("root_cause.repository is unknown");
    text(value.root_cause.summary, 1000, "root_cause.summary", failures);
  }
  if (!exact(value.minimal_repair, ["repository", "path", "summary", "evidence_refs"])) failures.push("minimal_repair has invalid fields");
  else {
    text(value.minimal_repair.repository, 120, "minimal_repair.repository", failures);
    if (!sourceIdentity(value.minimal_repair.repository)) failures.push("minimal_repair.repository is unknown");
    text(value.minimal_repair.path, 500, "minimal_repair.path", failures);
    text(value.minimal_repair.summary, 1000, "minimal_repair.summary", failures);
  }
  const refs = new Map();
  const sourceById = new Map(sources.flatMap((source) => [[source.id, source], [`repositories/${source.id}`, source]]));
  if (list(value.evidence_refs, "evidence_refs", failures, 32)) {
    for (const [index, ref] of value.evidence_refs.entries()) {
      if (!exact(ref, ["id", "kind", "repository", "path", "start_line", "end_line", "commit"])) {
        failures.push(`evidence_refs[${index}] has invalid fields`); continue;
      }
      text(ref.id, 100, `evidence_refs[${index}].id`, failures);
      text(ref.path, 500, `evidence_refs[${index}].path`, failures);
      if (refs.has(ref.id)) failures.push(`duplicate evidence ref ID: ${ref.id}`);
      refs.set(ref.id, ref);
      if (ref.kind === "source") {
        const source = sourceById.get(ref.repository);
        if (!source) { failures.push(`evidence_refs[${index}] names an unknown source repository`); continue; }
        if (ref.commit !== source.commit) failures.push(`evidence_refs[${index}] is not pinned to its source commit`);
        const safe = typeof ref.path === "string" && !path.isAbsolute(ref.path) && !ref.path.split(/[\\/]/).includes("..");
        const absolute = safe ? path.join(source.root, ref.path) : "";
        if (!safe || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) failures.push(`evidence_refs[${index}] source path does not exist`);
        else if (!Number.isInteger(ref.start_line) || !Number.isInteger(ref.end_line) || ref.start_line < 1
          || ref.end_line < ref.start_line || ref.end_line > fs.readFileSync(absolute, "utf8").split("\n").length) {
          failures.push(`evidence_refs[${index}] has invalid source line bounds`);
        }
      } else if (ref.kind === "hub") {
        if (arm !== "source-plus-hub") failures.push(`Hub evidence is unavailable in ${arm}`);
        if (ref.repository !== null || ref.start_line !== null || ref.end_line !== null) failures.push("Hub evidence repository and lines must be null");
        if (ref.commit !== hub.commit) failures.push("Hub evidence is not pinned to the Published commit");
        if (!trace.hubPaths.includes(ref.path)) failures.push("Hub evidence path is absent from the retained search");
      } else failures.push(`evidence_refs[${index}] has unsupported kind`);
    }
  }
  const validateRefList = (ids, label, requireSource = false) => {
    if (!Array.isArray(ids) || !ids.length || ids.some((id) => typeof id !== "string" || !refs.has(id))) {
      failures.push(`${label} must contain resolved evidence-ref IDs`); return;
    }
    if (requireSource && !ids.some((id) => refs.get(id)?.kind === "source")) failures.push(`${label} needs source evidence`);
  };
  if (exact(value.root_cause, ["repository", "summary", "evidence_refs"])) validateRefList(value.root_cause.evidence_refs, "root_cause.evidence_refs", true);
  if (exact(value.minimal_repair, ["repository", "path", "summary", "evidence_refs"])) validateRefList(value.minimal_repair.evidence_refs, "minimal_repair.evidence_refs", true);
  if (list(value.causal_chain, "causal_chain", failures)) {
    if (value.causal_chain.length < 2) failures.push("causal_chain must contain at least two steps");
    for (const [index, step] of value.causal_chain.entries()) {
      if (!exact(step, ["step", "repository", "claim", "evidence_refs"])) { failures.push(`causal_chain[${index}] has invalid fields`); continue; }
      if (!Number.isInteger(step.step) || step.step !== index + 1) failures.push(`causal_chain[${index}].step is invalid`);
      text(step.repository, 120, `causal_chain[${index}].repository`, failures);
      if (!sourceIdentity(step.repository)) failures.push(`causal_chain[${index}].repository is unknown`);
      text(step.claim, 1000, `causal_chain[${index}].claim`, failures);
      validateRefList(step.evidence_refs, `causal_chain[${index}].evidence_refs`, true);
    }
  }
  for (const field of ["ruled_out", "unknowns"]) if (list(value[field], field, failures)) {
    for (const [index, item] of value[field].entries()) text(item, 700, `${field}[${index}]`, failures);
  }
  if (arm === "source-plus-hub" && ![...refs.values()].some((ref) => ref.kind === "hub")) failures.push("Hub arm must retain Hub routing evidence");
  if (arm === "source-native" && [...refs.values()].some((ref) => ref.kind === "hub")) failures.push("source-native arm cannot cite Hub evidence");
  const limits = JSON.stringify(value.unknowns).toLowerCase();
  if (!limits.includes("runtime") && !limits.includes("deployed") && !limits.includes("live")) failures.push("unknowns must preserve the runtime-proof limit");
  if (arm === "source-plus-hub" && !limits.includes("revision") && !limits.includes("snapshot")) {
    failures.push("Hub arm must preserve the Published snapshot/revision limit");
  }
  return { failures: [...new Set(failures)] };
}

const outputText = (value) => JSON.stringify(value).toLowerCase();
export function scoreIncidentDiagnosis(value, expectations) {
  const body = outputText(value);
  const matched = { critical: [], important: [], optional: [] };
  for (const probe of expectations.probes ?? []) {
    if ((probe.allTerms ?? []).every((term) => body.includes(term.toLowerCase()))) matched[probe.priority].push(probe.id);
  }
  const unsupportedClaims = (expectations.unsupportedClaims ?? [])
    .filter((probe) => (probe.phrases ?? []).some((phrase) => body.includes(phrase.toLowerCase()))
      || (probe.allTerms?.length && probe.allTerms.every((term) => body.includes(term.toLowerCase()))))
    .map((probe) => probe.id);
  return { matched, unsupportedClaims };
}

const usageTotal = (run) => (run.usage?.inputTokens ?? 0) + (run.usage?.outputTokens ?? 0);
export function compareIncidentPair(runs, expectations) {
  const scores = Object.fromEntries(ARMS.map((arm) => [arm, scoreIncidentDiagnosis(runs[arm].output, expectations)]));
  const qualifications = Object.fromEntries(ARMS.map((arm) => [arm, runs[arm].qualification]));
  if (ARMS.some((arm) => qualifications[arm].status !== "passed")) {
    return { status: "incomplete", ownerReview: "not_required", qualifications, scores, reasons: ["one or more arms failed deterministic admission"] };
  }
  const control = scores[ARMS[0]], assisted = scores[ARMS[1]];
  const newCritical = assisted.matched.critical.filter((id) => !control.matched.critical.includes(id));
  const newImportant = assisted.matched.important.filter((id) => !control.matched.important.includes(id));
  const criticalRegression = control.matched.critical.filter((id) => !assisted.matched.critical.includes(id));
  const sourceCommandDelta = runs[ARMS[1]].trace.sourceCommands - runs[ARMS[0]].trace.sourceCommands;
  const firstRootEvidenceCommandDelta = (runs[ARMS[1]].trace.firstRootEvidenceCommand ?? Infinity)
    - (runs[ARMS[0]].trace.firstRootEvidenceCommand ?? Infinity);
  const elapsedMsDelta = runs[ARMS[1]].elapsedMs - runs[ARMS[0]].elapsedMs;
  const tokenDelta = usageTotal(runs[ARMS[1]]) - usageTotal(runs[ARMS[0]]);
  const sourceResultBytesDelta = (runs[ARMS[1]].trace.sourceResultBytes ?? 0) - (runs[ARMS[0]].trace.sourceResultBytes ?? 0);
  const totalResultBytesDelta = ((runs[ARMS[1]].trace.sourceResultBytes ?? 0) + (runs[ARMS[1]].trace.hubResultBytes ?? 0))
    - ((runs[ARMS[0]].trace.sourceResultBytes ?? 0) + (runs[ARMS[0]].trace.hubResultBytes ?? 0));
  const navigationGainCandidate = sourceCommandDelta < 0 || firstRootEvidenceCommandDelta < 0;
  const costReductionCandidate = elapsedMsDelta < 0 && tokenDelta < 0;
  const status = criticalRegression.length || assisted.unsupportedClaims.length ? "needs_revision"
    : newCritical.length || newImportant.length || navigationGainCandidate || costReductionCandidate ? "needs_review" : "no_measured_gain";
  return { status, ownerReview: status === "needs_review" ? "pending" : "not_required", qualifications, scores,
    newCritical, newImportant, criticalRegression, navigationGainCandidate, costReductionCandidate,
    sourceCommandDelta, firstRootEvidenceCommandDelta: Number.isFinite(firstRootEvidenceCommandDelta) ? firstRootEvidenceCommandDelta : null,
    sourceResultBytesDelta, totalResultBytesDelta, elapsedMsDelta, tokenDelta, reasons: [] };
}

function git(cwd, args) {
  return spawnSync("git", args, { cwd, encoding: "utf8", timeout: 120_000, maxBuffer: 10 * 1024 * 1024 });
}

function sourceFixtures(manifest) {
  return manifest.sources.map((source) => ({ ...source, root: path.resolve(benchmarkRoot(), source.path) }));
}

export function verifyIncidentSources(sources) {
  for (const source of sources) {
    if (!/^[a-f0-9]{40}$/.test(source.commit)) throw new Error(`source ${source.id} must use a full commit`);
    const revision = git(source.root, ["rev-parse", "HEAD"]);
    if (revision.status !== 0 || revision.stdout.trim() !== source.commit) throw new Error(`source ${source.id} must be pinned to ${source.commit}`);
    const status = git(source.root, ["status", "--porcelain=v1", "--untracked-files=all"]);
    if (status.status !== 0 || status.stdout.trim()) throw new Error(`source ${source.id} must have a clean working tree`);
  }
}

function prepareWorkspace(sources, parent) {
  const workspace = path.join(parent, "workspace");
  const repositories = path.join(workspace, "repositories");
  fs.mkdirSync(repositories, { recursive: true });
  for (const source of sources) {
    const destination = path.join(repositories, source.id);
    const clone = spawnSync("git", ["clone", "--quiet", "--no-hardlinks", source.root, destination], { encoding: "utf8", timeout: 120_000 });
    if (clone.status !== 0) throw new Error(clone.stderr.trim() || `could not clone ${source.id}`);
    const checkout = git(destination, ["checkout", "--quiet", "--detach", source.commit]);
    if (checkout.status !== 0) throw new Error(checkout.stderr.trim() || `could not checkout ${source.id}`);
  }
  return workspace;
}

function usage(events) {
  for (const line of String(events).trim().split("\n").reverse()) try {
    const event = JSON.parse(line);
    if (event?.type === "turn.completed") return { inputTokens: event.usage?.input_tokens ?? null, outputTokens: event.usage?.output_tokens ?? null };
  } catch { /* ignore non-events */ }
  return null;
}

export async function executeIncidentArm({ arm, manifest, prompt, directory }) {
  const sources = sourceFixtures(manifest);
  verifyIncidentSources(sources);
  const version = spawnSync(manifest.agent.executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  if (version.status !== 0 || version.stdout.trim() !== manifest.agent.version) throw new Error(`expected ${manifest.agent.version}, found ${version.stdout.trim() || "unavailable"}`);
  fs.mkdirSync(directory, { recursive: true });
  const workspaceParent = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-incident-workspace-"));
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-incident-runtime-"));
  const finalMessage = path.join(directory, ".agent-final.tmp");
  try {
    for (const name of ["tmp", "agentbase", "home", "config", "data"]) fs.mkdirSync(path.join(runtimeRoot, name), { recursive: true, mode: 0o700 });
    const workspace = prepareWorkspace(sources, workspaceParent);
    const capability = arm === "source-native"
      ? "Use ordinary bounded read-only shell search across all listed repositories. AgentBase and Code Graph are unavailable."
      : `Use ordinary bounded read-only shell search across all listed repositories plus exactly one search_hub_okf call scoped with domain=${manifest.hub.domain}, limit <= 5 and no exact read. Hub is routing evidence, not causal or runtime proof.`;
    const renderedPrompt = renderAgentPrompt(prompt, { INCIDENT: manifest.incident,
      SOURCE_INVENTORY: sources.map((source) => `- repositories/${source.id} @ ${source.commit}`).join("\n"), ARM_CAPABILITY: capability });
    const args = buildCodexArgs({ workspace, finalMessage, model: manifest.agent.model,
      reasoningEffort: manifest.agent.reasoningEffort, arm: arm === "source-native" ? "direct" : "mcp",
      disableShell: false, sandbox: "read-only", runtimeRoot,
      enabledTools: arm === "source-plus-hub" ? [HUB_TOOL] : undefined,
      ...(arm === "source-plus-hub" ? { mcpEntryPoint: path.join(projectRoot, "scripts", "benchmark", "benchmark-agentbase-mcp.mjs") } : {}) });
    let environment = { ...process.env, TMPDIR: path.join(runtimeRoot, "tmp"), AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"),
      HOME: path.join(runtimeRoot, "home"), XDG_CONFIG_HOME: path.join(runtimeRoot, "config"), XDG_DATA_HOME: path.join(runtimeRoot, "data") };
    if (arm === "source-plus-hub") ({ environment } = seedPinnedContextHub(runtimeRoot, manifest.hub));
    environment = isolateCodexEnvironment(runtimeRoot, environment);
    const started = Date.now();
    const result = spawnSync(manifest.agent.executable, args, { cwd: projectRoot, input: renderedPrompt, encoding: "utf8",
      timeout: manifest.agent.timeoutMs, maxBuffer: 50 * 1024 * 1024, env: environment });
    const events = portableAgentText(result.stdout || "", { repository: workspace, workspace, runtimeRoot });
    const finalText = fs.existsSync(finalMessage) ? fs.readFileSync(finalMessage, "utf8") : "";
    const output = (() => { try { return JSON.parse(finalText); } catch { return {}; } })();
    const admitted = validateIncidentSession(events, { arm, sources, hub: manifest.hub, limits: manifest.limits });
    const diagnosis = validateIncidentDiagnosis(output, { arm, sources, hub: manifest.hub, trace: admitted.trace });
    const eventFailure = agentFailureFromEvents(events);
    const failures = [...admitted.failures, ...diagnosis.failures,
      ...(result.status === 0 && !result.error && !eventFailure ? [] : [`agent process failed: ${result.error?.message ?? eventFailure ?? result.status}`])];
    const run = { suite: manifest.suite, arm, kind: "real", promptVersion: manifest.promptVersion,
      evaluationProfile: manifest.evaluationProfile,
      promptDigest: digest(renderedPrompt), sourceCommits: Object.fromEntries(sources.map((source) => [source.id, source.commit])),
      hubCommit: arm === "source-plus-hub" ? manifest.hub.commit : null,
      process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? eventFailure },
      elapsedMs: Date.now() - started, usage: usage(events), output, trace: admitted.trace,
      qualification: { status: failures.length ? "failed" : "passed", failures: [...new Set(failures)] } };
    fs.writeFileSync(path.join(directory, "prompt.md"), renderedPrompt);
    fs.writeFileSync(path.join(directory, "agent-events.jsonl"), events);
    fs.writeFileSync(path.join(directory, "agent-final.txt"), finalText);
    writeJson(path.join(directory, "run.json"), run);
    return run;
  } finally {
    fs.rmSync(finalMessage, { force: true });
    fs.rmSync(workspaceParent, { recursive: true, force: true });
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

function loadSuite(suite) {
  const candidates = [];
  for (const domain of fs.readdirSync(path.join(benchmarkRoot(), "suites"))) {
    const file = path.join(benchmarkRoot(), "suites", domain, suite, "manifest.json");
    if (fs.existsSync(file)) candidates.push(file);
  }
  if (candidates.length !== 1) throw new Error(`expected exactly one incident suite named ${suite}`);
  const manifest = JSON.parse(fs.readFileSync(candidates[0], "utf8"));
  return { manifest, directory: path.dirname(candidates[0]) };
}
const validRunId = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/.test(value)) throw new Error("run ID must be UTC YYYY-MM-DDTHH-MM-SSZ");
  return value;
};

async function main(argv) {
  const [command, suiteName, idArg] = argv;
  if (!command || !suiteName) throw new Error("usage: benchmark:incident <pair|compare> <suite> [UTC-run-id]");
  const { manifest, directory } = loadSuite(suiteName);
  const id = validRunId(idArg ?? new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z"));
  const base = path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, id);
  if (command === "pair") {
    const prompt = fs.readFileSync(path.join(benchmarkRoot(), "prompts", `${manifest.promptVersion}.md`), "utf8");
    fs.mkdirSync(base, { recursive: true });
    const runs = {};
    for (const arm of ARMS) runs[arm] = await executeIncidentArm({ arm, manifest, prompt, directory: path.join(base, arm) });
    writeJson(path.join(base, "pair.json"), runs);
    process.stdout.write(`${base}\n`);
    return;
  }
  if (command !== "compare") throw new Error(`unknown incident benchmark command: ${command}`);
  const sources = sourceFixtures(manifest);
  verifyIncidentSources(sources);
  const runs = Object.fromEntries(ARMS.map((arm) => {
    const runDirectory = path.join(base, arm);
    const run = JSON.parse(fs.readFileSync(path.join(runDirectory, "run.json"), "utf8"));
    const events = fs.readFileSync(path.join(runDirectory, "agent-events.jsonl"), "utf8");
    const admitted = validateIncidentSession(events, { arm, sources, hub: manifest.hub, limits: manifest.limits });
    const diagnosis = validateIncidentDiagnosis(run.output, { arm, sources, hub: manifest.hub, trace: admitted.trace });
    const failures = [...admitted.failures, ...diagnosis.failures];
    return [arm, { ...run, trace: admitted.trace,
      qualification: { status: failures.length ? "failed" : "passed", failures: [...new Set(failures)] } }];
  }));
  const expectations = JSON.parse(fs.readFileSync(path.join(directory, manifest.expectation), "utf8"));
  const comparison = { suite: manifest.suite, runId: id, evaluationProfile: manifest.evaluationProfile,
    ...compareIncidentPair(runs, expectations) };
  writeJson(path.join(base, "comparison.json"), comparison);
  process.stdout.write(`${comparison.status}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
}
