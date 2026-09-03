import type { CatalogEntry } from "../catalog/index.ts";

export function renderInspection(root: string, modules: readonly CatalogEntry[]): string {
  return `${root}\n${modules.map((module) => module.name).join("\n")}`;
}
