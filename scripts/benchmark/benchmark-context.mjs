import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  activatePersistedHubConfiguration,
  readPersistedHubConfiguration,
} from "../../src/app/hub-okf/configuration/configuration-file.ts";
import { createHubIdentity, hubProfileId } from "../../src/core/hub/index.ts";
import { buildCodexArgs, portableAgentText, renderAgentPrompt } from "./benchmark-agent.mjs";
import { benchmarkRoot, projectRoot, setBenchmarkRoot } from "./benchmark-paths.mjs";

const ARMS = ["discovery-only", "discovery-plus-agentbase"];
const ALLOWED_TOOLS = new Set(["search_hub_okf", "read_hub_okf_concept"]);
const REQUIRED_DRAFT_FIELDS = [
  "overview", "affected_areas", "relevant_relations", "discovery_questions", "known_unknowns", "evidence_refs",
];
const FORBIDDEN_ITEM_TYPES = new Set(["command_execution", "file_change", "web_search"]);

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeImmutableJson(file, value) {
  const rendered = `${JSON.stringify(value, null, 2)}\n`;
  if (fs.existsSync(file)) {
    if (fs.readFileSync(file, "utf8") !== rendered) throw new Error(`immutable evidence already exists: ${file}`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, rendered, { flag: "wx" });
}

function resultObjects(result) {
  const values = [];
  if (result?.structured_content && typeof result.structured_content === "object") values.push(result.structured_content);
  if (result?.structuredContent && typeof result.structuredContent === "object") values.push(result.structuredContent);
  for (const block of result?.content ?? []) {
    if (block?.type !== "text" || typeof block.text !== "string") continue;
    try {
      const value = JSON.parse(block.text);
      if (value && typeof value === "object") values.push(value);
    } catch { /* Non-JSON provider prose is not evidence. */ }
  }
  return values;
}

function collectStrings(value, values, paths) {
  if (typeof value === "string") {
    values.add(value);
    for (const match of value.matchAll(/\b(?:agentbase|repository):\/\/[^\s)\]}>'"]+/g)) paths.add(match[0]);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (!Array.isArray(value) && typeof value.path === "string") paths.add(value.path);
  for (const child of Object.values(value)) collectStrings(child, values, paths);
}

export function validateContextSession(events, { arm, pinnedCommit, limits, tracker = null }) {
  if (!ARMS.includes(arm)) throw new Error(`unknown context benchmark arm: ${arm}`);
  const failures = [];
  const calls = [];
  const trackerCalls = [];
  const values = new Set();
  const evidence = new Set();
  let searches = 0;
  let reads = 0;
  let resultBytes = 0;

  for (const [index, line] of String(events ?? "").split("\n").entries()) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); }
    catch {
      failures.push(`malformed event JSON at line ${index + 1}`);
      continue;
    }
    if (event?.type !== "item.completed") continue;
    const item = event.item;
    if (FORBIDDEN_ITEM_TYPES.has(item?.type)) failures.push(`forbidden agent activity observed: ${item.type}`);
    if (item?.type !== "mcp_tool_call") continue;
    const tool = item.tool;
    calls.push({ tool, arguments: item.arguments ?? null, status: item.status ?? null,
      resultBytes: item.status === "completed" ? Buffer.byteLength(JSON.stringify(item.result ?? null)) : 0 });
    const isTrackerTool = tracker?.tools?.includes(tool) === true;
    if (arm === "discovery-only" && !isTrackerTool) {
      failures.push(`discovery-only arm must not call MCP (non-tracker tool): ${tool ?? "unknown"}`);
      continue;
    }
    if (!ALLOWED_TOOLS.has(tool) && !isTrackerTool) {
      failures.push(`MCP tool is not allowed: ${tool ?? "unknown"}`);
      continue;
    }
    if (isTrackerTool) {
      trackerCalls.push({ tool, arguments: item.arguments ?? null, status: item.status ?? null,
        resultBytes: item.status === "completed" ? Buffer.byteLength(JSON.stringify(item.result ?? null)) : 0 });
      continue;
    }
    if (tool === "search_hub_okf") {
      searches += 1;
      const limit = item.arguments?.limit;
      if (!Number.isInteger(limit) || limit < 1 || limit > limits.searchResultLimit) {
        failures.push(`search_hub_okf limit must be an integer from 1 to ${limits.searchResultLimit}`);
      }
    } else reads += 1;
    if (item.status !== "completed") continue;
    resultBytes += Buffer.byteLength(JSON.stringify(item.result ?? null));
    const objects = resultObjects(item.result);
    if (!objects.length) failures.push(`${tool} completed without a structured JSON result`);
    for (const object of objects) {
      if (object.commit !== pinnedCommit) failures.push(`${tool} result is not pinned to ${pinnedCommit}`);
      const resultValues = new Set();
      const resultPaths = new Set();
      collectStrings(object, resultValues, resultPaths);
      for (const value of resultValues) values.add(value);
      if (object.commit === pinnedCommit) {
        for (const resultPath of resultPaths) evidence.add(`${resultPath}\0${pinnedCommit}`);
      }
    }
    if (tool === "read_hub_okf_concept" && typeof item.arguments?.path === "string"
      && objects.some((object) => object.commit === pinnedCommit)) {
      evidence.add(`${item.arguments.path}\0${pinnedCommit}`);
    }
  }

  if (arm === "discovery-plus-agentbase") {
    if (searches > limits.searches) failures.push(`search call limit exceeded: ${searches}/${limits.searches}`);
    if (reads > limits.reads) failures.push(`read call limit exceeded: ${reads}/${limits.reads}`);
    if (resultBytes > limits.resultBytes) failures.push(`Hub result byte limit exceeded: ${resultBytes}/${limits.resultBytes}`);
    if (searches < 1 || !calls.some((call) => call.tool === "search_hub_okf" && call.status === "completed")) {
      failures.push("at least one completed search_hub_okf call is required");
    }
  }
  if (tracker) {
    const trackerCount = trackerCalls.filter((call) => call.status === "completed").length;
    if (trackerCount > (tracker.calls ?? 8)) failures.push(`tracker call limit exceeded: ${trackerCount}/${tracker.calls}`);
    if (trackerCount < 1) failures.push("at least one completed tracker MCP call is required");
  }
  return {
    failures: [...new Set(failures)],
    trace: { pinnedCommit, calls, trackerCalls, searches, reads, resultBytes, values: [...values].sort(), evidence: [...evidence].sort() },
  };
}

function exactFields(value, fields) {
  return value && typeof value === "object" && !Array.isArray(value)
    && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...fields].sort());
}

function validText(value, max, label, failures) {
  if (typeof value !== "string" || !value.trim() || value.length > max) failures.push(`${label} must be non-empty text of at most ${max} characters`);
}

function validList(value, label, failures) {
  if (!Array.isArray(value) || value.length > 16) {
    failures.push(`${label} must be an array of at most 16 values`);
    return false;
  }
  return true;
}

export function validateDiscoveryDraft(value, { arm, trace }) {
  const failures = [];
  if (!exactFields(value, REQUIRED_DRAFT_FIELDS)) {
    return { failures: ["discovery draft must contain the exact fields defined by the contract"] };
  }
  validText(value.overview, 1200, "overview", failures);
  const refs = new Map();
  if (validList(value.evidence_refs, "evidence_refs", failures)) {
    for (const [index, ref] of value.evidence_refs.entries()) {
      if (!exactFields(ref, ["id", "path", "commit"])) {
        failures.push(`evidence_refs[${index}] must contain exact id, path and commit fields`);
        continue;
      }
      validText(ref.id, 500, `evidence_refs[${index}].id`, failures);
      validText(ref.path, 500, `evidence_refs[${index}].path`, failures);
      validText(ref.commit, 500, `evidence_refs[${index}].commit`, failures);
      if (refs.has(ref.id)) failures.push(`duplicate evidence ref ID: ${ref.id}`);
      refs.set(ref.id, ref);
      if (arm === "discovery-plus-agentbase" && !trace?.evidence?.includes(`${ref.path}\0${ref.commit}`)) {
        failures.push(`evidence ref does not resolve in retained Hub trace: ${ref.id}`);
      }
    }
  }
  const validateNestedRefs = (nested, label) => {
    if (!Array.isArray(nested) || nested.some((id) => typeof id !== "string")) {
      failures.push(`${label} must be an array of evidence-ref IDs`);
      return;
    }
    for (const id of nested) if (!refs.has(id)) failures.push(`${label} contains unresolved evidence-ref ID: ${id}`);
  };
  if (validList(value.affected_areas, "affected_areas", failures)) {
    for (const [index, area] of value.affected_areas.entries()) {
      if (!exactFields(area, ["identity", "reason", "evidence_refs"])) {
        failures.push(`affected_areas[${index}] has invalid fields`);
        continue;
      }
      validText(area.identity, 500, `affected_areas[${index}].identity`, failures);
      validText(area.reason, 500, `affected_areas[${index}].reason`, failures);
      validateNestedRefs(area.evidence_refs, `affected_areas[${index}].evidence_refs`);
      if (arm === "discovery-plus-agentbase" && !trace?.values?.includes(area.identity)) {
        failures.push(`affected identity is absent from retained Hub trace: ${area.identity}`);
      }
    }
  }
  if (validList(value.relevant_relations, "relevant_relations", failures)) {
    for (const [index, relation] of value.relevant_relations.entries()) {
      if (!exactFields(relation, ["source", "predicate", "target", "evidence_refs"])) {
        failures.push(`relevant_relations[${index}] has invalid fields`);
        continue;
      }
      for (const field of ["source", "predicate", "target"]) validText(relation[field], 500, `relevant_relations[${index}].${field}`, failures);
      validateNestedRefs(relation.evidence_refs, `relevant_relations[${index}].evidence_refs`);
      if (arm === "discovery-plus-agentbase") {
        for (const field of ["source", "target"]) if (!trace?.values?.includes(relation[field])) {
          failures.push(`relation ${field} is absent from retained Hub trace: ${relation[field]}`);
        }
      }
    }
  }
  for (const field of ["discovery_questions", "known_unknowns"]) {
    if (!validList(value[field], field, failures)) continue;
    for (const [index, item] of value[field].entries()) validText(item, 500, `${field}[${index}]`, failures);
  }
  return { failures: [...new Set(failures)] };
}

function fieldText(draft, fields) {
  return fields.map((field) => JSON.stringify(draft?.[field] ?? "")).join(" ").toLowerCase();
}

function matchesRule(draft, rule) {
  const text = fieldText(draft, rule.fields);
  const all = (rule.allTerms ?? []).every((term) => text.includes(String(term).toLowerCase()));
  const any = !rule.anyTerms?.length || rule.anyTerms.some((term) => text.includes(String(term).toLowerCase()));
  return all && any;
}

export function scoreDiscoveryDraft(draft, expectations) {
  const matched = { critical: [], important: [], optional: [] };
  for (const probe of expectations.probes ?? []) {
    if (!Object.hasOwn(matched, probe.priority)) throw new Error(`unknown probe priority: ${probe.priority}`);
    if (matchesRule(draft, probe)) matched[probe.priority].push(probe.id);
  }
  const unsupportedClaims = (expectations.unsupportedClaims ?? [])
    .filter((rule) => matchesRule(draft, rule)).map((rule) => rule.id);
  return { matched, unsupportedClaims };
}

export function compareContextPair(pair, expectations) {
  const direct = scoreDiscoveryDraft(pair.direct.output, expectations);
  const assisted = scoreDiscoveryDraft(pair.assisted.output, expectations);
  const reasons = [];
  const hardFailures = [...(pair.direct.qualification?.failures ?? []), ...(pair.assisted.qualification?.failures ?? [])];
  if (pair.direct.promptDigest !== pair.assisted.promptDigest || pair.direct.inputDigest !== pair.assisted.inputDigest) {
    hardFailures.push("paired arms do not share identical prompt and input digests");
  }
  if (pair.direct.kind !== pair.assisted.kind) hardFailures.push("paired arms do not share the same runner kind");
  if (pair.direct.process?.exitCode !== 0 || pair.assisted.process?.exitCode !== 0
    || pair.direct.process?.error || pair.assisted.process?.error || hardFailures.length) {
    reasons.push(...hardFailures, "one or both benchmark arms are incomplete");
    return { status: "incomplete", ownerReview: "not_required", direct, assisted,
      efficiency: efficiency(pair), reasons: [...new Set(reasons)] };
  }
  const criticalRegression = direct.matched.critical.filter((id) => !assisted.matched.critical.includes(id));
  if (criticalRegression.length) reasons.push(`assisted arm regressed critical probes: ${criticalRegression.join(", ")}`);
  const newImportant = assisted.matched.important.filter((id) => !direct.matched.important.includes(id));
  if (!newImportant.length) reasons.push("assisted arm did not add an important probe");
  if (assisted.unsupportedClaims.length) reasons.push(`assisted arm made unsupported claims: ${assisted.unsupportedClaims.join(", ")}`);
  if (reasons.length) return { status: "needs_revision", ownerReview: "not_required", direct, assisted,
    improvement: { newImportant }, efficiency: efficiency(pair), reasons };
  const real = pair.direct.kind === "real" || pair.assisted.kind === "real";
  return { status: real ? "needs_review" : "passed", ownerReview: real ? "pending" : "not_required",
    direct, assisted, improvement: { newImportant }, efficiency: efficiency(pair), reasons: [] };
}

function efficiency(pair) {
  const tokens = (arm) => (arm.usage?.inputTokens ?? 0) + (arm.usage?.outputTokens ?? 0);
  return {
    elapsedMsDelta: (pair.assisted.elapsedMs ?? 0) - (pair.direct.elapsedMs ?? 0),
    tokenDelta: tokens(pair.assisted) - tokens(pair.direct),
    assistedToolResultBytes: pair.assisted.trace?.resultBytes ?? 0,
    diagnosticOnly: true,
  };
}

function parseOutput(value) {
  if (value && typeof value === "object") return { output: value, failure: null };
  try { return { output: JSON.parse(String(value ?? "")), failure: null }; }
  catch { return { output: {}, failure: "agent final response is not exact JSON" }; }
}

function inputDigest(manifest) {
  return digest(JSON.stringify({ feature: manifest.feature, trackerContext: manifest.trackerContext,
    tracker: manifest.tracker ?? null, hub: manifest.hub, promptVersion: manifest.promptVersion }));
}

function armDirectory(root, manifest, pairId, arm) {
  return path.join(root, "results", manifest.domain, manifest.suite, pairId, arm);
}

export async function runContextPair({ manifest, prompt, root, pairId, runArm = executeContextArm }) {
  const renderedPrompt = renderAgentPrompt(prompt, { FEATURE: manifest.feature, TRACKER_CONTEXT: manifest.trackerContext });
  const portablePrompt = renderedPrompt;
  const sharedPromptDigest = digest(portablePrompt);
  const sharedInputDigest = inputDigest(manifest);
  const pair = {};
  for (const arm of ARMS) {
    const directory = armDirectory(root, manifest, pairId, arm);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "prompt.md"), portablePrompt);
    let raw;
    try {
      const trackerRoot = manifest.tracker?.path ? path.resolve(root, manifest.tracker.path) : null;
      raw = await runArm({ arm, manifest, renderedPrompt, directory, trackerRoot });
    }
    catch (error) {
      raw = { kind: "real", events: "", output: {}, elapsedMs: 0, usage: null,
        process: { exitCode: null, signal: null, error: error instanceof Error ? error.message : "unknown arm failure" } };
    }
    const parsed = parseOutput(raw.output);
    const admitted = validateContextSession(raw.events ?? "", {
      arm, pinnedCommit: manifest.hub?.commit ?? "", limits: manifest.limits ?? {
        searches: 3, reads: 5, searchResultLimit: 8, resultBytes: 64 * 1024,
      }, tracker: manifest.tracker ?? null,
    });
    const draft = validateDiscoveryDraft(parsed.output, { arm, trace: arm === "discovery-plus-agentbase" ? admitted.trace : null });
    const process = raw.process ?? { exitCode: 0, signal: null, error: null };
    const qualificationFailures = [
      ...(process.exitCode === 0 && !process.error ? [] : [`agent process failed: ${process.error ?? process.exitCode}`]),
      ...(parsed.failure ? [parsed.failure] : []), ...admitted.failures, ...draft.failures,
    ];
    const run = {
      suite: manifest.suite, pairId, arm, kind: raw.kind ?? "real", promptVersion: manifest.promptVersion,
      promptDigest: sharedPromptDigest, inputDigest: sharedInputDigest, process,
      elapsedMs: raw.elapsedMs ?? 0, usage: raw.usage ?? null, output: parsed.output,
      trace: arm === "discovery-plus-agentbase" ? admitted.trace : null,
      qualification: { status: qualificationFailures.length ? "failed" : "passed", failures: [...new Set(qualificationFailures)] },
    };
    fs.writeFileSync(path.join(directory, "agent-events.jsonl"), raw.events ?? "");
    if (typeof raw.finalText === "string") fs.writeFileSync(path.join(directory, "agent-final.txt"), raw.finalText);
    writeJson(path.join(directory, "run.json"), run);
    pair[arm === "discovery-only" ? "direct" : "assisted"] = run;
  }
  return pair;
}

function git(args, cwd, environment) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 120_000, env: environment });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}

export function seedPinnedContextHub(runtimeRoot, hub, sourceEnvironment = process.env) {
  const source = readPersistedHubConfiguration(sourceEnvironment);
  if (!source || source.kind !== "remote" || source.host !== hub.host || source.repository !== hub.repository
    || source.targetBranch !== hub.branch) {
    throw new Error(`context benchmark requires active Hub ${hub.host}/${hub.repository}@${hub.branch}; select it with abs hub connect`);
  }
  if (!fs.existsSync(source.localRoot) || fs.lstatSync(source.localRoot).isSymbolicLink()
    || !fs.statSync(source.localRoot).isDirectory()) throw new Error("active context benchmark Hub checkout is unavailable or unsafe");
  const environment = {
    ...process.env, HOME: path.join(runtimeRoot, "home"), AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"),
    XDG_CONFIG_HOME: path.join(runtimeRoot, "config"), XDG_DATA_HOME: path.join(runtimeRoot, "data"),
    TMPDIR: path.join(runtimeRoot, "tmp"), GIT_TERMINAL_PROMPT: "0", GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
  };
  for (const directory of ["home", "tmp", "config", "data", "agentbase"]) fs.mkdirSync(path.join(runtimeRoot, directory), { recursive: true, mode: 0o700 });
  const identity = createHubIdentity(hub.repository, hub.branch, hub.host);
  if (git(["remote", "get-url", "origin"], source.localRoot, environment) !== identity.canonicalHttpsUrl) {
    throw new Error("active context benchmark Hub remote does not match its profile");
  }
  if (git(["symbolic-ref", "--quiet", "--short", "HEAD"], source.localRoot, environment) !== "main"
    || git(["status", "--porcelain=v1", "--untracked-files=all"], source.localRoot, environment)) {
    throw new Error("active context benchmark Hub checkout must be clean on internal main");
  }
  if (git(["rev-parse", "--verify", "refs/agentbase/published^{commit}"], source.localRoot, environment) !== hub.commit) {
    throw new Error(`active context benchmark Hub Published revision must equal ${hub.commit}`);
  }
  const localRoot = path.join(runtimeRoot, "hub");
  fs.cpSync(source.localRoot, localRoot, { recursive: true });
  git(["checkout", "-B", hub.branch, hub.commit], localRoot, environment);
  git(["update-ref", "refs/agentbase/published", hub.commit], localRoot, environment);
  if (git(["rev-parse", "HEAD"], localRoot, environment) !== hub.commit || git(["status", "--porcelain"], localRoot, environment)) {
    throw new Error("pinned Hub checkout is not exact and clean");
  }
  activatePersistedHubConfiguration({
    formatVersion: 1, kind: "remote", localHubId: hubProfileId(identity), localRoot,
    baseCommit: hub.commit, catalogVersion: hub.catalogVersion, host: hub.host,
    repository: hub.repository, targetBranch: hub.branch,
  }, environment, null);
  return { environment, localRoot };
}

function usageFromEvents(events) {
  for (const line of String(events).trim().split("\n").reverse()) {
    try {
      const event = JSON.parse(line);
      if (event?.type === "turn.completed" && event.usage) return {
        inputTokens: event.usage.input_tokens ?? null,
        outputTokens: event.usage.output_tokens ?? null,
      };
    } catch { /* Validation reports malformed lines. */ }
  }
  return null;
}

export function agentFailureFromEvents(events) {
  for (const line of String(events).trim().split("\n").reverse()) {
    try {
      const event = JSON.parse(line);
      const message = event?.type === "turn.failed" ? event.error?.message
        : event?.type === "error" ? event.message : undefined;
      if (typeof message !== "string") continue;
      if (/usage limit|purchase more credits|quota/i.test(message)) return "agent usage limit reached";
      if (/authentication|unauthorized|sign in|login/i.test(message)) return "agent authentication failed";
      return "agent turn failed; inspect retained events";
    } catch { /* Event admission reports malformed lines separately. */ }
  }
  return null;
}

export async function executeContextArm({ arm, manifest, renderedPrompt, directory, trackerRoot = null }) {
  const version = spawnSync(manifest.agent.executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  const actualVersion = version.status === 0 ? version.stdout.trim() : "";
  if (actualVersion !== manifest.agent.version) throw new Error(`expected ${manifest.agent.version}, found ${actualVersion || "unavailable"}`);
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-context-workspace-"));
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-context-runtime-"));
  const finalMessage = path.join(directory, ".agent-final.tmp");
  let environment = { ...process.env, TMPDIR: path.join(runtimeRoot, "tmp"), AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"),
    HOME: path.join(runtimeRoot, "home"), XDG_CONFIG_HOME: path.join(runtimeRoot, "config"), XDG_DATA_HOME: path.join(runtimeRoot, "data") };
  try {
    for (const name of ["tmp", "agentbase", "home", "config", "data"]) fs.mkdirSync(path.join(runtimeRoot, name), { recursive: true, mode: 0o700 });
    let hubRoot = "";
    if (arm === "discovery-plus-agentbase") ({ environment, localRoot: hubRoot } = seedPinnedContextHub(runtimeRoot, manifest.hub));
    const args = buildCodexArgs({ workspace, finalMessage, model: manifest.agent.model,
      reasoningEffort: manifest.agent.reasoningEffort, arm: arm === "discovery-only" ? "direct" : "mcp", runtimeRoot,
      enabledTools: arm === "discovery-plus-agentbase" ? [...ALLOWED_TOOLS] : undefined,
      trackerRoot });
    const started = Date.now();
    const result = spawnSync(manifest.agent.executable, args, {
      cwd: projectRoot, input: renderedPrompt, encoding: "utf8", timeout: manifest.agent.timeoutMs,
      maxBuffer: 50 * 1024 * 1024, env: environment,
    });
    const finalText = fs.existsSync(finalMessage) ? fs.readFileSync(finalMessage, "utf8") : "";
    const portable = (value) => portableAgentText(value, { repository: hubRoot || workspace, workspace, runtimeRoot });
    const workspaceEntries = fs.readdirSync(workspace);
    const workspaceFailure = workspaceEntries.length ? `agent wrote forbidden workspace files: ${workspaceEntries.join(", ")}` : null;
    const eventFailure = agentFailureFromEvents(result.stdout || "");
    return {
      kind: "real", events: portable(result.stdout || ""), output: finalText, finalText: portable(finalText),
      elapsedMs: Date.now() - started, usage: usageFromEvents(result.stdout || ""),
      process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? eventFailure ?? workspaceFailure },
    };
  } finally {
    fs.rmSync(finalMessage, { force: true });
    fs.rmSync(workspace, { recursive: true, force: true });
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

function loadSuite(suite) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(suite)) throw new Error("suite name is invalid");
  const candidates = [];
  for (const domain of fs.readdirSync(path.join(benchmarkRoot(), "suites"))) {
    const file = path.join(benchmarkRoot(), "suites", domain, suite, "manifest.json");
    if (fs.existsSync(file)) candidates.push(file);
  }
  if (candidates.length !== 1) throw new Error(`expected exactly one suite named ${suite}; found ${candidates.length}`);
  const manifest = JSON.parse(fs.readFileSync(candidates[0], "utf8"));
  return { manifest: { ...manifest, root: path.dirname(candidates[0]) }, directory: path.dirname(candidates[0]) };
}

function loadPair(manifest, pairId) {
  const base = path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, pairId);
  const readArm = (arm) => {
    const directory = path.join(base, arm);
    const run = JSON.parse(fs.readFileSync(path.join(directory, "run.json"), "utf8"));
    const events = fs.readFileSync(path.join(directory, "agent-events.jsonl"), "utf8");
    const prompt = fs.readFileSync(path.join(directory, "prompt.md"), "utf8");
    const admission = validateContextSession(events, {
      arm, pinnedCommit: manifest.hub.commit, limits: manifest.limits, tracker: manifest.tracker ?? null,
    });
    const draft = validateDiscoveryDraft(run.output, {
      arm, trace: arm === "discovery-plus-agentbase" ? admission.trace : null,
    });
    const failures = [...admission.failures, ...draft.failures];
    if (run.promptDigest !== digest(prompt)) failures.push("retained prompt digest does not match prompt bytes");
    if (run.inputDigest !== inputDigest(manifest)) failures.push("retained input digest does not match suite inputs");
    return { ...run, trace: arm === "discovery-plus-agentbase" ? admission.trace : null,
      qualification: { status: failures.length ? "failed" : "passed", failures: [...new Set(failures)] } };
  };
  return {
    base,
    direct: readArm("discovery-only"),
    assisted: readArm("discovery-plus-agentbase"),
  };
}

function validPairId(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/.test(value)) throw new Error("pair ID must be UTC YYYY-MM-DDTHH-MM-SSZ");
  return value;
}

export function recordContextReview({ base, comparison, decision, note, now = () => new Date().toISOString() }) {
  if (comparison.status !== "needs_review" || comparison.ownerReview !== "pending") throw new Error("comparison is not awaiting owner review");
  if (!["accepted", "rejected"].includes(decision) || typeof note !== "string" || !note.trim()) {
    throw new Error("review requires an accepted/rejected decision and a note");
  }
  const review = { decision, note: note.trim(), recordedAt: now() };
  writeImmutableJson(path.join(base, "owner-review.json"), review);
  const final = {
    ...comparison, ownerReview: decision, status: decision === "accepted" ? "passed" : "needs_revision",
    reasons: decision === "accepted" ? comparison.reasons : [...comparison.reasons, `owner rejected evidence: ${note.trim()}`],
  };
  writeImmutableJson(path.join(base, "final.json"), final);
  return { review, final };
}

function parseCli(argv) {
  const args = [...argv];
  const rootIndex = args.indexOf("--root");
  if (rootIndex >= 0) {
    if (!args[rootIndex + 1]) throw new Error("--root requires a path");
    setBenchmarkRoot(args[rootIndex + 1]);
    args.splice(rootIndex, 2);
  }
  return args;
}

async function main(argv) {
  const [command, suite, pairIdArg, ...rest] = parseCli(argv);
  if (!command || !suite) throw new Error("usage: benchmark:context <pair|compare|review> <suite> [UTC-pair-id]");
  const { manifest, directory } = loadSuite(suite);
  if (command === "pair") {
    if (rest.length) throw new Error("unexpected pair arguments");
    const pairId = validPairId(pairIdArg ?? new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z"));
    const prompt = fs.readFileSync(path.join(benchmarkRoot(), "prompts", `${manifest.promptVersion}.md`), "utf8");
    await runContextPair({ manifest, prompt, root: benchmarkRoot(), pairId });
    process.stdout.write(`${path.join(benchmarkRoot(), "results", manifest.domain, manifest.suite, pairId)}\n`);
    return;
  }
  const pairId = validPairId(pairIdArg ?? "");
  const pair = loadPair(manifest, pairId);
  const expectations = JSON.parse(fs.readFileSync(path.join(directory, manifest.expectation), "utf8"));
  if (command === "compare") {
    if (rest.length) throw new Error("unexpected compare arguments");
    const comparison = compareContextPair(pair, expectations);
    writeImmutableJson(path.join(pair.base, "comparison.json"), comparison);
    process.stdout.write(`${comparison.status}\n`);
    return;
  }
  if (command === "review") {
    const decisionAt = rest.indexOf("--decision");
    const noteAt = rest.indexOf("--note");
    const decision = rest[decisionAt + 1];
    const note = rest[noteAt + 1];
    if (!["accepted", "rejected"].includes(decision) || !note?.trim()) throw new Error("review requires --decision accepted|rejected and --note text");
    const comparisonFile = path.join(pair.base, "comparison.json");
    const comparison = JSON.parse(fs.readFileSync(comparisonFile, "utf8"));
    recordContextReview({ base: pair.base, comparison, decision, note });
    process.stdout.write(`${decision}\n`);
    return;
  }
  throw new Error(`unknown context benchmark command: ${command}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
