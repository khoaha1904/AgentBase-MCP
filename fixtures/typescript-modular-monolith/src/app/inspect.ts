import { listModules } from "../catalog/index.ts";
import { resolveWorkspace } from "../workspace/index.ts";

export function inspectWorkspace(path: string) {
  return { root: resolveWorkspace(path), modules: listModules() };
}
