#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const GIT_ENVIRONMENT = {
  PATH: "/usr/bin:/bin",
  LANG: "C.UTF-8",
  LC_ALL: "C.UTF-8",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_TERMINAL_PROMPT: "0",
};

function git(cwd, args, operation) {
  const result = spawnSync("/usr/bin/git", args, {
    cwd,
    encoding: "utf8",
    env: GIT_ENVIRONMENT,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`${operation} failed with Git status ${result.status ?? 1}`);
  return result.stdout.trim();
}

function redactRemote(value) {
  return value
    .replace(/(https?:\/\/)[^/@\s]+@/g, "$1<redacted>@")
    .replace(/([?&](?:token|access_token)=)[^&\s]+/gi, "$1<redacted>");
}

function inspectPath(value) {
  const absolute = path.resolve(value);
  if (!fs.existsSync(absolute)) return { path: absolute, exists: false, symlink: false };
  const information = fs.lstatSync(absolute);
  return {
    path: absolute,
    exists: true,
    symlink: information.isSymbolicLink(),
    resolved: information.isSymbolicLink() ? undefined : fs.realpathSync(absolute),
  };
}

export function inspectRepository(value) {
  const inspected = inspectPath(value);
  if (!inspected.exists || inspected.symlink || !fs.existsSync(path.join(inspected.path, ".git"))) {
    return { ...inspected, git: false };
  }
  const remotes = git(inspected.path, ["remote", "-v"], "inspect remotes")
    .split("\n")
    .filter(Boolean)
    .map(redactRemote);
  return {
    ...inspected,
    git: true,
    head: git(inspected.path, ["rev-parse", "HEAD"], "inspect HEAD"),
    branch: git(inspected.path, ["branch", "--show-current"], "inspect branch") || "(detached)",
    dirty: git(inspected.path, ["status", "--porcelain=v1", "--untracked-files=all"], "inspect worktree")
      .split("\n")
      .filter(Boolean),
    remotes,
  };
}

function assertCanonicalTarget(target, expectedName) {
  const absolute = path.resolve(target);
  if (path.basename(absolute) !== expectedName) throw new Error(`canonical target must be named ${expectedName}`);
  if (fs.existsSync(absolute)) throw new Error(`canonical target already exists: ${absolute}`);
  if (fs.existsSync(path.dirname(absolute)) && fs.lstatSync(path.dirname(absolute)).isSymbolicLink()) {
    throw new Error("canonical target parent cannot be a symlink");
  }
  return absolute;
}

export function createCanonicalMcp({ source, target, expectedHead }) {
  const sourceReport = inspectRepository(source);
  if (!sourceReport.git || sourceReport.symlink) throw new Error("AgentBase-MCP source must be an admitted non-symlink Git worktree");
  if (sourceReport.head !== expectedHead) throw new Error("AgentBase-MCP source HEAD differs from the approved stabilization commit");
  if (sourceReport.dirty.length) throw new Error("AgentBase-MCP source must be stabilized and clean before canonical clone creation");
  const destination = assertCanonicalTarget(target, "AgentBase-MCP");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  git(path.dirname(destination), ["clone", "--no-hardlinks", sourceReport.path, destination], "create independent AgentBase-MCP clone");
  if (git(destination, ["rev-parse", "HEAD"], "verify canonical MCP HEAD") !== expectedHead) {
    throw new Error("canonical AgentBase-MCP clone has unexpected HEAD");
  }
  return inspectRepository(destination);
}

export function createCanonicalHub({ remote, target }) {
  if (!/^(?:https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git|git@github\.com:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git)$/.test(remote)) {
    throw new Error("AgentBase-Hub remote must be one exact GitHub repository URL");
  }
  const destination = assertCanonicalTarget(target, "AgentBase-Hub");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  git(path.dirname(destination), ["clone", "--branch", "main", "--single-branch", remote, destination], "clone canonical AgentBase-Hub");
  return inspectRepository(destination);
}

function values(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index], value = args[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--") || result[key]) {
      throw new Error("migration arguments must be unique --name value pairs");
    }
    result[key] = value;
  }
  return result;
}

export function main(args = process.argv.slice(2)) {
  const [command = "report", ...rest] = args;
  const options = values(rest);
  const workspace = path.resolve(import.meta.dirname, "../..");
  const mcpSource = options["--mcp-source"] ?? path.join(workspace, "agentbase-next");
  const hubSource = options["--hub-source"] ?? path.join(workspace, "agentbase-hub");
  const mcpTarget = options["--mcp-target"] ?? path.join(workspace, "AgentBase-MCP");
  const hubTarget = options["--hub-target"] ?? path.join(workspace, "AgentBase-Hub");
  if (command === "report") {
    const report = {
      action: "report-only",
      sources: { mcp: inspectRepository(mcpSource), hub: inspectRepository(hubSource) },
      targets: { mcp: inspectPath(mcpTarget), hub: inspectPath(hubTarget) },
      externalCutover: "not-authorized",
      rollback: { mcp: path.resolve(mcpSource), hub: path.resolve(hubSource) },
    };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return 0;
  }
  if (command === "create-mcp") {
    const report = createCanonicalMcp({
      source: mcpSource,
      target: mcpTarget,
      expectedHead: options["--expected-head"] ?? "",
    });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return 0;
  }
  if (command === "create-hub") {
    const report = createCanonicalHub({ remote: options["--hub-remote"] ?? "", target: hubTarget });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return 0;
  }
  throw new Error("migration command must be report, create-mcp or create-hub");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = main(); }
  catch (error) {
    process.stderr.write(`Migration failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    process.exitCode = 1;
  }
}
