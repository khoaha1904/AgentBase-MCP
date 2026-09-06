import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildCodexArgs, isolateCodexEnvironment, portableAgentText, renderAgentPrompt,
} from "./benchmark-agent.mjs";
import { benchmarkRoot, projectRoot, setBenchmarkRoot } from "./benchmark-paths.mjs";
import { preflightTaskGraph } from "./benchmark-task.mjs";

const ARMS = ["source-native", "source-plus-graph"];
const GRAPH_TOOLS = new Set([
  "index_repository", "get_architecture", "search_graph", "trace_path", "get_code_snippet",
  "search_code", "index_status", "check_index_coverage",
]);
const GRAPH_NAVIGATION_TOOLS = new Set([
  "get_architecture", "search_graph", "trace_path", "get_code_snippet", "search_code",
  "check_index_coverage",
]);

const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const runGit = (cwd, args, timeout = 60_000) => spawnSync("git", args, {
  cwd, encoding: "utf8", timeout, maxBuffer: 10 * 1024 * 1024,
});
const usageTotal = (run) => (run.usage?.inputTokens ?? 0) + (run.usage?.outputTokens ?? 0);

function processFailure(events) {
  return String(events).includes('"type":"turn.failed"') ? "agent turn failed; inspect retained events" : null;
}

function usage(events) {
  for (const line of String(events).trim().split("\n").reverse()) try {
    const event = JSON.parse(line);
    if (event?.type === "turn.completed") return {
      inputTokens: event.usage?.input_tokens ?? null,
      outputTokens: event.usage?.output_tokens ?? null,
    };
  } catch { /* ignore non-events */ }
  return null;
}

export function validateImplementationSession(events, { arm, limits = {} }) {
  if (!ARMS.includes(arm)) throw new Error(`unknown implementation benchmark arm: ${arm}`);
  const failures = [], calls = [], commands = [];
  let graphCalls = 0, indexCalls = 0, graphResultBytes = 0, commandResultBytes = 0;
  for (const [lineNo, line] of String(events ?? "").split("\n").entries()) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { failures.push(`malformed event JSON at line ${lineNo + 1}`); continue; }
    if (event?.type !== "item.completed") continue;
    const item = event.item;
    if (item?.type === "command_execution") {
      commands.push({ command: item.command ?? null, status: item.status ?? null });
      if (item.status === "completed") commandResultBytes += Buffer.byteLength(item.aggregated_output ?? "");
      continue;
    }
    if (item?.type !== "mcp_tool_call") continue;
    if (!GRAPH_TOOLS.has(item.tool)) { failures.push(`MCP tool is not allowed: ${item.tool ?? "unknown"}`); continue; }
    calls.push({ tool: item.tool, status: item.status ?? null, arguments: item.arguments ?? null });
    graphCalls += 1;
    if (item.tool === "index_repository") {
      indexCalls += 1;
      if (item.arguments?.repo_path !== "<OUTPUT_ROOT>") failures.push("index_repository must bind the disposable workspace");
      if (item.arguments?.persistence === true || item.arguments?.target_projects) failures.push("index_repository used forbidden persistence/cross-repository arguments");
    }
    if (item.status === "completed") graphResultBytes += Buffer.byteLength(JSON.stringify(item.result ?? null));
  }
  if (commands.length > (limits.commands ?? 60)) failures.push(`command limit exceeded: ${commands.length}/${limits.commands ?? 60}`);
  if (commandResultBytes > (limits.commandResultBytes ?? 2 * 1024 * 1024)) failures.push("command result byte limit exceeded");
  if (arm === "source-native" && graphCalls) failures.push("source-native arm must not call Code Graph");
  if (arm === "source-plus-graph") {
    if (indexCalls !== 1) failures.push(`graph arm must index exactly once; observed ${indexCalls}`);
    if (graphCalls > (limits.graphCalls ?? 16)) failures.push(`graph call limit exceeded: ${graphCalls}/${limits.graphCalls ?? 16}`);
    if (graphResultBytes > (limits.graphResultBytes ?? 256 * 1024)) failures.push("graph result byte limit exceeded");
    if (!calls.some((call) => GRAPH_NAVIGATION_TOOLS.has(call.tool) && call.status === "completed")) {
      failures.push("graph arm needs at least one bounded navigation call");
    }
  }
  return { failures: [...new Set(failures)], trace: {
    calls, commands, graphCalls, indexCalls, graphResultBytes, commandResultBytes,
  } };
}

function changedPaths(workspace) {
  const status = runGit(workspace, ["status", "--porcelain=v1", "--untracked-files=all"]);
  if (status.status !== 0) throw new Error(status.stderr.trim() || "git status failed");
  return status.stdout.split("\n").filter(Boolean).map((line) => {
    const value = line.slice(3);
    return value.includes(" -> ") ? value.split(" -> ").at(-1) : value;
  }).sort();
}

function patchMetrics(workspace) {
  const patch = runGit(workspace, ["diff", "--binary", "HEAD", "--"]);
  const numstat = runGit(workspace, ["diff", "--numstat", "HEAD", "--"]);
  if (patch.status !== 0 || numstat.status !== 0) throw new Error("could not retain implementation patch");
  let additions = 0, deletions = 0;
  for (const line of numstat.stdout.split("\n").filter(Boolean)) {
    const [added, deleted] = line.split("\t");
    if (/^\d+$/.test(added)) additions += Number(added);
    if (/^\d+$/.test(deleted)) deletions += Number(deleted);
  }
  return { patch: patch.stdout, additions, deletions };
}

function runCheck(workspace, check, suiteDirectory) {
  const command = check.command.map((value) => value
    .replaceAll("{{WORKSPACE}}", workspace)
    .replaceAll("{{SUITE_ROOT}}", suiteDirectory));
  const result = spawnSync(command[0], command.slice(1), {
    cwd: workspace,
    encoding: "utf8",
    timeout: check.timeoutMs ?? 300_000,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, ...(check.environment ?? {}),
      IMPLEMENTATION_WORKSPACE: workspace,
      IMPLEMENTATION_TARGET_URL: pathToFileURL(path.join(workspace, check.targetPath ?? "")).href },
  });
  return { name: check.name, status: result.status === 0 && !result.error ? "passed" : "failed",
    exitCode: result.status, signal: result.signal, error: result.error?.message ?? null,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.slice(0, 128 * 1024) };
}

export function assessImplementationOutcome({ processOk, traceFailures, paths, requiredPaths, allowedPaths, checks }) {
  const failures = [...traceFailures];
  for (const required of requiredPaths) if (!paths.includes(required)) failures.push(`required path was not changed: ${required}`);
  for (const changed of paths) if (!allowedPaths.includes(changed)) failures.push(`out-of-scope path changed: ${changed}`);
  for (const check of checks) if (check.status !== "passed") failures.push(`verification failed: ${check.name}`);
  if (!processOk) failures.push("agent process failed");
  return { status: failures.length ? "failed" : "passed", failures: [...new Set(failures)] };
}

export function compareImplementationPair(runs) {
  const source = runs[ARMS[0]], graph = runs[ARMS[1]];
  const sourcePassed = source.qualification.status === "passed";
  const graphPassed = graph.qualification.status === "passed";
  const elapsedMsDelta = graph.elapsedMs - source.elapsedMs;
  const tokenDelta = usageTotal(graph) - usageTotal(source);
  const meaningfulCostReduction = sourcePassed && graphPassed
    && graph.elapsedMs <= source.elapsedMs * 0.9 && usageTotal(graph) <= usageTotal(source) * 0.9;
  const status = graphPassed && !sourcePassed ? "needs_review"
    : sourcePassed && !graphPassed ? "needs_revision"
      : !sourcePassed && !graphPassed ? "incomplete"
        : meaningfulCostReduction ? "needs_review" : "no_measured_gain";
  return { status, ownerReview: status === "needs_review" ? "pending" : "not_required",
    qualifications: Object.fromEntries(ARMS.map((arm) => [arm, runs[arm].qualification])),
    qualityGainCandidate: graphPassed && !sourcePassed, meaningfulCostReduction,
    elapsedMsDelta, tokenDelta,
    patchDelta: {
      additions: graph.patch.additions - source.patch.additions,
      deletions: graph.patch.deletions - source.patch.deletions,
    },
  };
}

function verifySourceCommit(sourceRoot, commit) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("implementation source commit must be a full SHA");
  const result = runGit(sourceRoot, ["cat-file", "-e", `${commit}^{commit}`]);
  if (result.status !== 0) throw new Error(`implementation source does not contain ${commit}`);
}

function prepareWorkspace(sourceRoot, commit, parent, reuseNodeModules) {
  const workspace = path.join(parent, "repository");
  const clone = spawnSync("git", ["clone", "--quiet", "--no-hardlinks", sourceRoot, workspace], {
    encoding: "utf8", timeout: 120_000,
  });
  if (clone.status !== 0) throw new Error(clone.stderr.trim() || "could not clone implementation fixture");
  const checkout = runGit(workspace, ["checkout", "--quiet", "--detach", commit]);
  if (checkout.status !== 0) throw new Error(checkout.stderr.trim() || "could not checkout implementation fixture");
  if (reuseNodeModules && fs.existsSync(path.join(sourceRoot, "node_modules"))) {
    fs.appendFileSync(path.join(workspace, ".git", "info", "exclude"), "\nnode_modules\n");
    fs.symlinkSync(path.join(sourceRoot, "node_modules"), path.join(workspace, "node_modules"), "dir");
  }
  if (changedPaths(workspace).length) throw new Error("disposable implementation workspace is not clean");
  return workspace;
}

export async function executeImplementationArm({ arm, manifest, prompt, directory, suiteDirectory }) {
  const sourceRoot = path.resolve(benchmarkRoot(), manifest.source.path);
  verifySourceCommit(sourceRoot, manifest.source.commit);
  const version = spawnSync(manifest.agent.executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  if (version.status !== 0 || version.stdout.trim() !== manifest.agent.version) {
    throw new Error(`expected ${manifest.agent.version}, found ${version.stdout.trim() || "unavailable"}`);
  }
  fs.mkdirSync(directory, { recursive: true });
  const workspaceParent = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-implementation-workspace-"));
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-implementation-runtime-"));
  const finalMessage = path.join(directory, ".agent-final.tmp");
  try {
    for (const name of ["tmp", "agentbase", "home", "config", "data"]) {
      fs.mkdirSync(path.join(runtimeRoot, name), { recursive: true, mode: 0o700 });
    }
    const workspace = prepareWorkspace(sourceRoot, manifest.source.commit, workspaceParent, manifest.source.reuseNodeModules);
    const capability = arm === "source-native"
      ? "Use normal local source search and reads. AgentBase and Published Hub are unavailable."
      : "Use normal local source reads plus one bounded Code Graph index of the current repository. Published Hub is unavailable.";
    const renderedPrompt = renderAgentPrompt(prompt, {
      FEATURE: manifest.feature,
      ARM_CAPABILITY: capability,
      FOCUSED_TEST: manifest.focusedTest.join(" "),
    });
    const args = buildCodexArgs({
      workspace, finalMessage, model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort,
      arm: arm === "source-native" ? "direct" : "mcp", disableShell: false, sandbox: "workspace-write",
      runtimeRoot, enabledTools: arm === "source-native" ? undefined : [...GRAPH_TOOLS],
      ...(arm === "source-native" ? {} : {
        mcpEntryPoint: path.join(projectRoot, "scripts", "benchmark", "benchmark-agentbase-mcp.mjs"),
      }),
    });
    let environment = { ...process.env, TMPDIR: path.join(runtimeRoot, "tmp"),
      AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"), HOME: path.join(runtimeRoot, "home"),
      XDG_CONFIG_HOME: path.join(runtimeRoot, "config"), XDG_DATA_HOME: path.join(runtimeRoot, "data") };
    environment = isolateCodexEnvironment(runtimeRoot, environment);
    const started = Date.now();
    const result = spawnSync(manifest.agent.executable, args, {
      cwd: projectRoot, input: renderedPrompt, encoding: "utf8", timeout: manifest.agent.timeoutMs,
      maxBuffer: 50 * 1024 * 1024, env: environment,
    });
    const elapsedMs = Date.now() - started;
    const events = portableAgentText(result.stdout || "", { repository: sourceRoot, workspace, runtimeRoot });
    const finalText = fs.existsSync(finalMessage) ? fs.readFileSync(finalMessage, "utf8") : "";
    const paths = changedPaths(workspace);
    const patch = patchMetrics(workspace);
    const admission = validateImplementationSession(events, { arm, limits: manifest.limits });
    const checks = manifest.checks.map((check) => runCheck(workspace, check, suiteDirectory));
    const processOk = result.status === 0 && !result.error && !processFailure(events);
    const qualification = assessImplementationOutcome({ processOk, traceFailures: admission.failures, paths,
      requiredPaths: manifest.requiredPaths, allowedPaths: manifest.allowedPaths, checks });
    const run = { suite: manifest.suite, arm, kind: "real-implementation", promptVersion: manifest.promptVersion,
      suiteVersion: manifest.version, manifestDigest: digest(fs.readFileSync(path.join(suiteDirectory, "manifest.json"))),
      checkInputDigests: Object.fromEntries(manifest.checks.filter((check) => check.inputPath).map((check) => [
        check.name, digest(fs.readFileSync(path.join(suiteDirectory, check.inputPath))),
      ])),
      promptDigest: digest(renderedPrompt), sourceCommit: manifest.source.commit,
      process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? processFailure(events) },
      elapsedMs, usage: usage(events), changedPaths: paths, patch: { additions: patch.additions, deletions: patch.deletions },
      trace: admission.trace, checks, qualification };
    fs.writeFileSync(path.join(directory, "prompt.md"), renderedPrompt);
    fs.writeFileSync(path.join(directory, "agent-events.jsonl"), events);
    fs.writeFileSync(path.join(directory, "agent-final.txt"), finalText);
    fs.writeFileSync(path.join(directory, "changes.patch"), patch.patch);
    writeJson(path.join(directory, "run.json"), run);
    return run;
  } finally {
    fs.rmSync(finalMessage, { force: true });
    fs.rmSync(workspaceParent, { recursive: true, force: true });
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

function loadSuite(name) {
  const directory = path.join(benchmarkRoot(), "suites", "ait", name);
  const file = path.join(directory, "manifest.json");
  if (!fs.existsSync(file)) throw new Error(`implementation suite is unavailable: ${name}`);
  return { manifest: JSON.parse(fs.readFileSync(file, "utf8")), directory };
}
const validRunId = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/.test(value)) throw new Error("run ID must be UTC YYYY-MM-DDTHH-MM-SSZ");
  return value;
};

async function main(argv) {
  if (process.env.AGENTBASE_BENCHMARK_ROOT) setBenchmarkRoot(process.env.AGENTBASE_BENCHMARK_ROOT);
  const [command, suiteName, idArg] = argv;
  if (!command || !suiteName) throw new Error("usage: benchmark:implementation <pair|compare> <suite> [UTC-run-id]");
  const { manifest, directory } = loadSuite(suiteName);
  const id = validRunId(idArg ?? new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z"));
  const base = path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, id);
  if (command === "pair") {
    preflightTaskGraph();
    const prompt = fs.readFileSync(path.join(benchmarkRoot(), "prompts", `${manifest.promptVersion}.md`), "utf8");
    const runs = {};
    for (const arm of ARMS) runs[arm] = await executeImplementationArm({ arm, manifest, prompt,
      directory: path.join(base, arm), suiteDirectory: directory });
    writeJson(path.join(base, "pair.json"), runs);
    process.stdout.write(`${base}\n`);
    return;
  }
  if (command !== "compare") throw new Error(`unknown implementation benchmark command: ${command}`);
  const runs = Object.fromEntries(ARMS.map((arm) => [arm,
    JSON.parse(fs.readFileSync(path.join(base, arm, "run.json"), "utf8"))]));
  const comparison = compareImplementationPair(runs);
  writeJson(path.join(base, "comparison.json"), comparison);
  process.stdout.write(`${comparison.status}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
