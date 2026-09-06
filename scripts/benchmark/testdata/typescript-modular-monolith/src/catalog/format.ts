import type { CatalogEntry } from "./models.ts";

export function formatEntry(entry: CatalogEntry): string {
  return `${entry.name}:${entry.publicPath}`;
}
