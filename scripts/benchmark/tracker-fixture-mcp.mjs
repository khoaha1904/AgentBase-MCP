import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { fromJsonSchema, McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { parse as parseYaml } from "yaml";

const ARTIFACT_DIRS = ["epics", "features", "user-stories", "bugs"];

function json(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

function readArtifacts(root) {
  const artifacts = new Map();
  for (const directory of ARTIFACT_DIRS) {
    const absolute = path.join(root, directory);
    if (!fs.existsSync(absolute)) continue;
    for (const name of fs.readdirSync(absolute).filter((item) => item.endsWith(".md")).sort()) {
      const relative = path.join(directory, name).split(path.sep).join("/");
      const source = fs.readFileSync(path.join(root, relative), "utf8");
      const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!match) throw new Error(`tracker artifact has no frontmatter: ${relative}`);
      const metadata = parseYaml(match[1]);
      if (!metadata?.id || artifacts.has(metadata.id)) throw new Error(`invalid or duplicate tracker artifact ID: ${metadata?.id ?? relative}`);
      artifacts.set(metadata.id, {
        id: metadata.id, type: metadata.type, title: metadata.title, status: metadata.status,
        priority: metadata.priority ?? null, relations: metadata.relations ?? [], path: relative,
        body: match[2].trim(),
      });
    }
  }
  return artifacts;
}

function artifactResult(artifacts, id) {
  const artifact = artifacts.get(id);
  if (!artifact) return json({ code: "NOT_FOUND", error: `tracker artifact not found: ${id}` });
  return json({ ...artifact, relations: artifact.relations.map((relation) => ({ ...relation,
    target_artifact: artifacts.get(relation.target)?.title ?? null,
  })) });
}

export function createTrackerMcpServer(root) {
  if (!root || !path.isAbsolute(root)) throw new Error("tracker fixture root must be an absolute path");
  const artifacts = readArtifacts(root);
  const server = new McpServer({ name: "agentbase-tracker-fixture", version: "0.1.0" });
  const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  server.registerTool("search_tracker", {
    description: "Search the local tracker fixture by title, ID, type or body.",
    inputSchema: fromJsonSchema({ type: "object", properties: { query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 8 } }, required: ["query"] }),
    annotations: readOnly,
  }, async ({ query, limit = 8 }) => {
    const needle = String(query ?? "").trim().toLowerCase();
    if (!needle) return json({ code: "INVALID_ARGUMENT", error: "query must not be empty" });
    const results = [...artifacts.values()].filter((artifact) =>
      [artifact.id, artifact.type, artifact.title, artifact.status, artifact.body].some((value) => String(value ?? "").toLowerCase().includes(needle)))
      .slice(0, limit).map(({ body, ...summary }) => summary);
    return json({ query: needle, results });
  });
  server.registerTool("get_tracker_artifact", {
    description: "Read one exact tracker artifact and its linked relations.",
    inputSchema: fromJsonSchema({ type: "object", properties: { id: { type: "string" } }, required: ["id"] }),
    annotations: readOnly,
  }, async ({ id }) => artifactResult(artifacts, String(id ?? "")));
  server.registerTool("list_tracker_relations", {
    description: "List direct tracker links for one artifact.",
    inputSchema: fromJsonSchema({ type: "object", properties: { id: { type: "string" } }, required: ["id"] }),
    annotations: readOnly,
  }, async ({ id }) => {
    const artifact = artifacts.get(String(id ?? ""));
    if (!artifact) return json({ code: "NOT_FOUND", error: `tracker artifact not found: ${id}` });
    return json({ source: artifact.id, relations: artifact.relations.map((relation) => ({ ...relation,
      target_title: artifacts.get(relation.target)?.title ?? null,
    })) });
  });
  return { server, artifacts };
}

export async function serveTrackerFixture(root) {
  const current = createTrackerMcpServer(root);
  await current.server.connect(new StdioServerTransport(process.stdin, process.stdout));
  return current;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const root = process.argv[2];
  serveTrackerFixture(root).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
