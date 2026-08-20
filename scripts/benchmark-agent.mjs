import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { discoverRepositorySourceState } from "../src/app/repository-okf/index.ts";

const projectRoot = path.resolve(import.meta.dirname, "..");
const requiredTools = ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept"];
const v3RequiredTools = [...requiredTools, "validate_okf_relationships"];
const v4RequiredTools = ["index_repository", "get_okf_authoring_schemas", "validate_okf_bundle"];
const v8RequiredTools = ["index_repository", "get_okf_authoring_schemas", "validate_okf_changes"];
const authoringTools = new Set([
  "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept", "validate_okf_relationships",
  "get_okf_authoring_schemas", "validate_okf_bundle", "validate_okf_changes",
]);

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

export function portableAgentText(value, { repository, workspace }) {
  return value.split(repository).join("<SOURCE_ROOT>")
    .split(workspace).join("<OUTPUT_ROOT>")
    .split(projectRoot).join("<AGENTBASE_ROOT>")
    .split(os.homedir()).join("<HOME>");
}

export function buildCodexArgs({ workspace, finalMessage, model, reasoningEffort, arm = "mcp" }) {
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

export function summarizeAgentEvents(events) {
  const completed = new Set();
  let mcpToolCalls = 0;
  let commandExecutions = 0;
  let authoringToolCalls = 0;
  let authoringArgumentBytes = 0;
  let authoringResultBytes = 0;
  const authoringActivity = {};
  let usage = null;
  for (const line of events.split("\n")) {
    try {
      const event = JSON.parse(line);
      const item = event?.item;
      if (event?.type === "item.completed" && item?.status === "completed") {
        if (item?.type === "mcp_tool_call" && typeof item?.tool === "string") {
          completed.add(item.tool);
          mcpToolCalls += 1;
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
      observedSourceReadBytes: null,
      limitation: "event trace does not prove complete source-read volume",
    },
    completedTools: [...completed].sort(),
  };
}

function toolUsage(completedTools, arm, promptVersion) {
  if (arm === "direct") return {};
  const completed = new Set(completedTools);
  const required = ["okf-author-v8", "okf-author-v9", "okf-author-v10", "okf-author-v11", "okf-author-v12"].includes(promptVersion)
    ? v8RequiredTools
    : ["okf-author-v4", "okf-author-v5", "okf-author-v6", "okf-author-v7"].includes(promptVersion)
      ? v4RequiredTools
      : promptVersion === "okf-author-v3" ? v3RequiredTools : requiredTools;
  return Object.fromEntries(required.map((tool) => [tool, completed.has(tool)]));
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
    workspace, finalMessage, model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort, arm,
  });
  const result = spawnSync(executable, args, {
    cwd: projectRoot,
    input: prompt,
    encoding: "utf8",
    timeout: manifest.agent.timeoutMs,
    maxBuffer: 50 * 1024 * 1024,
  });
  const portable = (value) => portableAgentText(value, { repository, workspace });
  fs.writeFileSync(eventsFile, portable(result.stdout || ""));
  if (fs.existsSync(finalMessage)) fs.writeFileSync(finalMessage, portable(fs.readFileSync(finalMessage, "utf8")));
  if (result.stderr) fs.writeFileSync(path.join(root, "agent-stderr.txt"), portable(result.stderr.slice(0, 1024 * 1024)));
  let failure;
  try {
    const after = discoverRepositorySourceState(repository);
    if (after.commit !== source.commit || after.dirty !== source.dirty || after.dirtyDigest !== source.dirtyDigest) {
      throw new Error("source repository changed during agent run");
    }
    if (result.status !== 0) throw new Error(`agent exited ${result.status ?? `by ${result.signal ?? "timeout"}`}`);
    validateAgentWorkspace(workspace);
    fs.cpSync(path.join(workspace, "okf"), path.join(root, "okf"), { recursive: true });
  } catch (error) {
    failure = error instanceof Error ? error.message : "unknown agent failure";
  }
  const summary = summarizeAgentEvents(result.stdout || "");
  const usage = toolUsage(summary.completedTools, arm, promptVersion);
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
      ...Object.entries(usage).filter(([, used]) => !used).map(([tool]) => `required MCP tool not observed: ${tool}`),
    ],
  };
  if (completed.failures.length) completed.outcome = "failed";
  writeJson(path.join(root, "run.json"), completed);
  fs.rmSync(workspace, { recursive: true, force: true });
  return completed;
}
