import os from "node:os";
import path from "node:path";

import { projectRoot } from "./benchmark-paths.mjs";

const toml = JSON.stringify;

export function renderAgentPrompt(template, values) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_match, key) => {
    if (values[key] === undefined) throw new Error(`prompt value is missing: ${key}`);
    return values[key];
  });
}

export function portableAgentText(value, { repository, workspace, runtimeRoot }) {
  return value.split(repository).join("<SOURCE_ROOT>").split(workspace).join("<OUTPUT_ROOT>")
    .split(runtimeRoot ?? "\0").join("<RUNTIME_ROOT>").split(projectRoot).join("<AGENTBASE_ROOT>")
    .split(os.homedir()).join("<HOME>");
}

export function buildCodexArgs({ workspace, finalMessage, model, reasoningEffort, arm = "mcp", runtimeRoot, enabledTools, trackerRoot, disableShell = arm === "direct" }) {
  if (!["mcp", "direct"].includes(arm)) throw new Error(`unknown benchmark arm: ${arm}`);
  const args = ["--ask-for-approval", "never", "exec", "--ephemeral", "--json", "--ignore-user-config",
    "--skip-git-repo-check", "--sandbox", "workspace-write", "--model", model, "--cd", workspace,
    "--output-last-message", finalMessage, "--config", `model_reasoning_effort=${toml(reasoningEffort)}`];
  if (disableShell) args.push("--disable", "shell_tool");
  if (arm === "mcp") args.push(
    "--config", `mcp_servers.agentbase.command=${toml(process.execPath)}`,
    "--config", `mcp_servers.agentbase.args=${toml([path.join(projectRoot, "src", "cli.ts"), "mcp"])}`,
    "--config", `mcp_servers.agentbase.cwd=${toml(projectRoot)}`,
    ...(runtimeRoot ? ["--config", `mcp_servers.agentbase.env={HOME=${toml(path.join(runtimeRoot, "home"))},AGENTBASE_HOME=${toml(path.join(runtimeRoot, "agentbase"))},XDG_CONFIG_HOME=${toml(path.join(runtimeRoot, "config"))},XDG_DATA_HOME=${toml(path.join(runtimeRoot, "data"))},TMPDIR=${toml(path.join(runtimeRoot, "tmp"))}}`] : []),
    ...(enabledTools ? ["--config", `mcp_servers.agentbase.enabled_tools=${toml(enabledTools)}`] : []),
    "--config", "mcp_servers.agentbase.required=true", "--config", `mcp_servers.agentbase.default_tools_approval_mode=${toml("approve")}`,
    "--config", "mcp_servers.agentbase.startup_timeout_sec=30", "--config", "mcp_servers.agentbase.tool_timeout_sec=180");
  if (trackerRoot) args.push(
    "--config", `mcp_servers.tracker.command=${toml(process.execPath)}`,
    "--config", `mcp_servers.tracker.args=${toml([path.join(projectRoot, "scripts", "benchmark", "tracker-fixture-mcp.mjs"), trackerRoot])}`,
    "--config", `mcp_servers.tracker.cwd=${toml(projectRoot)}`, "--config", "mcp_servers.tracker.required=true",
    "--config", `mcp_servers.tracker.enabled_tools=${toml(["search_tracker", "get_tracker_artifact", "list_tracker_relations"])}`,
    "--config", `mcp_servers.tracker.default_tools_approval_mode=${toml("approve")}`,
    "--config", "mcp_servers.tracker.startup_timeout_sec=10", "--config", "mcp_servers.tracker.tool_timeout_sec=30");
  args.push("-");
  return args;
}
