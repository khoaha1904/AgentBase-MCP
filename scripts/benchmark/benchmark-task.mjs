import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildCodexArgs, isolateCodexEnvironment, portableAgentText, renderAgentPrompt,
} from "./benchmark-agent.mjs";
import { seedPinnedContextHub } from "./benchmark-context.mjs";
import { benchmarkRoot, projectRoot, setBenchmarkRoot } from "./benchmark-paths.mjs";

const ARMS = ["source-native", "source-plus-graph", "source-plus-graph-plus-hub"];
const PAIR_ARMS = ARMS.slice(0, 2);
const TRACKER_TOOLS = new Set(["search_tracker", "get_tracker_artifact", "list_tracker_relations"]);
const GRAPH_TOOLS = new Set(["index_repository", "get_architecture", "search_graph", "trace_path", "get_code_snippet", "search_code", "index_status", "check_index_coverage"]);
const GRAPH_NAVIGATION_TOOLS = new Set(["get_architecture", "search_graph", "trace_path", "get_code_snippet", "search_code", "check_index_coverage"]);
const HUB_TOOLS = new Set(["search_hub_okf", "read_hub_okf_concept"]);
const FIELDS = ["summary", "tasks", "questions", "known_unknowns", "evidence_refs"];

const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); };
function exact(value, fields) { return value && typeof value === "object" && !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...fields].sort()); }
function text(value, max, label, failures) { if (typeof value !== "string" || !value.trim() || value.length > max) failures.push(`${label} must be non-empty text <= ${max} chars`); }
function list(value, label, failures, maximum = 16) { if (!Array.isArray(value) || value.length > maximum) { failures.push(`${label} must be an array of <= ${maximum} items`); return false; } return true; }

function resultObjects(result) {
  const values = [];
  if (result?.structured_content && typeof result.structured_content === "object") values.push(result.structured_content);
  if (result?.structuredContent && typeof result.structuredContent === "object") values.push(result.structuredContent);
  for (const block of result?.content ?? []) if (block?.type === "text" && typeof block.text === "string") {
    try { const parsed = JSON.parse(block.text); if (parsed && typeof parsed === "object") values.push(parsed); } catch { /* prose is not trace evidence */ }
  }
  return values;
}

function collectPaths(value, paths) {
  if (typeof value === "string") {
    for (const match of value.matchAll(/(?:<OUTPUT_ROOT>\/|[A-Za-z]:[\\/]|\/)?[A-Za-z0-9_.-]+(?:[\\/][A-Za-z0-9_.-]+)*\.(?:py|js|ts|tf|yml|yaml|json|md)(?::\d+(?:-\d+)?)?/g)) paths.add(match[0]);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (["path", "file", "file_path", "relative_path"].includes(key) && typeof child === "string") paths.add(child);
    collectPaths(child, paths);
  }
}

export function validateTaskSession(events, { arm, sourceCommit, sourceRoot, tracker = null, limits = {} }) {
  if (!ARMS.includes(arm)) throw new Error(`unknown task benchmark arm: ${arm}`);
  const failures = []; const calls = []; const commands = []; const paths = new Set();
  let indexCalls = 0; let graphCalls = 0; let trackerCalls = 0; let hubSearches = 0; let hubReads = 0;
  let sourceCommands = 0; let sourceResultBytes = 0; let graphResultBytes = 0; let hubResultBytes = 0;
  for (const [lineNo, line] of String(events ?? "").split("\n").entries()) {
    if (!line.trim()) continue;
    let event; try { event = JSON.parse(line); } catch { failures.push(`malformed event JSON at line ${lineNo + 1}`); continue; }
    if (event?.type !== "item.completed") continue;
    const item = event.item;
    if (item?.type === "file_change") { failures.push("source mutation is forbidden"); continue; }
    if (item?.type === "command_execution") {
      commands.push({ command: item.command ?? null, status: item.status ?? null });
      if (item.status === "completed") {
        sourceCommands += 1;
        sourceResultBytes += Buffer.byteLength(item.aggregated_output ?? "");
        collectPaths(item.aggregated_output ?? "", paths);
      }
      continue;
    }
    if (item?.type !== "mcp_tool_call") continue;
    const tool = item.tool; const trackerTool = TRACKER_TOOLS.has(tool); const graphTool = GRAPH_TOOLS.has(tool);
    const hubTool = HUB_TOOLS.has(tool);
    calls.push({ tool, status: item.status ?? null, arguments: item.arguments ?? null });
    if (!trackerTool && !graphTool && !hubTool) { failures.push(`MCP tool is not allowed: ${tool ?? "unknown"}`); continue; }
    if (trackerTool) { trackerCalls += item.status === "completed" ? 1 : 0; continue; }
    if (hubTool) {
      if (item.status === "completed") {
        if (tool === "search_hub_okf") hubSearches += 1; else hubReads += 1;
        hubResultBytes += Buffer.byteLength(JSON.stringify(item.result ?? null));
        for (const object of resultObjects(item.result)) collectPaths(object, paths);
      }
      continue;
    }
    graphCalls += 1; if (tool === "index_repository") {
      indexCalls += 1;
      if (item.arguments?.repo_path !== "<OUTPUT_ROOT>") failures.push("index_repository must bind the pinned source root");
      if (item.arguments?.persistence === true || item.arguments?.target_projects) failures.push("index_repository used forbidden persistence/cross-repository arguments");
    }
    if (item.status !== "completed") continue;
    graphResultBytes += Buffer.byteLength(JSON.stringify(item.result ?? null));
    for (const object of resultObjects(item.result)) collectPaths(object, paths);
  }
  if (tracker && trackerCalls > (tracker.calls ?? 8)) failures.push(`tracker call limit exceeded: ${trackerCalls}/${tracker.calls}`);
  if (tracker && trackerCalls < 1) failures.push("at least one completed tracker call is required");
  if (sourceCommands > (limits.sourceCommands ?? 10)) failures.push(`source command limit exceeded: ${sourceCommands}/${limits.sourceCommands ?? 10}`);
  if (sourceResultBytes > (limits.sourceResultBytes ?? 96 * 1024)) failures.push(`source result byte limit exceeded: ${sourceResultBytes}/${limits.sourceResultBytes ?? 96 * 1024}`);
  if (arm === "source-native" && graphCalls) failures.push("source-native arm must not call Code Graph");
  if (arm !== "source-plus-graph-plus-hub" && (hubSearches || hubReads)) failures.push(`${arm} must not query Hub`);
  if (arm !== "source-native") {
    if (indexCalls !== 1) failures.push(`assisted arm must index exactly once; observed ${indexCalls}`);
    if (graphCalls > (limits.graphCalls ?? 12)) failures.push(`graph call limit exceeded: ${graphCalls}/${limits.graphCalls}`);
    if (graphResultBytes > (limits.graphResultBytes ?? limits.resultBytes ?? 96 * 1024)) failures.push(`graph result byte limit exceeded: ${graphResultBytes}/${limits.graphResultBytes ?? limits.resultBytes ?? 96 * 1024}`);
    if (!calls.some((call) => GRAPH_NAVIGATION_TOOLS.has(call.tool) && call.status === "completed")) failures.push("assisted arm needs bounded graph navigation");
  }
  if (arm === "source-plus-graph-plus-hub") {
    if (hubSearches !== 1) failures.push(`Hub arm must search exactly once; observed ${hubSearches}`);
    if (hubReads) failures.push("Hub arm must not perform exact reads");
    if (hubResultBytes > (limits.hubResultBytes ?? 32 * 1024)) failures.push(`Hub result byte limit exceeded: ${hubResultBytes}/${limits.hubResultBytes ?? 32 * 1024}`);
  }
  return { failures: [...new Set(failures)], trace: { sourceCommit, sourceRoot, calls, commands,
    graphCalls, indexCalls, trackerCalls, hubSearches, hubReads, sourceCommands, sourceResultBytes,
    graphResultBytes, hubResultBytes, paths: [...paths].sort() } };
}

export function validateTaskPlan(value, { arm, trace, sourceCommit, sourceRoot, hubCommit = null }) {
  const failures = [];
  if (!exact(value, FIELDS)) return { failures: ["task plan must contain the exact contract fields"] };
  text(value.summary, 1200, "summary", failures);
  const ids = new Set();
  if (list(value.tasks, "tasks", failures)) {
    if (!value.tasks.length) failures.push("tasks must contain at least one task");
    for (const [i, task] of value.tasks.entries()) {
    if (!exact(task, ["id", "title", "reason", "scope", "dependencies", "acceptance", "evidence_refs"])) { failures.push(`tasks[${i}] has invalid fields`); continue; }
    for (const key of ["id", "title", "reason"]) text(task[key], 500, `tasks[${i}].${key}`, failures);
    if (ids.has(task.id)) failures.push(`duplicate task ID: ${task.id}`); ids.add(task.id);
    for (const key of ["scope", "dependencies", "acceptance", "evidence_refs"]) {
      if (!list(task[key], `tasks[${i}].${key}`, failures)) continue;
      if (task[key].some((item) => typeof item !== "string" || !item.trim())) failures.push(`tasks[${i}].${key} must contain only non-empty strings`);
    }
    }
    for (const task of value.tasks) for (const dependency of task.dependencies ?? []) if (!ids.has(dependency)) failures.push(`task ${task.id} contains unknown dependency: ${dependency}`);
  }
  if (list(value.evidence_refs, "evidence_refs", failures, 32)) {
    if (!value.evidence_refs.some((ref) => ref?.kind === "source")) failures.push("every arm must emit source evidence");
    if (arm === "source-plus-graph-plus-hub" && !value.evidence_refs.some((ref) => ref?.kind === "hub")) failures.push("Hub arm must emit Hub evidence");
    const refs = new Map();
    for (const [i, ref] of value.evidence_refs.entries()) {
      if (!exact(ref, ["id", "kind", "path", "start_line", "end_line", "commit"])) { failures.push(`evidence_refs[${i}] has invalid fields`); continue; }
      text(ref.id, 100, `evidence_refs[${i}].id`, failures); text(ref.path, 500, `evidence_refs[${i}].path`, failures); text(ref.commit, 100, `evidence_refs[${i}].commit`, failures);
      if (refs.has(ref.id)) failures.push(`duplicate evidence ref ID: ${ref.id}`); refs.set(ref.id, ref);
      if (ref.kind === "source") {
        if (!Number.isInteger(ref.start_line) || !Number.isInteger(ref.end_line) || ref.start_line < 1 || ref.end_line < ref.start_line) failures.push(`evidence_refs[${i}] has invalid source line bounds`);
        if (ref.commit !== sourceCommit) failures.push(`evidence_refs[${i}] is not pinned to ${sourceCommit}`);
        const safePath = typeof ref.path === "string" && !path.isAbsolute(ref.path) && !ref.path.split(/[\\/]/).includes("..");
        const absolute = safePath && sourceRoot ? path.join(sourceRoot, ref.path) : "";
        if (!safePath || !absolute || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) failures.push(`evidence_refs[${i}] source path does not exist`);
        else if (ref.end_line > fs.readFileSync(absolute, "utf8").split("\n").length) failures.push(`evidence_refs[${i}] exceeds source line count`);
      } else if (ref.kind === "hub") {
        if (arm !== "source-plus-graph-plus-hub") failures.push(`evidence_refs[${i}] Hub evidence is unavailable in ${arm}`);
        if (ref.start_line !== null || ref.end_line !== null) failures.push(`evidence_refs[${i}] Hub line bounds must be null`);
        if (!hubCommit || ref.commit !== hubCommit) failures.push(`evidence_refs[${i}] is not pinned to the Published Hub commit`);
        if (!trace.paths.some((candidate) => candidate === ref.path || candidate.endsWith(`/${ref.path}`))) failures.push(`evidence_refs[${i}] path is absent from the Hub trace`);
      } else failures.push(`evidence_refs[${i}] has unsupported kind`);
    }
    for (const task of value.tasks ?? []) for (const id of task.evidence_refs ?? []) if (!refs.has(id)) failures.push(`task ${task.id} contains unresolved evidence ref: ${id}`);
  }
  for (const key of ["questions", "known_unknowns"]) if (list(value[key], key, failures)) for (const [i, item] of value[key].entries()) text(item, 500, `${key}[${i}]`, failures);
  return { failures: [...new Set(failures)] };
}

function planText(plan) { return JSON.stringify(plan).toLowerCase(); }
function has(plan, terms) { const value = planText(plan); return terms.every((term) => value.includes(term.toLowerCase())); }
export function scoreTaskPlan(plan, expectations) {
  const matched = { critical: [], important: [], optional: [] };
  for (const probe of expectations.probes ?? []) if (has(plan, probe.allTerms ?? [])) matched[probe.priority].push(probe.id);
  const unsupportedClaims = (expectations.unsupportedClaims ?? []).filter((probe) => has(plan, probe.allTerms ?? [])).map((probe) => probe.id);
  return { matched, unsupportedClaims };
}

function usageTotal(run) { return (run.usage?.inputTokens ?? 0) + (run.usage?.outputTokens ?? 0); }
function incrementalAssessment(fromName, toName, runs, scores, expectations) {
  const from = scores[fromName]; const to = scores[toName];
  const newCritical = (expectations.probes ?? []).filter((probe) => probe.priority === "critical"
    && to.matched.critical.includes(probe.id) && !from.matched.critical.includes(probe.id)).map((probe) => probe.id);
  const newImportant = (expectations.probes ?? []).filter((probe) => probe.priority === "important"
    && to.matched.important.includes(probe.id) && !from.matched.important.includes(probe.id)).map((probe) => probe.id);
  const criticalRegression = from.matched.critical.filter((id) => !to.matched.critical.includes(id));
  const elapsedMsDelta = runs[toName].elapsedMs - runs[fromName].elapsedMs;
  const tokenDelta = usageTotal(runs[toName]) - usageTotal(runs[fromName]);
  const costReductionCandidate = elapsedMsDelta < 0 && tokenDelta < 0;
  const status = criticalRegression.length || to.unsupportedClaims.length ? "needs_revision"
    : newCritical.length || newImportant.length || costReductionCandidate ? "needs_review" : "no_measured_gain";
  return { from: fromName, to: toName, status, newCritical, newImportant, criticalRegression,
    costReductionCandidate, elapsedMsDelta, tokenDelta };
}

export function compareTaskTriad(runs, expectations) {
  const scores = Object.fromEntries(ARMS.map((arm) => [arm, scoreTaskPlan(runs[arm].output, expectations)]));
  const qualifications = Object.fromEntries(ARMS.map((arm) => [arm, runs[arm].qualification]));
  const deterministic = ARMS.every((arm) => runs[arm].qualification.status === "passed");
  const increments = deterministic ? [
    incrementalAssessment(ARMS[0], ARMS[1], runs, scores, expectations),
    incrementalAssessment(ARMS[1], ARMS[2], runs, scores, expectations),
  ] : [];
  const status = !deterministic ? "incomplete" : increments.some((item) => item.status === "needs_revision")
    ? "needs_revision" : increments.some((item) => item.status === "needs_review") ? "needs_review" : "no_measured_gain";
  return { status, ownerReview: status === "needs_review" ? "pending" : "not_required", qualifications, scores, increments, reasons: [] };
}

export function compareTaskPair(runs, expectations) {
  const scores = Object.fromEntries(PAIR_ARMS.map((arm) => [arm, scoreTaskPlan(runs[arm].output, expectations)]));
  const qualifications = Object.fromEntries(PAIR_ARMS.map((arm) => [arm, runs[arm].qualification]));
  const deterministic = PAIR_ARMS.every((arm) => runs[arm].qualification.status === "passed");
  const increments = deterministic ? [incrementalAssessment(PAIR_ARMS[0], PAIR_ARMS[1], runs, scores, expectations)] : [];
  const status = deterministic ? increments[0].status : "incomplete";
  return { status, ownerReview: status === "needs_review" ? "pending" : "not_required", qualifications, scores, increments, reasons: [] };
}

function copyRepository(sourceRoot, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) fs.cpSync(path.join(sourceRoot, entry.name), path.join(destination, entry.name), { recursive: true, dereference: false });
}

export function verifyTaskSource(sourceRoot, expectedCommit) {
  const run = (args) => spawnSync("git", args, { cwd: sourceRoot, encoding: "utf8", timeout: 30_000 });
  const revision = run(["rev-parse", "HEAD"]);
  if (revision.status !== 0 || revision.stdout.trim() !== expectedCommit) throw new Error(`task source must be pinned to ${expectedCommit}`);
  const status = run(["status", "--porcelain=v1", "--untracked-files=all"]);
  if (status.status !== 0 || status.stdout.trim()) throw new Error("task source must have a clean working tree");
}

function usage(events) { for (const line of String(events).trim().split("\n").reverse()) try { const event = JSON.parse(line); if (event?.type === "turn.completed") return { inputTokens: event.usage?.input_tokens ?? null, outputTokens: event.usage?.output_tokens ?? null }; } catch { /* ignore */ } return null; }
function processFailure(events) { return String(events).includes('"type":"turn.failed"') ? "agent turn failed; inspect retained events" : null; }

export function assertTaskGraphPreflight(result) {
  if (result.status === 0 && !result.error) return;
  throw new Error("Code Graph preflight failed before model execution; close active Code Graph sessions and retry the benchmark");
}

export function preflightTaskGraph() {
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-task-preflight-"));
  try {
    for (const name of ["tmp", "agentbase", "home", "config", "data"]) fs.mkdirSync(path.join(runtimeRoot, name), { recursive: true, mode: 0o700 });
    const result = spawnSync(process.execPath, [path.join(projectRoot, "scripts", "benchmark", "qualify-codebase-memory-mcp.mjs")], {
      cwd: projectRoot,
      encoding: "utf8",
      timeout: 180_000,
      maxBuffer: 2 * 1024 * 1024,
      env: { ...process.env, TMPDIR: path.join(runtimeRoot, "tmp"), AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"),
        HOME: path.join(runtimeRoot, "home"), XDG_CONFIG_HOME: path.join(runtimeRoot, "config"),
        XDG_DATA_HOME: path.join(runtimeRoot, "data") },
    });
    assertTaskGraphPreflight(result);
  } finally {
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

export async function executeTaskArm({ arm, manifest, prompt, directory, trackerRoot }) {
  const sourceRoot = path.resolve(benchmarkRoot(), manifest.source.path); const sourceCommit = manifest.source.commit;
  verifyTaskSource(sourceRoot, sourceCommit);
  const version = spawnSync(manifest.agent.executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  if (version.status !== 0 || version.stdout.trim() !== manifest.agent.version) throw new Error(`expected ${manifest.agent.version}, found ${version.stdout.trim() || "unavailable"}`);
  fs.mkdirSync(directory, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-task-workspace-")); const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-task-runtime-"));
  const finalMessage = path.join(directory, ".agent-final.tmp");
  try {
    for (const name of ["tmp", "agentbase", "home", "config", "data"]) fs.mkdirSync(path.join(runtimeRoot, name), { recursive: true, mode: 0o700 });
    copyRepository(sourceRoot, workspace);
    const capability = arm === "source-native"
      ? "Use ordinary bounded read-only shell commands for source discovery. AgentBase is unavailable."
      : arm === "source-plus-graph"
        ? "Use ordinary source reads and the bounded single-repository Code Graph. Published Hub is unavailable."
        : "Use ordinary source reads, the bounded single-repository Code Graph, and one Published Hub search with limit <= 5 and no exact read.";
    const renderedPrompt = renderAgentPrompt(prompt, { FEATURE: manifest.feature, TRACKER_CONTEXT: manifest.trackerContext,
      SOURCE_HINT: "the current repository root", ARM_CAPABILITY: capability });
    const enabledTools = arm === "source-native" ? undefined : arm === "source-plus-graph"
      ? [...GRAPH_TOOLS] : [...GRAPH_TOOLS, ...HUB_TOOLS];
    const args = buildCodexArgs({ workspace, finalMessage, model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort,
      arm: arm === "source-native" ? "direct" : "mcp", disableShell: false, sandbox: "read-only", runtimeRoot,
      enabledTools, trackerRoot,
      ...(arm === "source-native" ? {} : {
        mcpEntryPoint: path.join(projectRoot, "scripts", "benchmark", "benchmark-agentbase-mcp.mjs"),
      }) });
    let environment = { ...process.env, TMPDIR: path.join(runtimeRoot, "tmp"),
      AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"), HOME: path.join(runtimeRoot, "home"),
      XDG_CONFIG_HOME: path.join(runtimeRoot, "config"), XDG_DATA_HOME: path.join(runtimeRoot, "data") };
    if (arm === "source-plus-graph-plus-hub") ({ environment } = seedPinnedContextHub(runtimeRoot, manifest.hub));
    environment = isolateCodexEnvironment(runtimeRoot, environment);
    const started = Date.now();
    const result = spawnSync(manifest.agent.executable, args, { cwd: projectRoot, input: renderedPrompt, encoding: "utf8",
      timeout: manifest.agent.timeoutMs, maxBuffer: 50 * 1024 * 1024, env: environment });
    const events = portableAgentText(result.stdout || "", { repository: sourceRoot, workspace, runtimeRoot });
    const finalText = fs.existsSync(finalMessage) ? fs.readFileSync(finalMessage, "utf8") : "";
    const output = (() => { try { return JSON.parse(finalText); } catch { return {}; } })();
    const trace = validateTaskSession(events, { arm, sourceCommit, sourceRoot: "<OUTPUT_ROOT>", tracker: manifest.tracker, limits: manifest.limits });
    const draft = validateTaskPlan(output, { arm, trace: trace.trace, sourceCommit, sourceRoot,
      hubCommit: manifest.hub?.commit ?? null });
    const failures = [...trace.failures, ...draft.failures,
      ...(result.status === 0 ? [] : [`agent process failed: ${result.error?.message ?? result.status}`])];
    const qualification = { status: result.status === 0 && !result.error && !processFailure(events) && !failures.length ? "passed" : "failed",
      failures: [...new Set(failures)] };
    const run = { suite: manifest.suite, arm, kind: "real", promptVersion: manifest.promptVersion,
      promptDigest: digest(renderedPrompt), sourceCommit, hubCommit: manifest.hub?.commit ?? null,
      process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? processFailure(events) },
      elapsedMs: Date.now() - started, usage: usage(events), output, trace: trace.trace, qualification };
    fs.writeFileSync(path.join(directory, "prompt.md"), renderedPrompt);
    fs.writeFileSync(path.join(directory, "agent-events.jsonl"), events);
    fs.writeFileSync(path.join(directory, "agent-final.txt"), finalText);
    writeJson(path.join(directory, "run.json"), run);
    return run;
  } finally {
    fs.rmSync(finalMessage, { force: true });
    fs.rmSync(workspace, { recursive: true, force: true });
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

function loadSuite(suite) { const candidates = []; for (const domain of fs.readdirSync(path.join(benchmarkRoot(), "suites"))) { const file = path.join(benchmarkRoot(), "suites", domain, suite, "manifest.json"); if (fs.existsSync(file)) candidates.push(file); } if (candidates.length !== 1) throw new Error(`expected exactly one task suite named ${suite}`); const manifest = JSON.parse(fs.readFileSync(candidates[0], "utf8")); return { manifest, directory: path.dirname(candidates[0]) }; }
const runPath = (manifest, runId, arm) => path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, runId, arm);
const runId = (value) => { if (!/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/.test(value)) throw new Error("run ID must be UTC YYYY-MM-DDTHH-MM-SSZ"); return value; };

async function main(argv) {
  const [command, suiteName, idArg] = argv; if (!command || !suiteName) throw new Error("usage: benchmark:task <pair|triad|compare> <suite> [UTC-run-id]");
  const { manifest, directory } = loadSuite(suiteName); const id = runId(idArg ?? new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z"));
  if (["triad", "pair"].includes(command)) {
    preflightTaskGraph();
    const prompt = fs.readFileSync(path.join(benchmarkRoot(), "prompts", `${manifest.promptVersion}.md`), "utf8");
    const base = path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, id); fs.mkdirSync(base, { recursive: true });
    const trackerRoot = path.resolve(benchmarkRoot(), manifest.tracker.path); const runs = {};
    const arms = command === "pair" ? PAIR_ARMS : ARMS;
    if (command === "triad" && !manifest.hub) throw new Error("triad requires a pinned Hub manifest");
    for (const arm of arms) runs[arm] = await executeTaskArm({ arm, manifest, prompt, directory: runPath(manifest, id, arm), trackerRoot });
    writeJson(path.join(base, `${command}.json`), runs); process.stdout.write(`${base}\n`); return;
  }
  if (command !== "compare") throw new Error(`unknown task benchmark command: ${command}`);
  const base = path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, id);
  const readRun = (arm) => {
    const runDirectory = path.join(base, arm); const run = JSON.parse(fs.readFileSync(path.join(runDirectory, "run.json"), "utf8"));
    const events = fs.readFileSync(path.join(runDirectory, "agent-events.jsonl"), "utf8");
    const admission = validateTaskSession(events, { arm, sourceCommit: manifest.source.commit, sourceRoot: "<OUTPUT_ROOT>", tracker: manifest.tracker, limits: manifest.limits });
    const sourceRoot = path.resolve(benchmarkRoot(), manifest.source.path);
    const draft = validateTaskPlan(run.output, { arm, trace: admission.trace, sourceCommit: manifest.source.commit,
      sourceRoot, hubCommit: manifest.hub?.commit ?? null });
    const failures = [...admission.failures, ...draft.failures];
    return { ...run, trace: admission.trace, qualification: { status: failures.length ? "failed" : "passed", failures: [...new Set(failures)] } };
  };
  const arms = fs.existsSync(path.join(base, "triad.json")) ? ARMS : PAIR_ARMS;
  const runs = Object.fromEntries(arms.map((arm) => [arm, readRun(arm)]));
  const expectations = JSON.parse(fs.readFileSync(path.join(directory, manifest.expectation), "utf8"));
  const comparison = arms === ARMS ? compareTaskTriad(runs, expectations) : compareTaskPair(runs, expectations);
  writeJson(path.join(base, "comparison.json"), comparison);
  process.stdout.write(`${comparison.status}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main(process.argv.slice(2)).catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
