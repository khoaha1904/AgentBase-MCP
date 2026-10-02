import fs from "node:fs";
import path from "node:path";

export type ControlledDiscovery = Readonly<{
  repositoryRoot: string;
  discoveryMode: "standard" | "expanded";
  discoveryConfirmation?: unknown;
}>;

export class McpPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "McpPolicyError";
  }
}

function selectedGitRoot(candidate: string): string {
  let current = fs.realpathSync(candidate);
  while (true) {
    const marker = path.join(current, ".git");
    try {
      const stat = fs.lstatSync(marker);
      if (stat.isDirectory() || stat.isFile()) return current;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) throw new McpPolicyError("repo_path must be inside an existing Git repository");
    current = parent;
  }
}

export function controlledDiscovery(argumentsValue: Readonly<Record<string, unknown>>): ControlledDiscovery {
  const { discovery_mode: discoveryMode = "standard", discovery_confirmation: discoveryConfirmation,
  } = argumentsValue;
  if (Object.keys(argumentsValue).some((key) => !["repo_path", "discovery_mode", "discovery_confirmation"].includes(key))) {
    throw new McpPolicyError("discovery accepts only repo_path, discovery_mode and discovery_confirmation");
  }
  if (discoveryMode !== "standard" && discoveryMode !== "expanded") throw new McpPolicyError("invalid discovery_mode");
  if (discoveryMode === "standard" && discoveryConfirmation !== undefined) {
    throw new McpPolicyError("discovery_confirmation is only allowed for expanded discovery");
  }
  const candidate = argumentsValue.repo_path;
  if (typeof candidate !== "string" || !path.isAbsolute(candidate)) {
    throw new McpPolicyError("repo_path must be an absolute repository directory");
  }
  let repositoryRoot: string;
  try {
    const selected = fs.realpathSync(candidate);
    if (!fs.statSync(selected).isDirectory()) throw new Error("not a directory");
    repositoryRoot = selectedGitRoot(selected);
  } catch (error) {
    if (error instanceof McpPolicyError) throw error;
    throw new McpPolicyError("repo_path must resolve to a readable repository directory");
  }
  try {
    fs.accessSync(repositoryRoot, fs.constants.R_OK);
  } catch {
    throw new McpPolicyError("repo_path must resolve to a readable repository directory");
  }
  return {
    repositoryRoot,
    discoveryMode,
    ...(discoveryConfirmation !== undefined ? { discoveryConfirmation } : {}),
  };
}
