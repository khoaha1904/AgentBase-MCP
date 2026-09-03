import type { CatalogEntry } from "./models.ts";

export function listModules(): readonly CatalogEntry[] {
  return [{ name: "catalog", publicPath: "src/catalog/index.ts" }];
}
