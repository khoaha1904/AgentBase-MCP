import assert from "node:assert/strict";
import test from "node:test";

import { normalizeHubConceptPath, readHubConcept, searchHubConcepts } from "./hub-query.ts";

const documents = new Map([
  ["repositories/orders/services/api.md", "# Orders API\nHandles checkout and publishes OrderPlaced."],
  ["repositories/orders/infrastructure/aws/sqs/orders.md", "# Orders queue\nAmazon SQS carries OrderPlaced."],
]);
const reader = {
  commit: "a".repeat(40),
  async listMarkdownPaths() { return [...documents.keys()]; },
  async readMarkdown(relativePath: string) { const value = documents.get(relativePath); if (!value) throw new Error("missing"); return value; },
};

test("[AB-LOCAL-HUB-004][AB-QUERY-001] bounded search identifies active commit and paths", async () => {
  const matches = await searchHubConcepts(reader, "OrderPlaced", { limit: 1 });
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.commit, reader.commit);
  assert.match(matches[0]?.excerpt ?? "", /OrderPlaced/);
  assert.equal((await readHubConcept(reader, "repositories/orders/services/api.md")).path, "repositories/orders/services/api.md");
});

test("[AB-LOCAL-HUB-009] query paths and bounds fail closed", async () => {
  assert.throws(() => normalizeHubConceptPath("../secret.md"), /Markdown file/);
  await assert.rejects(searchHubConcepts(reader, "x", { limit: 101 }), /1\.\.100/);
});
