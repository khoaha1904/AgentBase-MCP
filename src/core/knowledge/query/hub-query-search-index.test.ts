import assert from "node:assert/strict";
import test from "node:test";

import {
  loadHubSearchProjection,
  resetHubSearchProjectionCache,
} from "./hub-query-search-index.ts";

function document(title: string, description: string, body: string, tags: readonly string[] = []): string {
  return `---
type: Component
title: ${title}
description: ${description}
tags: [${tags.join(", ")}]
---
# ${title}

${body}
`;
}

function resourceDocument(): string {
  return `---
type: Resource
title: Orders Queue
description: Shared asynchronous transport.
agentbase:
  technology:
    provider: aws
    product: sqs
    resourceType: aws_sqs_queue
---
# Orders Queue

Shared transport.
`;
}

function reader(commit: string, documents: ReadonlyMap<string, string>, counters = { lists: 0, reads: 0 }) {
  return {
    commit,
    counters,
    async listMarkdownPaths() {
      counters.lists += 1;
      return [...documents.keys()];
    },
    async readMarkdown(relativePath: string) {
      counters.reads += 1;
      const value = documents.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
}

test("[AB-QUERY-002][AB-QUERY-015] BM25+ ranks fields and sections without prefix or fuzzy expansion", async () => {
  resetHubSearchProjectionCache();
  const documents = new Map([
    ["components/consumer.md", document("Queue Consumer", "Processes order events.", "## Runtime\nReads OrderPlaced messages.", ["shipping"])],
    ["components/overview.md", document("Overview", "General order notes.", "## Queue\nMentions a consumer briefly.")],
    ["components/a-tie.md", document("Tie A", "tiebreak", "same")],
    ["components/b-tie.md", document("Tie B", "tiebreak", "same")],
  ]);
  const projection = await loadHubSearchProjection(reader("1".repeat(40), documents), 256 * 1024);
  const hits = projection.search("queue consumer");
  assert.equal(hits[0]?.conceptIdentity, "components/consumer");
  assert.deepEqual(hits[0]?.matchedFields.includes("identityPathTitle"), true);
  assert.deepEqual(projection.search("consum"), []);
  assert.deepEqual(projection.search("ord"), []);
  assert.deepEqual(projection.search("consumre"), []);
  assert.deepEqual(projection.search("shipping")[0]?.matchedFields, ["typeTags"]);
  assert.deepEqual(projection.search("runtime")[0]?.sectionOrdinal, 0);
  assert.deepEqual(projection.search("tiebreak").map((hit) => hit.conceptIdentity), [
    "components/a-tie", "components/b-tie",
  ]);
});

test("[AB-QUERY-019] standalone technology metadata is searchable without making embedded rows nodes", async () => {
  resetHubSearchProjectionCache();
  const documents = new Map([
    ["resources/orders-queue.md", resourceDocument()],
    ["components/worker.md", document("Worker", "Runtime worker.", "Embedded sqs knowledge remains here.")],
  ]);
  const projection = await loadHubSearchProjection(reader("m".repeat(40), documents), 256 * 1024);
  assert.equal(projection.search("sqs")[0]?.conceptIdentity, "resources/orders-queue");
  assert.deepEqual(projection.search("sqs").map((hit) => hit.conceptIdentity), [
    "resources/orders-queue", "components/worker",
  ]);
  assert.equal(projection.search("sqs")[0]?.matchedFields.includes("typeTags"), true);
});

test("[AB-QUERY-004][AB-QUERY-013][SC-007] projection cache is lazy, commit-bound and atomically replaced", async () => {
  resetHubSearchProjectionCache();
  const documents = new Map([["components/a.md", document("A", "Alpha.", "Body")]]);
  const first = reader("a".repeat(40), documents);
  const cachedReader = reader("a".repeat(40), documents);
  const projection = await loadHubSearchProjection(first, 256 * 1024);
  assert.deepEqual(first.counters, { lists: 1, reads: 1 });
  assert.equal(await loadHubSearchProjection(cachedReader, 256 * 1024), projection);
  assert.deepEqual(cachedReader.counters, { lists: 0, reads: 0 });

  const failed = {
    commit: "b".repeat(40),
    async listMarkdownPaths(): Promise<readonly string[]> { throw new Error("build failed"); },
    async readMarkdown(): Promise<string> { throw new Error("unreachable"); },
  };
  await assert.rejects(loadHubSearchProjection(failed, 256 * 1024), /build failed/);
  assert.equal(await loadHubSearchProjection(cachedReader, 256 * 1024), projection);

  const replacement = reader("b".repeat(40), documents);
  const next = await loadHubSearchProjection(replacement, 256 * 1024);
  assert.notEqual(next, projection);
  assert.equal(next.graph.commit, "b".repeat(40));
  assert.deepEqual(replacement.counters, { lists: 1, reads: 1 });
});

test("[AB-QUERY-015][SC-005] direct context keeps direction and evidence", async () => {
  resetHubSearchProjectionCache();
  const documents = new Map([
    ["components/source.md", `---
type: Component
title: Producer
description: Produces messages.
sources:
  - id: source-1
    resource: repository://repository-test-aaaaaaaaaaaa/src/producer.ts#L1-L2
relationships:
  - kind: publishes-to
    target: resources/events
    evidence: [source-1]
---
# Producer

[Events](/resources/events.md)
`],
    ["resources/events.md", `---
type: AWS::SNS::Topic
title: Events
description: Event transport.
---
# Events
`],
  ]);
  const projection = await loadHubSearchProjection(reader("3".repeat(40), documents), 256 * 1024);
  assert.deepEqual(projection.contexts.get("components/source"), [
    { kind: "link", source: "components/source", target: "resources/events", direction: "outbound" },
    { kind: "relationship", predicate: "publishes-to", source: "components/source",
      target: "resources/events", direction: "outbound", evidence: ["source-1"] },
  ]);
  assert.deepEqual(projection.contexts.get("resources/events"), [
    { kind: "link", source: "components/source", target: "resources/events", direction: "inbound" },
    { kind: "relationship", predicate: "publishes-to", source: "components/source",
      target: "resources/events", direction: "inbound", evidence: ["source-1"] },
  ]);
  assert.equal(projection.search("publishes-to", new Set(["resources/events"]))[0]?.conceptIdentity,
    "resources/events");
});

test("[AB-QUERY-015][SC-006] returned context is bounded without dropping searchable direct context", async () => {
  resetHubSearchProjectionCache();
  const links: string[] = [], documents = new Map<string, string>();
  for (let index = 0; index < 10; index += 1) {
    const identity = `resources/z${index}`;
    const title = index === 9 ? "Ultraviolet Endpoint" : `Endpoint ${index}`;
    documents.set(`${identity}.md`, `---\ntype: Resource\ntitle: ${title}\ndescription: ${title}.\n---\n# ${title}\n`);
    links.push(`[${title}](/${identity}.md)`);
  }
  documents.set("components/center.md", document("Center", "Connection hub.", links.join("\n")));
  const projection = await loadHubSearchProjection(reader("4".repeat(40), documents), 256 * 1024);
  assert.equal(projection.contexts.get("components/center")?.length, 8);
  assert.equal(projection.contextOmissions.get("components/center"), 2);
  assert.equal(projection.search("ultraviolet", new Set(["components/center"]))[0]?.conceptIdentity,
    "components/center");
});
