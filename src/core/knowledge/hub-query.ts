import path from "node:path";

export type HubQueryReader = Readonly<{
  commit: string;
  listMarkdownPaths(): Promise<readonly string[]>;
  readMarkdown(relativePath: string): Promise<string>;
}>;

export type HubQueryMatch = Readonly<{
  commit: string;
  path: string;
  excerpt: string;
}>;

export type HubSearchOptions = Readonly<{
  limit?: number;
  maximumDocumentBytes?: number;
}>;

export function normalizeHubConceptPath(value: string): string {
  if (value.includes("\0") || value.includes("\\") || path.posix.isAbsolute(value)) throw new Error("Hub concept path must be normalized and relative");
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized.startsWith("../") || !normalized.endsWith(".md")) throw new Error("Hub concept path must identify one Markdown file");
  return normalized;
}

export async function readHubConcept(reader: HubQueryReader, relativePath: string, maximumBytes = 256 * 1024): Promise<HubQueryMatch> {
  const admittedPath = normalizeHubConceptPath(relativePath);
  const content = await reader.readMarkdown(admittedPath);
  if (Buffer.byteLength(content) > maximumBytes) throw new Error("Hub concept exceeds read limit");
  return { commit: reader.commit, path: admittedPath, excerpt: content };
}

export async function searchHubConcepts(reader: HubQueryReader, query: string, options: HubSearchOptions = {}): Promise<readonly HubQueryMatch[]> {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle || needle.length > 256) throw new Error("Hub query must contain 1..256 characters");
  const limit = options.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Hub query limit must be 1..100");
  const maximumBytes = options.maximumDocumentBytes ?? 256 * 1024;
  const matches: HubQueryMatch[] = [];
  const paths = [...await reader.listMarkdownPaths()].map(normalizeHubConceptPath).sort();
  for (const relativePath of paths) {
    if (matches.length === limit) break;
    const content = await reader.readMarkdown(relativePath);
    if (Buffer.byteLength(content) > maximumBytes) continue;
    const lowered = content.toLocaleLowerCase();
    const offset = Math.max(0, lowered.indexOf(needle));
    if (!relativePath.toLocaleLowerCase().includes(needle) && !lowered.includes(needle)) continue;
    const excerpt = content.replace(/\s+/g, " ").slice(offset, offset + 320).trim();
    matches.push({ commit: reader.commit, path: relativePath, excerpt });
  }
  return matches;
}
