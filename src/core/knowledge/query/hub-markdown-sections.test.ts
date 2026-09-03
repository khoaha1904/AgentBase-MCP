import assert from "node:assert/strict";
import test from "node:test";

import { splitHubMarkdownSections } from "./hub-markdown-sections.ts";

test("[AB-QUERY-002][AB-QUERY-015] Markdown sections preserve heading hierarchy and readable text", () => {
  const sections = splitHubMarkdownSections("components/orders", `intro

# Orders

Overview text.

## Events

Publishes OrderPlaced.

\`\`\`md
# not a heading
\`\`\`

## Storage

Writes orders.
`);
  assert.deepEqual(sections.map(({ headingPath, text }) => ({ headingPath, text })), [
    { headingPath: [], text: "intro" },
    { headingPath: ["Orders"], text: "Overview text." },
    { headingPath: ["Orders", "Events"], text: "Publishes OrderPlaced.\n\n```md\n# not a heading\n```" },
    { headingPath: ["Orders", "Storage"], text: "Writes orders." },
  ]);
  assert.deepEqual(sections.map((section) => section.id), [
    "components/orders#section-0",
    "components/orders#section-1",
    "components/orders#section-2",
    "components/orders#section-3",
  ]);
});

test("[AB-QUERY-015] Markdown section bounds and validation are explicit", () => {
  assert.deepEqual(splitHubMarkdownSections("components/empty", "# Empty\n"), []);
  assert.throws(() => splitHubMarkdownSections("", "body"), /identity/);
  assert.throws(() => splitHubMarkdownSections("components/orders", "# One\na\n# Two\nb", 1), /limit/);
});
