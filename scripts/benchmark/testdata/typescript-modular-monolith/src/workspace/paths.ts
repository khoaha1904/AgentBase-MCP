import { allowWorkspace } from "./policy.ts";

export function resolveWorkspace(path: string): string {
  if (!allowWorkspace(path)) throw new Error("Workspace path is not allowed");
  return path;
}
