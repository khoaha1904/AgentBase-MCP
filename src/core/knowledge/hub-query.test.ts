import assert from "node:assert/strict";
import test from "node:test";

import { normalizeHubConceptPath, readHubConcept, searchHubConcepts, traverseHubConcepts } from "./hub-query.ts";

function concept(type: string, title: string, description: string, body: string, relationships = "[]"): string {
  return `---
title: ${title}
description: ${description}
type: ${type}
relationships: ${relationships}
---
# ${title}

${body}
`;
}

const documents = new Map([
  ["domains/commerce.md", concept("Domain", "Commerce", "Customer ordering domain.", "Owns checkout knowledge.")],
  ["domains/fulfillment.md", concept("Domain", "Fulfillment", "Order delivery domain.", "Owns worker knowledge.")],
  ["systems/orders.md", concept("System", "Orders", "Commerce order system.", "Publishes OrderPlaced.", `
  - kind: part-of
    target: domains/commerce
    evidence: [system-domain]`)],
  ["systems/shipping.md", concept("System", "Shipping", "Fulfillment order system.", "Consumes OrderPlaced.", `
  - kind: part-of
    target: domains/fulfillment
    evidence: [system-domain]`)],
  ["components/orders-api.md", concept("Component", "Orders API", "Checkout entrypoint.", "Creates an order.", `
  - kind: part-of
    target: systems/orders
    evidence: [api-system]
  - kind: publishes-to
    target: resources/orders-queue
    evidence: [queue-send]`)],
  ["components/shipping-worker.md", concept("Component", "Shipping Worker", "Delivery worker.", "Processes an order.", `
  - kind: part-of
    target: systems/shipping
    evidence: [worker-system]
  - kind: consumes
    target: resources/orders-queue
    evidence: [queue-read]`)],
  ["resources/orders-queue.md", concept("AWS::SQS::Queue", "Orders Queue", "Shared OrderPlaced transport.", "Amazon SQS carries OrderPlaced.")],
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

test("[AB-QUERY-002][AB-QUERY-004] search ranks metadata and scopes duplicate terms to one Domain", async () => {
  const scoped = await searchHubConcepts(reader, "order", { domain: "domains/commerce", limit: 5 });
  assert.equal(scoped.status, "ok");
  assert.deepEqual(scoped.status === "ok" ? scoped.matches.map((match) => match.identity) : [], [
    "components/orders-api", "systems/orders", "domains/commerce",
  ]);
  assert.equal(scoped.commit, reader.commit);
  const exact = await searchHubConcepts(reader, "components/orders-api");
  assert.equal(exact.status, "ok");
  assert.equal(exact.status === "ok" ? exact.matches[0]?.matchedBy : undefined, "identity");
  assert.equal((await readHubConcept(reader, "components/orders-api.md")).path, "components/orders-api.md");
});

test("[AB-QUERY-002][SC-002] ambiguous unscoped search asks for Domain while explicit global search remains bounded", async () => {
  const ambiguous = await searchHubConcepts(reader, "order");
  assert.equal(ambiguous.status, "scope_required");
  assert.deepEqual(ambiguous.status === "scope_required"
    ? ambiguous.candidateDomains.map((domain) => domain.identity) : [], ["domains/commerce", "domains/fulfillment"]);
  const global = await searchHubConcepts(reader, "order", { global: true, limit: 1 });
  assert.equal(global.status, "ok");
  assert.equal(global.status === "ok" ? global.matches.length : 0, 1);
});

test("[AB-QUERY-003][SC-004] traversal derives inbound edges with evidence and obeys depth and node bounds", async () => {
  const inbound = await traverseHubConcepts(reader, "resources/orders-queue.md", {
    direction: "inbound", maxDepth: 1, limit: 10,
  });
  assert.deepEqual(inbound.nodes.map((node) => node.identity), [
    "resources/orders-queue", "components/orders-api", "components/shipping-worker",
  ]);
  assert.deepEqual(inbound.edges.map((edge) => [edge.source, edge.kind, edge.target, edge.evidence]), [
    ["components/orders-api", "publishes-to", "resources/orders-queue", ["queue-send"]],
    ["components/shipping-worker", "consumes", "resources/orders-queue", ["queue-read"]],
  ]);
  assert.equal(inbound.commit, reader.commit);
  const bounded = await traverseHubConcepts(reader, "components/orders-api", { maxDepth: 3, limit: 2 });
  assert.equal(bounded.nodes.length, 2);
  assert.equal(bounded.truncated, true);
});

test("[AB-LOCAL-HUB-009] query paths and bounds fail closed", async () => {
  assert.throws(() => normalizeHubConceptPath("../secret.md"), /Markdown file/);
  await assert.rejects(searchHubConcepts(reader, "x", { limit: 101 }), /1\.\.100/);
  await assert.rejects(searchHubConcepts(reader, "x", { domain: "domains/missing" }), /exact Domain/);
  await assert.rejects(traverseHubConcepts(reader, "systems/orders", { maxDepth: 4 }), /1\.\.3/);
});
