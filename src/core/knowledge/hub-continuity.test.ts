import assert from "node:assert/strict";
import test from "node:test";

import { buildHubContinuity } from "./hub-continuity.ts";

const sourceId = "repository-acme-aaaaaaaaaaaa";
function concept(type: string, title: string, source: string, relationships = "[]"): string {
  return `---
title: ${title}
description: ${title} description
type: ${type}
sources:
  - resource: repository://${source}/README.md#L1-L1
relationships: ${relationships}
---
# ${title}
`;
}

const documents = new Map([
  ["index.md", "---\nokf_version: '0.2'\n---\n# Hub\n"],
  ["repositories/index.md", "# Repositories\n"],
  ["repositories/acme/index.md", "# Acme\n"],
  ["repositories/acme/repository.md", concept("Repository", "Acme", sourceId)],
  ["components/worker.md", concept("Component", "Worker", sourceId, `
  - kind: publishes-to
    target: resources/orders
    evidence: [worker-queue]`)],
  ["resources/orders.md", concept("AWS SQS Queue", "Orders", "repository-queue-bbbbbbbbbbbb")],
  ...Array.from({ length: 100 }, (_, index) => [
    `unrelated/${index}.md`, concept("Custom Type", `Unrelated ${index}`, "repository-other-cccccccccccc"),
  ] as const),
]);
const reader = {
  commit: "a".repeat(40),
  async listMarkdownPaths() { return [...documents.keys()]; },
  async readMarkdown(relativePath: string) {
    const value = documents.get(relativePath);
    if (!value) throw new Error("missing");
    return value;
  },
};

test("[AB-LOCAL-HUB-014] continuity contains only current-source summaries, subject, neighbors and navigation", async () => {
  const manifest = await buildHubContinuity(reader, sourceId, "repositories/acme");
  assert.equal(manifest.commit, reader.commit);
  assert.equal(manifest.subject?.identity, "repositories/acme/repository");
  assert.deepEqual(manifest.currentSource.map((item) => item.identity), [
    "components/worker", "repositories/acme/repository",
  ]);
  assert.deepEqual(manifest.neighbors.map((item) => item.identity), ["resources/orders"]);
  assert.deepEqual(manifest.edges.map((edge) => edge.evidence), [["worker-queue"]]);
  assert.deepEqual(manifest.navigationPaths, ["components/index.md", "index.md", "repositories/acme/index.md",
    "repositories/index.md", "resources/index.md"].filter((value) => documents.has(value)));
  assert.equal(JSON.stringify(manifest).includes("Unrelated 99"), false);
  assert.equal(manifest.truncated, false);
});

test("[AB-LOCAL-HUB-014][SC-006] continuity bounds expose exact omitted counts", async () => {
  const manifest = await buildHubContinuity(reader, sourceId, "repositories/acme", { conceptLimit: 1 });
  assert.equal(manifest.currentSource.length, 1);
  assert.equal(manifest.omitted.currentSource, 1);
  assert.equal(manifest.truncated, true);
});
