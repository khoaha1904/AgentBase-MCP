import assert from "node:assert/strict";
import test from "node:test";

import { AGENTBASE_OKF_PROFILE_PATH, renderAgentBaseOkfProfileDocument } from "../documents/agentbase-profile.ts";
import { readHubFreshness } from "./hub-freshness.ts";
import { normalizeHubConceptPath, readHubConcept, searchHubConcepts } from "./hub-query.ts";
import { resetHubSearchProjectionCache } from "./hub-query-search-index.ts";

function concept(type: string, title: string, description: string, body: string, relationships = "[]"): string {
  const links = [...relationships.matchAll(/^\s+(?:source|target):\s+(\S+)$/gm)]
    .map((match) => match[1]).filter((value): value is string => Boolean(value))
    .map((target) => `[${target}](/${target}.md)`).join("\n");
  return `---
title: ${title}
description: ${description}
type: ${type}
relationships: ${relationships}
---
# ${title}

${body}
${links}
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
  assert.equal(scoped.profile, "legacy-unprofiled");
  assert.deepEqual(scoped.status === "ok" ? scoped.matches.map((match) => match.identity) : [], [
    "components/orders-api", "resources/orders-queue", "systems/orders",
  ]);
  assert.equal(scoped.commit, reader.commit);
  const exact = await searchHubConcepts(reader, "components/orders-api");
  assert.equal(exact.status, "ok");
  assert.equal(exact.status === "ok" ? exact.matches[0]?.matchedBy : undefined, "identity");
  assert.equal((await readHubConcept(reader, "components/orders-api.md")).path, "components/orders-api.md");
});

test("[AB-PROFILE-READ-002][AB-PROFILE-READ-005..006][AB-PROFILE-READ-009] Profile search maps selectors and exposes exact roles", async () => {
  resetHubSearchProjectionCache();
  const values = new Map([
    ["index.md", `---\nokf_version: "0.2"\n---\n\n# Hub\n\n* [Profile](${AGENTBASE_OKF_PROFILE_PATH}) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n* [Orders](domains/orders/) - Domain Capsule\n* [Fulfillment](domains/fulfillment/) - Domain Capsule\n`],
    ["shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n* [Shared Stream](knowledge/stream.md) - Resource\n"],
    [AGENTBASE_OKF_PROFILE_PATH, renderAgentBaseOkfProfileDocument()],
    ["domains/orders/index.md", `${concept("Domain", "Orders", "Orders domain.", "Orders knowledge.").trimEnd()}\n\n* [Orders Repository](repositories/orders.md) - Repository\n* [Orders API](knowledge/api.md) - Component\n`],
    ["domains/fulfillment/index.md", `${concept("Domain", "Fulfillment", "Fulfillment domain.", "Fulfillment knowledge.").trimEnd()}\n\n* [Worker](knowledge/worker.md) - Component\n`],
    ["domains/orders/repositories/orders.md", concept("Repository", "Orders Repository", "Profile term repository.", "Profile term. [Orders](../index.md)", `
  - kind: part-of
    target: domains/orders
    evidence: []`)],
    ["domains/orders/knowledge/api.md", concept("Component", "Orders API", "Profile term crossscope.", "Profile term crossscope. [Repository](../repositories/orders.md)", `
  - kind: implemented-in
    target: domains/orders/repositories/orders
    evidence: []`)],
    ["shared/knowledge/stream.md", concept("Resource", "Shared Stream", "Profile term shared.", "Profile term. [Orders](../../domains/orders/index.md)", `
  - kind: part-of
    target: domains/orders
    evidence: []`)],
    ["domains/fulfillment/knowledge/worker.md", concept("Component", "Worker", "crossscope fulfillment.", "crossscope.")],
  ]);
  const profileReader = {
    commit: "p".repeat(40),
    async listMarkdownPaths() { return [...values.keys()]; },
    async readMarkdown(relativePath: string) { return values.get(relativePath)!; },
  };

  const result = await searchHubConcepts(profileReader, "profile term", { domain: "domains/orders" });
  assert.equal(result.status, "ok");
  assert.equal(result.profile, "profile-1.0");
  const matches = result.status === "ok" ? result.matches : [];
  assert.deepEqual(matches.find((match) => match.identity === "domains/orders/knowledge/api")?.scope, {
    domain: "domains/orders",
    selector: "domains/orders",
    role: "repository-associated",
    roles: ["home", "participant"],
  });
  assert.deepEqual(matches.find((match) => match.identity === "shared/knowledge/stream")?.scope?.roles,
    ["participant"]);
  assert.equal((await searchHubConcepts(profileReader, "profile term",
    { domain: "domains/orders" })).status, "ok");
  await assert.rejects(() => searchHubConcepts(profileReader, "profile term",
    { domain: "domains/missing" }), /exact Domain/);

  const ambiguous = await searchHubConcepts(profileReader, "crossscope");
  assert.equal(ambiguous.status, "scope_required");
  if (ambiguous.status === "scope_required") assert.deepEqual(
    ambiguous.candidateDomains.map((domain) => [domain.identity, domain.domainSelector]), [
      ["domains/fulfillment", "domains/fulfillment"],
      ["domains/orders", "domains/orders"],
    ]);

  resetHubSearchProjectionCache();
  const unsupported = new Map(values);
  unsupported.set(AGENTBASE_OKF_PROFILE_PATH,
    renderAgentBaseOkfProfileDocument().replace('version: "1.0"', 'version: "2.0"'));
  await assert.rejects(() => searchHubConcepts({
    commit: "u".repeat(40),
    async listMarkdownPaths() { return [...unsupported.keys()]; },
    async readMarkdown(relativePath: string) { return unsupported.get(relativePath)!; },
  }, "profile term", { domain: "domains/orders" }), /Published Hub Profile is unsupported/);
});

test("[AB-QUERY-017] search exposes bounded oversized-document omissions", async () => {
  resetHubSearchProjectionCache();
  const values = new Map([
    ["domains/compact.md", concept("Domain", "Compact", "Compact domain.", "Small body.")],
    ["components/large.md", `${concept("Component", "Large", "Large component.", "Large body.")}${"x".repeat(512)}`],
  ]);
  const boundedReader = {
    commit: "o".repeat(40),
    async listMarkdownPaths() { return [...values.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = values.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const result = await searchHubConcepts(boundedReader, "compact", { global: true, maximumDocumentBytes: 256 });
  assert.equal(result.status, "ok");
  assert.deepEqual(result.status === "ok" ? result.omissions : undefined, [
    { path: "components/large.md", reason: "oversized" },
  ]);
});

test("[AB-QUERY-017] exact read rejects malformed Published concept", async () => {
  const invalidReader = {
    commit: "r".repeat(40),
    async readMarkdown() { return "# not an OKF concept\n"; },
    async listMarkdownPaths() { return ["components/invalid.md"]; },
  };
  await assert.rejects(() => readHubConcept(invalidReader, "components/invalid.md"),
    /Published Hub concept is invalid: components\/invalid\.md/);
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

test("[AB-QUERY-002][AB-QUERY-015][SC-001/004] multi-term metadata and body search returns one heading-aware excerpt", async () => {
  resetHubSearchProjectionCache();
  const bodyGap = "\n".repeat(40);
  const values = new Map([
    ["domains/payments.md", concept("Domain", "Payments", "Money movement.", "Payments domain.")],
    ["components/payment-worker.md", `---
type: Component
title: Payment Worker
description: Handles settlement workflows.
tags: [payments, ledger]
relationships:
  - kind: part-of
    target: domains/payments
    evidence: []
---
# Payment Worker

[Payments](/domains/payments.md)

## Settlement

Writes a ledger settlement.${bodyGap}Payments remain traceable.

## Retry

Retries payments safely.
`],
  ]);
  const focusedReader = {
    commit: "c".repeat(40),
    async listMarkdownPaths() { return [...values.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = values.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const result = await searchHubConcepts(focusedReader, "ledger settlement", { domain: "domains/payments" });
  assert.equal(result.status, "ok");
  const match = result.status === "ok" ? result.matches[0] : undefined;
  assert.equal(match?.identity, "components/payment-worker");
  assert.deepEqual(match?.section?.headingPath, ["Payment Worker", "Settlement"]);
  assert.equal(match?.section?.omittedMatches, 2);
  assert.match(match?.excerpt ?? "", /settlement/i);
  assert.equal((await searchHubConcepts(focusedReader, "Payment Worker")).status, "ok");
});

test("[AB-QUERY-004][SC-003] Domain scope includes members, Repository association and one boundary hop", async () => {
  resetHubSearchProjectionCache();
  const values = new Map([
    ["domains/alpha.md", concept("Domain", "Alpha", "sharedterm alpha domain.", "Alpha knowledge.")],
    ["domains/beta.md", concept("Domain", "Beta", "sharedterm beta domain.", "Beta knowledge.")],
    ["repositories/alpha.md", concept("Repository", "Alpha Repo", "sharedterm alpha repository.", "Alpha source.", `
  - kind: part-of
    target: domains/alpha
    evidence: []`)],
    ["repositories/beta.md", concept("Repository", "Beta Repo", "sharedterm beta repository.", "Beta source.", `
  - kind: part-of
    target: domains/beta
    evidence: []`)],
    ["components/alpha-a.md", concept("Component", "Alpha A", "sharedterm alpha component.", "Alpha runtime.", `
  - kind: implemented-in
    target: components/alpha-b
    evidence: []
  - kind: implemented-in
    target: repositories/alpha
    evidence: []
  - kind: publishes-to
    target: resources/shared-boundary
    evidence: []`)],
    ["components/alpha-b.md", concept("Component", "Alpha B", "sharedterm cyclic component.", "Alpha helper.", `
  - kind: declared-by
    target: components/alpha-a
    evidence: []`)],
    ["components/beta.md", concept("Component", "Beta Component", "sharedterm unrelated component.", "Beta runtime.", `
  - kind: implemented-in
    target: repositories/beta
    evidence: []`)],
    ["resources/shared-boundary.md", concept("Resource", "Shared Boundary", "sharedterm direct endpoint.", "Boundary.", `
  - kind: depends-on
    target: resources/far-endpoint
    evidence: []`)],
    ["resources/far-endpoint.md", concept("Resource", "Far Endpoint", "sharedterm second hop.", "Too far.")],
  ]);
  const scopedReader = {
    commit: "d".repeat(40),
    async listMarkdownPaths() { return [...values.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = values.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };

  const result = await searchHubConcepts(scopedReader, "sharedterm", { domain: "domains/alpha" });
  assert.equal(result.status, "ok");
  const matches = result.status === "ok" ? result.matches : [];
  assert.deepEqual([...matches.map((match) => match.identity)].sort(), [
    "components/alpha-a", "components/alpha-b", "domains/alpha", "repositories/alpha",
    "resources/shared-boundary",
  ]);
  assert.deepEqual(Object.fromEntries(matches.map((match) => [match.identity, match.scope?.role])), {
    "components/alpha-a": "repository-associated",
    "components/alpha-b": "repository-associated",
    "domains/alpha": "member",
    "repositories/alpha": "member",
    "resources/shared-boundary": "boundary",
  });
  assert.equal(matches.some((match) => match.identity === "components/beta" || match.identity === "resources/far-endpoint"), false);
});

test("[AB-QUERY-016][AB-QUERY-018] Crawler qualification keeps representative concepts in top five", async () => {
  resetHubSearchProjectionCache();
  const crawlerDocuments = new Map([
    ["domains/crawler.md", concept("Domain", "Crawler", "Vehicle data collection domain.", "Coordinates crawler services.")],
    ["repositories/serverless-data-pipelines-demo.md", concept("Repository", "Serverless Data Pipelines Demo", "Crawler pipeline source repository.", "Runs a serverless crawler data pipeline.", `
  - kind: part-of
    target: domains/crawler
    evidence: [repository-domain]`)],
    ["components/glue-crawler-initiation.md", concept("Component", "Glue Crawler Initiation", "Starts the AWS Glue crawler.", "Initiates the crawler from the ingestion workflow.", `
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence: [component-repository]`)],
    ["flows/apistatemachine.md", concept("Flow", "API State Machine", "Coordinates crawler pipeline steps.", "The state machine invokes the crawler and downstream processing.", `
  - kind: implemented-in
    target: repositories/serverless-data-pipelines-demo
    evidence: [flow-repository]`)],
  ]);
  const crawlerReader = {
    commit: "q".repeat(40),
    async listMarkdownPaths() { return [...crawlerDocuments.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = crawlerDocuments.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const cases = [
    ["glue crawler", "components/glue-crawler-initiation"],
    ["state machine crawler pipeline", "flows/apistatemachine"],
    ["serverless crawler repository", "repositories/serverless-data-pipelines-demo"],
  ] as const;
  const results = await Promise.all(cases.map(async ([query, expected]) => {
    const result = await searchHubConcepts(crawlerReader, query, { domain: "domains/crawler", limit: 5 });
    assert.equal(result.status, "ok");
    return result.status === "ok" && result.matches.slice(0, 5).some((match) => match.identity === expected);
  }));
  assert.equal(results.filter(Boolean).length / results.length, 1, "Crawler top-five recall should be 100%");
});

test("[AB-QUERY-019][AB-SCHEMA-053] shared Resource is independently searchable between two repositories", async () => {
  resetHubSearchProjectionCache();
  const values = new Map([
    ["domains/messaging.md", concept("Domain", "Messaging", "Shared messaging domain.", "Cross-repository transport.")],
    ["repositories/producer.md", concept("Repository", "Producer", "Producer repository.", "Publishes orders.", `
  - kind: part-of
    target: domains/messaging
    evidence: [producer-domain]`)],
    ["repositories/consumer.md", concept("Repository", "Consumer", "Consumer repository.", "Consumes orders.", `
  - kind: part-of
    target: domains/messaging
    evidence: [consumer-domain]`)],
    ["components/order-publisher.md", concept("Function", "Order Publisher", "Publishes orders.", "Sends messages to the Orders Queue.\n[Orders Queue](/resources/orders-queue.md)", `
  - kind: implemented-in
    target: repositories/producer
    evidence: [producer-source]
  - kind: publishes-to
    target: resources/orders-queue
    evidence: [producer-source]`)],
    ["components/order-consumer.md", concept("Function", "Order Consumer", "Consumes orders.", "Triggered by the Orders Queue.\n[Orders Queue](/resources/orders-queue.md)", `
  - kind: implemented-in
    target: repositories/consumer
    evidence: [consumer-source]
  - kind: triggered-by
    target: resources/orders-queue
    evidence: [consumer-source]`)],
    ["resources/orders-queue.md", `---
type: Resource
title: Orders Queue
description: Shared asynchronous orders transport.
agentbase:
  technology:
    provider: aws
    product: sqs
    resourceType: aws_sqs_queue
---
# Orders Queue

Shared SQS transport.
`],
  ]);
  const reader = {
    commit: "s".repeat(40),
    async listMarkdownPaths() { return [...values.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = values.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const result = await searchHubConcepts(reader, "sqs orders queue", { domain: "domains/messaging", limit: 10 });
  assert.equal(result.status, "ok");
  const matches = result.status === "ok" ? result.matches : [];
  assert.equal(matches.some((match) => match.identity === "resources/orders-queue"), true);
  const queue = matches.find((match) => match.identity === "resources/orders-queue");
  assert.deepEqual(queue?.context?.filter((context) => context.kind === "relationship")
    .map((context) => context.predicate).sort(), ["publishes-to", "triggered-by"]);
});

test("[AB-QUERY-019][AB-SCHEMA-053] SNS fan-out keeps one topic node and bounded subscriber context", async () => {
  resetHubSearchProjectionCache();
  const values = new Map([
    ["domains/alerts.md", concept("Domain", "Alerts", "Alerting domain.", "Shared notification transport.")],
    ["components/publisher.md", concept("Function", "Alert Publisher", "Publishes alerts.", "Publishes alerts to the [Alerts Topic](/resources/alerts-topic.md).", `
  - kind: publishes-to
    target: resources/alerts-topic
    evidence: [publisher-source]`)],
    ["components/email-subscriber.md", concept("Function", "Email Subscriber", "Sends alert emails.", "Triggered by the [Alerts Topic](/resources/alerts-topic.md).", `
  - kind: triggered-by
    target: resources/alerts-topic
    evidence: [email-source]`)],
    ["components/slack-subscriber.md", concept("Function", "Slack Subscriber", "Sends Slack alerts.", "Triggered by the [Alerts Topic](/resources/alerts-topic.md).", `
  - kind: triggered-by
    target: resources/alerts-topic
    evidence: [slack-source]`)],
    ["resources/alerts-topic.md", `---
type: Resource
title: Alerts Topic
description: Shared fan-out alert transport.
agentbase:
  technology:
    provider: aws
    product: sns
    resourceType: aws_sns_topic
---
# Alerts Topic

Shared SNS topic.
`],
  ]);
  const reader = {
    commit: "t".repeat(40),
    async listMarkdownPaths() { return [...values.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = values.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const result = await searchHubConcepts(reader, "sns alerts topic", { global: true, limit: 10 });
  assert.equal(result.status, "ok");
  const topic = result.status === "ok" ? result.matches.find((match) => match.identity === "resources/alerts-topic") : undefined;
  assert.deepEqual(topic?.context?.filter((context) => context.kind === "relationship")
    .map((context) => context.source).sort(), [
    "components/email-subscriber", "components/publisher", "components/slack-subscriber",
  ]);
});

test("[AB-LOCAL-HUB-009][AB-QUERY-011] query bounds and Repository freshness remain deterministic", async () => {
  assert.throws(() => normalizeHubConceptPath("../secret.md"), /Markdown file/);
  await assert.rejects(searchHubConcepts(reader, "x", { limit: 101 }), /1\.\.100/);
  await assert.rejects(searchHubConcepts(reader, "x", { domain: "domains/missing" }), /exact Domain/);
  const freshnessDocuments = new Map([
    ["repositories/unknown.md", concept("Repository", "Unknown", "No checkpoint.", "Unknown checkpoint.")],
    ["repositories/old.md", `---\ntype: Repository\ntitle: Old\ndescription: Old checkpoint.\nagentbase:\n  repository:\n    id: repository-old-111111111111\n    display_name: old\n    aliases: { remotes: [], root_commits: [] }\n    observed_source:\n      commit: '${"1".repeat(40)}'\n      dirty: false\n      dirty_digest: null\n      observed_at: '2026-08-01T00:00:00.000Z'\n---\n\n# Old\n`],
    ["repositories/future.md", `---\ntype: Repository\ntitle: Future\ndescription: Future clock.\nagentbase:\n  repository:\n    id: repository-future-222222222222\n    display_name: future\n    aliases: { remotes: [], root_commits: [] }\n    observed_source:\n      commit: null\n      dirty: true\n      dirty_digest: 'sha256:${"2".repeat(64)}'\n      observed_at: '2026-08-23T00:00:00.000Z'\n---\n\n# Future\n`],
  ]);
  const freshnessReader = {
    commit: "b".repeat(40),
    async listMarkdownPaths() { return [...freshnessDocuments.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = freshnessDocuments.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const report = await readHubFreshness(freshnessReader, () => new Date("2026-08-22T00:00:00.000Z"));
  assert.deepEqual(report.summary, { total: 3, observed: 2, unknown: 1 });
  assert.deepEqual(report.repositories.map((entry) => entry.path), [
    "repositories/unknown.md", "repositories/old.md", "repositories/future.md",
  ]);
  assert.equal(report.repositories[1]?.source_revision, "1".repeat(40));
  assert.equal(report.repositories[2]?.source_revision, `sha256:${"2".repeat(64)}`);
  assert.equal(report.repositories[2]?.age_milliseconds, 0);
  const empty = await readHubFreshness({ ...freshnessReader, async listMarkdownPaths() { return []; } },
    () => new Date("2026-08-22T00:00:00.000Z"));
  assert.deepEqual(empty.summary, { total: 0, observed: 0, unknown: 0 });
  await assert.rejects(readHubFreshness(freshnessReader, () => new Date("invalid")), /report time is invalid/);
});
