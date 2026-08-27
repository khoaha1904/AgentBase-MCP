import assert from "node:assert/strict";
import test from "node:test";

import { loadHubGraph } from "./hub-query-graph.ts";

function markdown(type: string, title: string, frontmatter = "", body = ""): string {
  return `---
type: ${type}
title: ${title}
description: ${title} knowledge.
${frontmatter}---
# ${title}

${body}
`;
}

test("[AB-QUERY-004][AB-QUERY-015] graph exposes only resolved links and accepted direct topology", async () => {
  const documents = new Map([
    ["domains/commerce.md", markdown("Domain", "Commerce")],
    ["repositories/shop.md", markdown("Repository", "Shop Repository", `relationships:
  - kind: part-of
    target: domains/commerce
`, "[Commerce](/domains/commerce.md)")],
    ["systems/orders.md", markdown("System", "Orders", `relationships:
  - kind: part-of
    target: domains/commerce
  - kind: publishes-to
    target: resources/order-stream
`, "[Commerce](/domains/commerce.md)\n[Order stream](/resources/order-stream.md)")],
    ["components/worker.md", markdown("Component", "Worker", `tags: [queue, fulfillment]
relationships:
  - kind: implemented-in
    target: repositories/shop
`, "[Repository](/repositories/shop.md)")],
    ["resources/order-stream.md", markdown("Kafka::Topic", "Order Stream")],
    ["flows/checkout.md", markdown("Flow", "Checkout Flow", `flow_steps:
  - order: 1
    source: systems/orders
    action: publishes
    target: resources/order-stream
    mode: asynchronous
`, "[Orders](/systems/orders.md)\n[Order stream](/resources/order-stream.md)")],
    ["notes/consumer.md", markdown("Component", "Consumer Notes", `relationships:
  - kind: imagines
    target: systems/orders
`, "See [Orders](/systems/orders.md). It depends on a missing service only in prose.")],
  ]);
  const reader = {
    commit: "9".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = documents.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };

  const graph = await loadHubGraph(reader, 256 * 1024);
  assert.deepEqual(graph.concepts.get("components/worker")?.tags, ["fulfillment", "queue"]);
  assert.deepEqual(graph.concepts.get("components/worker")?.technology, []);
  assert.equal(graph.concepts.get("components/worker")?.sections[0]?.headingPath[0], "Worker");
  assert.deepEqual(graph.links.filter((link) => link.source === "notes/consumer"), [
    { source: "notes/consumer", target: "systems/orders" },
  ]);
  assert.deepEqual(graph.edges.find((edge) => edge.source === "systems/orders" && edge.kind === "publishes-to"), {
    source: "systems/orders", kind: "publishes-to", target: "resources/order-stream", evidence: [],
  });
  assert.deepEqual(graph.flowSteps, [{
    flow: "flows/checkout", order: 1, source: "systems/orders", action: "publishes",
    target: "resources/order-stream", mode: "asynchronous", evidence: [],
  }]);
  assert.equal(graph.edges.some((edge) => edge.source === "notes/consumer"), false);

  const scope = graph.domainScopes.get("domains/commerce");
  assert.equal(scope?.get("systems/orders"), "member");
  assert.equal(scope?.get("components/worker"), "repository-associated");
  assert.equal(scope?.get("resources/order-stream"), "boundary");
  assert.equal(scope?.has("notes/consumer"), false);
});

test("[AB-QUERY-017] invalid Published concept fails while oversized documents are observable omissions", async () => {
  const documents = new Map([
    ["README.md", "# navigation\n"],
    ["domains/valid.md", markdown("Domain", "Valid")],
    ["components/invalid.md", "# missing frontmatter\n"],
    ["components/large.md", `${markdown("Component", "Large")}${"x".repeat(128)}`],
  ]);
  const reader = {
    commit: "8".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = documents.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  await assert.rejects(() => loadHubGraph(reader, 100), /Published Hub concept is invalid: components\/invalid\.md/);
  const bounded = await loadHubGraph({
    ...reader,
    async listMarkdownPaths() { return ["README.md", "domains/valid.md", "components/large.md"]; },
  }, 100);
  assert.deepEqual(bounded.omissions, [{ path: "components/large.md", reason: "oversized" }]);
});
