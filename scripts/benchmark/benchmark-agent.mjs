import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resolveRepositoryIdentity } from "../../src/core/knowledge/index.ts";
import { discoverRepositorySourceState } from "../../src/app/repository-okf/index.ts";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const requiredTools = ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept"];
const v3RequiredTools = [...requiredTools, "validate_okf_relationships"];
const v4RequiredTools = ["index_repository", "get_okf_authoring_schemas", "validate_okf_bundle"];
const v8RequiredTools = ["index_repository", "get_okf_authoring_schemas", "validate_okf_changes"];
const v13RequiredTools = [
  "get_hub_status", "configure_hub", "preflight_hub_ingest", "index_repository", "get_architecture",
  "get_okf_authoring_schemas", "prepare_hub_okf", "validate_okf_changes",
  "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
];
const v13ExactlyOnceTools = v13RequiredTools.filter((tool) => !["get_okf_authoring_schemas", "validate_okf_changes"].includes(tool));
const v13ForbiddenTools = new Set([
  "accept_hub_okf_proposal", "preview_hub_bootstrap", "bootstrap_hub",
  "submit_hub_okf_proposals", "synchronize_hub_okf", "recover_hub_okf",
]);
const v13EnabledTools = [
  ...v13RequiredTools, "search_graph", "trace_path", "get_code_snippet", "search_code",
  "search_hub_okf", "read_hub_okf_concept",
];
const initialIngestPromptVersions = new Set(["okf-author-v13", "okf-author-v14", "okf-author-v15"]);

export function validateV13Lifecycle(mcpTools, guidanceAttempts = []) {
  const guidanceCount = mcpTools.get_okf_authoring_schemas ?? 0;
  const cleanGuidance = guidanceCount === 1
    && (guidanceAttempts.length === 0 || guidanceAttempts[0]?.status === "completed");
  const correctedGuidance = guidanceCount === 2
    && guidanceAttempts[0]?.status === "failed"
    && guidanceAttempts[0]?.code === "INVALID_ARGUMENT"
    && guidanceAttempts[0]?.retryable === true
    && guidanceAttempts[1]?.status === "completed";
  return [
    ...v13ExactlyOnceTools.filter((tool) => mcpTools[tool] !== 1)
      .map((tool) => `${tool} must run exactly once; observed ${mcpTools[tool] ?? 0}`),
    ...(mcpTools.validate_okf_changes >= 1 && mcpTools.validate_okf_changes <= 2
      ? []
      : [`validate_okf_changes must run once, or twice after one repair; observed ${mcpTools.validate_okf_changes ?? 0}`]),
    ...(cleanGuidance || correctedGuidance
      ? []
      : [`get_okf_authoring_schemas must succeed once, or succeed on one correction after retryable INVALID_ARGUMENT; observed ${guidanceCount}`]),
    ...Object.keys(mcpTools).filter((tool) => v13ForbiddenTools.has(tool))
      .map((tool) => `forbidden V13 lifecycle tool observed: ${tool}`),
  ];
}
const authoringTools = new Set([
  "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept", "validate_okf_relationships",
  "get_okf_authoring_schemas", "validate_okf_bundle", "validate_okf_changes",
]);

export function benchmarkProvenanceRepositoryId(source, promptVersion) {
  if (!initialIngestPromptVersions.has(promptVersion)) return source.repositoryId;
  const resolution = resolveRepositoryIdentity({
    displayName: source.displayName,
    remotes: source.identityHints.remotes,
    rootCommits: source.identityHints.rootCommits,
  }, []);
  if (resolution.kind !== "new") throw new Error("isolated Initial Ingest repository identity must be new");
  return resolution.repository.id;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function toml(value) {
  return JSON.stringify(value);
}

export function renderAgentPrompt(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key) => {
    if (values[key] === undefined) throw new Error(`prompt value is missing: ${key}`);
    return values[key];
  });
}

export function portableAgentText(value, { repository, workspace, runtimeRoot }) {
  return value.split(repository).join("<SOURCE_ROOT>")
    .split(workspace).join("<OUTPUT_ROOT>")
    .split(runtimeRoot ?? "\0").join("<RUNTIME_ROOT>")
    .split(projectRoot).join("<AGENTBASE_ROOT>")
    .split(os.homedir()).join("<HOME>");
}

export function buildCodexArgs({ workspace, finalMessage, model, reasoningEffort, arm = "mcp", runtimeRoot, enabledTools }) {
  if (!["mcp", "direct"].includes(arm)) throw new Error(`unknown benchmark arm: ${arm}`);
  const args = [
    "--ask-for-approval", "never", "exec", "--ephemeral", "--json", "--ignore-user-config", "--skip-git-repo-check", "--sandbox", "workspace-write",
    "--model", model, "--cd", workspace, "--output-last-message", finalMessage,
    "--config", `model_reasoning_effort=${toml(reasoningEffort)}`,
  ];
  if (arm === "mcp") args.push(
    "--config", `mcp_servers.agentbase.command=${toml(process.execPath)}`,
    "--config", `mcp_servers.agentbase.args=${toml([path.join(projectRoot, "src", "cli.ts"), "mcp"])}`,
    "--config", `mcp_servers.agentbase.cwd=${toml(projectRoot)}`,
    ...(runtimeRoot ? ["--config", `mcp_servers.agentbase.env={HOME=${toml(path.join(runtimeRoot, "home"))},XDG_CONFIG_HOME=${toml(path.join(runtimeRoot, "config"))},XDG_DATA_HOME=${toml(path.join(runtimeRoot, "data"))},TMPDIR=${toml(path.join(runtimeRoot, "tmp"))}}`] : []),
    ...(enabledTools ? ["--config", `mcp_servers.agentbase.enabled_tools=${toml(enabledTools)}`] : []),
    "--config", "mcp_servers.agentbase.required=true",
    "--config", `mcp_servers.agentbase.default_tools_approval_mode=${toml("approve")}`,
    "--config", "mcp_servers.agentbase.startup_timeout_sec=30",
    "--config", "mcp_servers.agentbase.tool_timeout_sec=180",
  );
  args.push("-");
  return args;
}

function token(value) {
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function serializedBytes(value) {
  const serialized = JSON.stringify(value);
  return serialized === undefined ? 0 : Buffer.byteLength(serialized);
}

function toolError(item) {
  try {
    const text = item?.result?.content?.find((entry) => entry?.type === "text")?.text;
    const parsed = typeof text === "string" ? JSON.parse(text) : {};
    return { code: parsed.code ?? null, retryable: parsed.retryable === true, error: parsed.error ?? null };
  } catch {
    return { code: null, retryable: false, error: null };
  }
}

export function summarizeAgentEvents(events) {
  const completed = new Set();
  let mcpToolCalls = 0;
  let commandExecutions = 0;
  let authoringToolCalls = 0;
  let authoringArgumentBytes = 0;
  let authoringResultBytes = 0;
  const authoringActivity = {};
  const mcpTools = {};
  const guidanceAttempts = [];
  let usage = null;
  let finalValidationIdentities = null;
  for (const line of events.split("\n")) {
    try {
      const event = JSON.parse(line);
      const item = event?.item;
      if (event?.type === "item.completed") {
        if (item?.type === "mcp_tool_call" && typeof item?.tool === "string") {
          if (item.status === "completed") completed.add(item.tool);
          mcpToolCalls += 1;
          mcpTools[item.tool] = (mcpTools[item.tool] ?? 0) + 1;
          if (item.tool === "get_okf_authoring_schemas") {
            guidanceAttempts.push({ status: item.status, ...toolError(item) });
          }
          if (authoringTools.has(item.tool)) {
            const argumentBytes = serializedBytes(item.arguments);
            const resultBytes = serializedBytes(item.result);
            const prior = authoringActivity[item.tool] ?? { calls: 0, argumentBytes: 0, resultBytes: 0 };
            authoringActivity[item.tool] = {
              calls: prior.calls + 1,
              argumentBytes: prior.argumentBytes + argumentBytes,
              resultBytes: prior.resultBytes + resultBytes,
            };
            authoringToolCalls += 1;
            authoringArgumentBytes += argumentBytes;
            authoringResultBytes += resultBytes;
          }
          if (item.tool === "validate_okf_changes" && item.status === "completed" && Array.isArray(item.arguments?.changes)) {
            finalValidationIdentities = item.arguments.changes.map((change) => change?.identity)
              .filter((identity) => typeof identity === "string").sort();
          }
        }
        if (item?.type === "command_execution") commandExecutions += 1;
      }
      if (event?.type === "turn.completed" && event.usage && typeof event.usage === "object") {
        const inputTokens = token(event.usage.input_tokens);
        const cachedInputTokens = token(event.usage.cached_input_tokens);
        usage = {
          inputTokens,
          cachedInputTokens,
          cacheWriteInputTokens: token(event.usage.cache_write_input_tokens),
          uncachedInputTokens: inputTokens !== null && cachedInputTokens !== null && inputTokens >= cachedInputTokens
            ? inputTokens - cachedInputTokens : null,
          outputTokens: token(event.usage.output_tokens),
          reasoningOutputTokens: token(event.usage.reasoning_output_tokens),
        };
      }
    } catch { /* Preserve malformed trace for diagnostics; it cannot prove tool success. */ }
  }
  return {
    usage,
    activity: {
      mcpToolCalls,
      commandExecutions,
      authoringToolCalls,
      authoringArgumentBytes,
      authoringResultBytes,
      authoringTools: Object.fromEntries(Object.entries(authoringActivity).sort(([left], [right]) => left.localeCompare(right))),
      mcpTools: Object.fromEntries(Object.entries(mcpTools).sort(([left], [right]) => left.localeCompare(right))),
      guidance: {
        attempts: guidanceAttempts,
        inputCorrectionsUsed: Math.max(0, guidanceAttempts.length - 1),
        firstAttemptSucceeded: guidanceAttempts[0]?.status === "completed",
      },
      observedSourceReadBytes: null,
      limitation: "event trace does not prove complete source-read volume",
      finalValidationIdentities,
    },
    completedTools: [...completed].sort(),
  };
}

function conceptIdentities(root) {
  const identities = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && entry.name.endsWith(".md") && !["index.md", "log.md", "README.md"].includes(entry.name)) {
        identities.push(path.relative(root, absolute).split(path.sep).join("/").slice(0, -3));
      }
    }
  };
  visit(root);
  return identities.sort();
}

export function validateFinalChangeCoverage(validatedIdentities, finalizedIdentities) {
  if (!Array.isArray(validatedIdentities)) return ["final successful validate_okf_changes identities are unavailable"];
  const validated = new Set(validatedIdentities);
  const missing = finalizedIdentities.filter((identity) => !validated.has(identity));
  const extra = validatedIdentities.filter((identity) => !finalizedIdentities.includes(identity));
  return [
    ...(missing.length ? [`final validate_okf_changes omitted finalized concepts: ${missing.join(", ")}`] : []),
    ...(extra.length ? [`final validate_okf_changes included non-finalized concepts: ${extra.join(", ")}`] : []),
  ];
}

function toolUsage(completedTools, arm, promptVersion) {
  if (arm === "direct") return {};
  const completed = new Set(completedTools);
  const required = ["okf-author-v8", "okf-author-v9", "okf-author-v10", "okf-author-v11", "okf-author-v12"].includes(promptVersion)
    ? v8RequiredTools
    : initialIngestPromptVersions.has(promptVersion) ? v13RequiredTools
    : ["okf-author-v4", "okf-author-v5", "okf-author-v6", "okf-author-v7"].includes(promptVersion)
      ? v4RequiredTools
      : promptVersion === "okf-author-v3" ? v3RequiredTools : requiredTools;
  return Object.fromEntries(required.map((tool) => [tool, completed.has(tool)]));
}

export function requiredToolFailures(usage, observedTools) {
  return Object.entries(usage).filter(([, used]) => !used).map(([tool]) => observedTools[tool]
    ? `required MCP tool did not complete successfully: ${tool}`
    : `required MCP tool not observed: ${tool}`);
}

function validateAgentWorkspace(workspace) {
  const entries = fs.readdirSync(workspace).sort();
  if (entries.length !== 1 || entries[0] !== "okf") {
    throw new Error(`agent workspace must contain only okf/, found: ${entries.join(", ") || "nothing"}`);
  }
  if (!fs.statSync(path.join(workspace, "okf")).isDirectory()) throw new Error("agent output okf is not a directory");
}

export function runAgentRepository({
  manifest, entry, repository, root, executable = manifest.agent.executable, arm = "mcp",
}) {
  if (!["mcp", "direct"].includes(arm)) throw new Error(`unknown benchmark arm: ${arm}`);
  const version = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  const actualVersion = version.status === 0 ? version.stdout.trim() : "";
  if (actualVersion !== manifest.agent.version) {
    throw new Error(`${entry.id}: expected ${manifest.agent.version}, found ${actualVersion || "unavailable"}`);
  }
  fs.mkdirSync(root, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-benchmark-"));
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-runtime-"));
  const runtimeTmp = path.join(runtimeRoot, "tmp");
  fs.mkdirSync(path.join(runtimeRoot, "home"));
  fs.mkdirSync(runtimeTmp, { mode: 0o700 });
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const source = discoverRepositorySourceState(repository, startedAt);
  const promptVersion = arm === "direct"
    ? (manifest.directPromptVersion ?? "okf-author-direct-v1")
    : manifest.promptVersion;
  const template = fs.readFileSync(path.join(projectRoot, "benchmark", "prompts", `${promptVersion}.md`), "utf8");
  const prompt = renderAgentPrompt(template, {
    SOURCE_ROOT: repository,
    OUTPUT_ROOT: workspace,
    REPOSITORY_ID: source.repositoryId,
    CATALOG_VERSION: manifest.catalogVersion,
    CONFIRMED_DOMAIN: entry.confirmedDomain
      ? `${entry.confirmedDomain.title} (${entry.confirmedDomain.identity}); evidence ${entry.confirmedDomain.evidenceResource}`
      : "None; do not infer a Domain from repository or product names",
  });
  const portablePrompt = renderAgentPrompt(template, {
    SOURCE_ROOT: "<SOURCE_ROOT>",
    OUTPUT_ROOT: "<OUTPUT_ROOT>",
    REPOSITORY_ID: source.repositoryId,
    CATALOG_VERSION: manifest.catalogVersion,
    CONFIRMED_DOMAIN: entry.confirmedDomain
      ? `${entry.confirmedDomain.title} (${entry.confirmedDomain.identity}); evidence ${entry.confirmedDomain.evidenceResource}`
      : "None; do not infer a Domain from repository or product names",
  });
  const promptFile = path.join(root, "prompt.md");
  const eventsFile = path.join(root, "agent-events.jsonl");
  const finalMessage = path.join(root, "agent-final.md");
  fs.writeFileSync(promptFile, portablePrompt);
  const run = {
    suite: manifest.suite,
    repository: entry.id,
    arm,
    kind: entry.kind,
    fixturePath: entry.path,
    fixtureCommit: entry.commit,
    sourceRepositoryId: source.repositoryId,
    provenanceRepositoryId: benchmarkProvenanceRepositoryId(source, promptVersion),
    catalogVersion: manifest.catalogVersion,
    promptVersion,
    promptDigest: `sha256:${createHash("sha256").update(portablePrompt).digest("hex")}`,
    agent: { ...manifest.agent, executable, actualVersion },
    startedAt,
    completedAt: null,
    outcome: "running",
  };
  writeJson(path.join(root, "run.json"), run);
  const args = buildCodexArgs({
    workspace, finalMessage, model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort, arm, runtimeRoot,
    ...(initialIngestPromptVersions.has(promptVersion) ? { enabledTools: v13EnabledTools } : {}),
  });
  const result = spawnSync(executable, args, {
    cwd: projectRoot,
    input: prompt,
    encoding: "utf8",
    timeout: manifest.agent.timeoutMs,
    maxBuffer: 50 * 1024 * 1024,
    env: {
      ...process.env,
      TMPDIR: runtimeTmp,
      XDG_CONFIG_HOME: path.join(runtimeRoot, "config"),
      XDG_DATA_HOME: path.join(runtimeRoot, "data"),
    },
  });
  const portable = (value) => portableAgentText(value, { repository, workspace, runtimeRoot });
  fs.writeFileSync(eventsFile, portable(result.stdout || ""));
  if (fs.existsSync(finalMessage)) fs.writeFileSync(finalMessage, portable(fs.readFileSync(finalMessage, "utf8")));
  if (result.stderr) fs.writeFileSync(path.join(root, "agent-stderr.txt"), portable(result.stderr.slice(0, 1024 * 1024)));
  const summary = summarizeAgentEvents(result.stdout || "");
  let failure;
  try {
    const after = discoverRepositorySourceState(repository);
    if (after.commit !== source.commit || after.dirty !== source.dirty || after.dirtyDigest !== source.dirtyDigest) {
      throw new Error("source repository changed during agent run");
    }
    if (result.status !== 0) throw new Error(`agent exited ${result.status ?? `by ${result.signal ?? "timeout"}`}`);
    validateAgentWorkspace(workspace);
    const coverageFailures = initialIngestPromptVersions.has(promptVersion)
      ? validateFinalChangeCoverage(summary.activity.finalValidationIdentities, conceptIdentities(path.join(workspace, "okf"))) : [];
    if (coverageFailures.length) throw new Error(coverageFailures.join("; "));
    fs.cpSync(path.join(workspace, "okf"), path.join(root, "okf"), { recursive: true });
  } catch (error) {
    failure = error instanceof Error ? error.message : "unknown agent failure";
  }
  const usage = toolUsage(summary.completedTools, arm, promptVersion);
  const v13LifecycleFailures = initialIngestPromptVersions.has(promptVersion)
    ? validateV13Lifecycle(summary.activity.mcpTools, summary.activity.guidance.attempts) : [];
  const directMcpFailure = arm === "direct" && summary.activity.mcpToolCalls
    ? ["direct arm unexpectedly observed MCP tool calls"] : [];
  const completed = {
    ...run,
    completedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedMs,
    outcome: failure ? "failed" : "succeeded",
    process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? null },
    usage: summary.usage,
    activity: summary.activity,
    requiredToolUsage: usage,
    failures: [
      ...(failure ? [failure] : []),
      ...directMcpFailure,
      ...requiredToolFailures(usage, summary.activity.mcpTools),
      ...v13LifecycleFailures,
    ],
  };
  if (completed.failures.length) completed.outcome = "failed";
  writeJson(path.join(root, "run.json"), completed);
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.rmSync(runtimeRoot, { recursive: true, force: true });
  return completed;
}
