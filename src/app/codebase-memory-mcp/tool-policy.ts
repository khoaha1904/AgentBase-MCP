import fs from "node:fs";
import path from "node:path";

export type ControlledIndex = Readonly<{
  repositoryRoot: string;
  arguments: Readonly<Record<string, unknown>>;
}>;

export class McpPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "McpPolicyError";
  }
}

export function controlledIndex(argumentsValue: Readonly<Record<string, unknown>>): ControlledIndex {
  const candidate = argumentsValue.repo_path;
  if (typeof candidate !== "string" || !path.isAbsolute(candidate)) {
    throw new McpPolicyError("repo_path must be an absolute repository directory");
  }
  let repositoryRoot: string;
  try {
    repositoryRoot = fs.realpathSync(candidate);
    if (!fs.statSync(repositoryRoot).isDirectory()) throw new Error("not a directory");
  } catch {
    throw new McpPolicyError("repo_path must resolve to an existing repository directory");
  }
  if (argumentsValue.persistence === true) throw new McpPolicyError("source-local persistence is disabled; use persistence:false");
  if (argumentsValue.mode === "cross-repo-intelligence" || argumentsValue.target_projects !== undefined) {
    throw new McpPolicyError("cross-repository indexing is not available in the Part 1 MCP surface");
  }
  return {
    repositoryRoot,
    arguments: { ...argumentsValue, repo_path: repositoryRoot, persistence: false },
  };
}
