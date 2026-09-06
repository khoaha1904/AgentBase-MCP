import assert from "node:assert/strict";
import test from "node:test";

import { AGENTBASE_OKF_PROFILE_PATH, renderAgentBaseOkfProfileDocument } from "../documents/agentbase-profile.ts";
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
  assert.deepEqual(graph.repositoryScopes.get("components/worker"), ["repositories/shop"]);
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

test("[AB-COMPACT-002][AB-COMPACT-014] query preserves legacy nested indexes and rejects duplicate identities", async () => {
  const legacy = new Map([
    ["domains/orders.md", markdown("Domain", "Orders")],
    ["domains/orders/index.md", "# Orders navigation\n\n* [Orders](../orders.md) - Domain\n"],
  ]);
  const reader = {
    commit: "6".repeat(40),
    async listMarkdownPaths() { return [...legacy.keys()]; },
    async readMarkdown(relativePath: string) { return legacy.get(relativePath)!; },
  };
  const graph = await loadHubGraph(reader, 256 * 1024);
  assert.equal(graph.profile, "legacy-unprofiled");
  assert.equal(graph.concepts.get("domains/orders")?.document.path, "domains/orders.md");

  legacy.set("domains/orders/index.md", markdown("Domain", "Orders capsule"));
  await assert.rejects(() => loadHubGraph(reader, 256 * 1024), /Published Hub concept is invalid: domains\/orders\/index\.md/);
});

test("[AB-PROFILE-READ-001..004] Profile graph keeps home, participation and boundary separate", async () => {
  const documents = new Map([
    ["index.md", `---\nokf_version: "0.2"\n---\n\n# Hub\n\n* [Profile](${AGENTBASE_OKF_PROFILE_PATH}) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n* [Orders](domains/orders/) - Domain Capsule\n* [Fulfillment](domains/fulfillment/) - Domain Capsule\n`],
    ["shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n* [Order Stream](knowledge/order-stream.md) - Resource\n"],
    [AGENTBASE_OKF_PROFILE_PATH, renderAgentBaseOkfProfileDocument()],
    ["domains/orders/index.md", `${markdown("Domain", "Orders").trimEnd()}\n\n* [Orders Repository](repositories/orders.md) - Repository\n* [Orders API](knowledge/api.md) - Component\n* [Coordinator](knowledge/coordinator.md) - System\n`],
    ["domains/fulfillment/index.md", `${markdown("Domain", "Fulfillment").trimEnd()}\n\n* [Fulfillment Worker](knowledge/worker.md) - Component\n* [Unrelated](knowledge/unrelated.md) - System\n`],
    ["domains/orders/repositories/orders.md", markdown("Repository", "Orders Repository", `relationships:
  - kind: part-of
    target: domains/orders
`, "[Orders](../index.md)")],
    ["domains/orders/knowledge/api.md", markdown("Component", "Orders API", `relationships:
  - kind: implemented-in
    target: domains/orders/repositories/orders
`, "[Repository](../repositories/orders.md)")],
    ["domains/orders/knowledge/coordinator.md", markdown("System", "Coordinator", `relationships:
  - kind: part-of
    target: domains/fulfillment
  - kind: consumes
    target: domains/fulfillment/knowledge/worker
`, "[Fulfillment](../../fulfillment/index.md) [Worker](../../fulfillment/knowledge/worker.md)")],
    ["shared/knowledge/order-stream.md", markdown("Resource", "Order Stream", `relationships:
  - kind: part-of
    target: domains/orders
`, "[Orders](../../domains/orders/index.md)")],
    ["domains/fulfillment/knowledge/worker.md", markdown("Component", "Fulfillment Worker", `relationships:
  - kind: part-of
    target: domains/fulfillment
`, "[Fulfillment](../index.md)")],
    ["domains/fulfillment/knowledge/unrelated.md", markdown("System", "Unrelated")],
  ]);
  const graph = await loadHubGraph({
    commit: "7".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()].reverse(); },
    async readMarkdown(relativePath: string) { return documents.get(relativePath)!; },
  }, 256 * 1024);

  assert.equal(graph.profile, "profile-1.0");
  assert.deepEqual(graph.homes.get("domains/orders/knowledge/coordinator"),
    { kind: "domain", selector: "domains/orders" });
  const scope = graph.domainScopes.get("domains/orders");
  const roles = graph.domainRoles.get("domains/orders");
  assert.equal(scope?.get("domains/orders/knowledge/coordinator"), "home");
  assert.deepEqual(roles?.get("domains/orders/knowledge/coordinator"), ["home"]);
  assert.equal(scope?.get("domains/orders/knowledge/api"), "repository-associated");
  assert.deepEqual(roles?.get("domains/orders/knowledge/api"), ["home", "participant"]);
  assert.deepEqual(roles?.get("shared/knowledge/order-stream"), ["participant"]);
  assert.deepEqual(roles?.get("domains/fulfillment/knowledge/worker"), ["boundary"]);
  assert.equal(scope?.has("domains/fulfillment/knowledge/unrelated"), false);
});
