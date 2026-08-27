import assert from "node:assert/strict";
import test from "node:test";

import { CodebaseMemoryError } from "./errors.ts";
import { parseArchitecture, parseSearch, parseSnippet, parseTrace } from "./response-parser.ts";

function envelope(value: unknown): Record<string, unknown> {
  return { structuredContent: value };
}

test("[AB-MCP-021] architecture parser preserves the accepted bounded sections", () => {
  const overview = parseArchitecture("repository-fixture", {
    content: [{ type: "text", text: [
      "project: fixture", "total_nodes: 2", "total_edges: 1", "languages:", "  TypeScript 1",
      "packages:", "  app 2 0 1", "entry_points:", "  fixture.src.main src/main.ts", "boundaries:",
      "  app queue 1",
    ].join("\n") }],
  });
  assert.equal(overview.languages[0]?.name, "TypeScript");
  assert.deepEqual(overview.boundaries, [{ from: "app", to: "queue", calls: 1 }]);
});

test("[AB-MCP-021] table and trace parsers reject malformed provider rows", () => {
  assert.deepEqual(parseSearch(envelope({ cols: ["qn", "label", "file", "lines"], rows: [
    ["fixture.src.main", "Function", "src/main.ts", "1-2"],
  ] })), [{ qualifiedName: "fixture.src.main", label: "Function",
    source: { path: "src/main.ts", startLine: 1, endLine: 2 } }]);
  assert.throws(() => parseSearch(envelope({ cols: ["qn", "label", "file", "lines"], rows: [["broken"]] })),
    (error: unknown) => error instanceof CodebaseMemoryError && error.code === "PROVIDER_MALFORMED_OUTPUT");
  assert.throws(() => parseTrace(envelope({ direction: "sideways" })),
    (error: unknown) => error instanceof CodebaseMemoryError && error.code === "PROVIDER_MALFORMED_OUTPUT");
});

test("[AB-MCP-021] snippet parser rejects source escape and preserves exact line bounds", () => {
  const parsed = parseSnippet("/repo", envelope({ qualified_name: "fixture.src.main", name: "main", label: "Function",
    file_path: "src/main.ts", start_line: 3, end_line: 5, source: "return true;" }));
  assert.deepEqual(parsed.source, { path: "src/main.ts", startLine: 3, endLine: 5 });
  assert.throws(() => parseSnippet("/repo", envelope({ qualified_name: "x", name: "x", label: "Function",
    file_path: "../../secret", start_line: 1, end_line: 1, source: "x" })), /outside the repository/);
});
