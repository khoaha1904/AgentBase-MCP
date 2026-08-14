import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { discoverRepositorySourceState } from "../src/app/repository-okf/index.ts";

const projectRoot = path.resolve(import.meta.dirname, "..");
const requiredTools = ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept"];

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

export function buildCodexArgs({ workspace, finalMessage, model, reasoningEffort }) {
  return [
    "--ask-for-approval", "never", "exec", "--ephemeral", "--json", "--ignore-user-config", "--skip-git-repo-check", "--sandbox", "workspace-write",
    "--model", model, "--cd", workspace, "--output-last-message", finalMessage,
    "--config", `model_reasoning_effort=${toml(reasoningEffort)}`,
    "--config", `mcp_servers.agentbase.command=${toml(process.execPath)}`,
    "--config", `mcp_servers.agentbase.args=${toml([path.join(projectRoot, "src", "cli.ts"), "mcp"])}`,
    "--config", `mcp_servers.agentbase.cwd=${toml(projectRoot)}`,
    "--config", "mcp_servers.agentbase.required=true",
    "--config", `mcp_servers.agentbase.default_tools_approval_mode=${toml("approve")}`,
    "--config", "mcp_servers.agentbase.startup_timeout_sec=30",
    "--config", "mcp_servers.agentbase.tool_timeout_sec=180",
    "-",
  ];
}

function toolUsage(events) {
  const completed = new Set();
  for (const line of events.split("\n")) {
    try {
      const event = JSON.parse(line);
      const item = event?.item;
      if (event?.type === "item.completed" && item?.type === "mcp_tool_call"
        && item?.status === "completed" && typeof item?.tool === "string") completed.add(item.tool);
    } catch { /* Preserve malformed trace for diagnostics; it cannot prove tool success. */ }
  }
  return Object.fromEntries(requiredTools.map((tool) => [tool, completed.has(tool)]));
}

function validateAgentWorkspace(workspace) {
  const entries = fs.readdirSync(workspace).sort();
  if (entries.length !== 1 || entries[0] !== "okf") {
    throw new Error(`agent workspace must contain only okf/, found: ${entries.join(", ") || "nothing"}`);
  }
  if (!fs.statSync(path.join(workspace, "okf")).isDirectory()) throw new Error("agent output okf is not a directory");
}

export function runAgentRepository({ manifest, entry, repository, root, executable = manifest.agent.executable }) {
  const version = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  const actualVersion = version.status === 0 ? version.stdout.trim() : "";
  if (actualVersion !== manifest.agent.version) {
    throw new Error(`${entry.id}: expected ${manifest.agent.version}, found ${actualVersion || "unavailable"}`);
  }
  fs.mkdirSync(root, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-benchmark-"));
  const startedAt = new Date().toISOString();
  const source = discoverRepositorySourceState(repository, startedAt);
  const template = fs.readFileSync(path.join(projectRoot, "benchmark", "prompts", `${manifest.promptVersion}.md`), "utf8");
  const prompt = renderAgentPrompt(template, {
    SOURCE_ROOT: repository,
    OUTPUT_ROOT: workspace,
    REPOSITORY_ID: source.repositoryId,
    CATALOG_VERSION: manifest.catalogVersion,
  });
  const portablePrompt = renderAgentPrompt(template, {
    SOURCE_ROOT: "<SOURCE_ROOT>",
    OUTPUT_ROOT: "<OUTPUT_ROOT>",
    REPOSITORY_ID: source.repositoryId,
    CATALOG_VERSION: manifest.catalogVersion,
  });
  const promptFile = path.join(root, "prompt.md");
  const eventsFile = path.join(root, "agent-events.jsonl");
  const finalMessage = path.join(root, "agent-final.md");
  fs.writeFileSync(promptFile, portablePrompt);
  const run = {
    suite: manifest.suite,
    repository: entry.id,
    kind: entry.kind,
    fixturePath: entry.path,
    fixtureCommit: entry.commit,
    sourceRepositoryId: source.repositoryId,
    catalogVersion: manifest.catalogVersion,
    promptVersion: manifest.promptVersion,
    promptDigest: `sha256:${createHash("sha256").update(portablePrompt).digest("hex")}`,
    agent: { ...manifest.agent, executable, actualVersion },
    startedAt,
    completedAt: null,
    outcome: "running",
  };
  writeJson(path.join(root, "run.json"), run);
  const args = buildCodexArgs({ workspace, finalMessage, model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort });
  const result = spawnSync(executable, args, {
    cwd: projectRoot,
    input: prompt,
    encoding: "utf8",
    timeout: manifest.agent.timeoutMs,
    maxBuffer: 50 * 1024 * 1024,
  });
  const portable = (value) => value.split(repository).join("<SOURCE_ROOT>").split(workspace).join("<OUTPUT_ROOT>").split(projectRoot).join("<AGENTBASE_ROOT>");
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
  const usage = toolUsage(result.stdout || "");
  const completed = {
    ...run,
    completedAt: new Date().toISOString(),
    outcome: failure ? "failed" : "succeeded",
    process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? null },
    requiredToolUsage: usage,
    failures: [...(failure ? [failure] : []), ...Object.entries(usage).filter(([, used]) => !used).map(([tool]) => `required MCP tool not observed: ${tool}`)],
  };
  if (completed.failures.length) completed.outcome = "failed";
  writeJson(path.join(root, "run.json"), completed);
  fs.rmSync(workspace, { recursive: true, force: true });
  return completed;
}
