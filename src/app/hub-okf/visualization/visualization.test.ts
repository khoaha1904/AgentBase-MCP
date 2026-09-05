import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  AGENTBASE_OKF_PROFILE_PATH,
  buildPublishedVisualizationProjection,
  createQuestionId,
  displayEndpoints,
  loadHubGraph,
  renderQuestionDocument,
  renderAgentBaseOkfProfileDocument,
  serializePublishedVisualizationProjection,
  type QuestionKind,
  type QuestionState,
  type SharedQuestion,
} from "../../../core/knowledge/index.ts";
import { prepareDiagramPacket } from "./diagram-packet.ts";
import { buildStaticDomainSite } from "./domain-site.ts";

const SOURCE_ID = "fixture";
const SOURCE = `sources:\n  - id: ${SOURCE_ID}\n    resource: repository://repository-visualization-aaaaaaaaaaaa/README.md#L1-L2`;

function concept(input: Readonly<{
  type: string;
  title: string;
  description?: string;
  body?: string;
  relationships?: string;
  flowSteps?: string;
}>): string {
  return `---
type: ${input.type}
title: ${input.title}
description: ${input.description ?? input.title}
${SOURCE}
relationships:${input.relationships ?? " []"}${input.flowSteps ? `\nflow_steps:${input.flowSteps}` : ""}
---

# ${input.title}

${input.body ?? input.description ?? input.title}
`;
}

function question(input: Readonly<{
  kind: QuestionKind;
  state: QuestionState;
  subject: string;
  property: string;
}>): Readonly<{ path: string; content: string }> {
  const origin = { kind: input.kind, originSubject: input.subject,
    originProperty: input.property, scopeKey: `scope-${input.property}` };
  const id = createQuestionId(origin);
  const value: SharedQuestion = {
    id,
    revision: input.state === "resolved" ? 2 : 1,
    ...origin,
    state: input.state,
    subject: input.subject,
    property: input.property,
    references: [{ referenceKind: "candidate-evidence", candidateKey: `candidate/${input.property}`,
      sourceResource: "repository://repository-visualization-aaaaaaaaaaaa/README.md#L1-L2" }],
    missingEvidence: ["More evidence is required."],
    limitations: [],
    guidance: input.state === "resolved" ? ["guidance/resolved"] : [],
    title: `Question ${input.property}`,
    createdAt: "2026-08-25T00:00:00.000Z",
  };
  return { path: `questions/${id}.md`, content: renderQuestionDocument(value) };
}

function fixtureDocuments(): Map<string, string> {
  const active = question({ kind: "missing-evidence", state: "open",
    subject: "components/orders-api", property: "timeout" });
  const resolved = question({ kind: "conflict", state: "resolved",
    subject: "systems/orders", property: "owner" });
  const candidate = question({ kind: "relation-candidate", state: "needs-review",
    subject: "relationships/orders-shipping", property: "target" });
  return new Map([
    ["domains/commerce.md", concept({ type: "Domain", title: "Commerce" })],
    ["domains/fulfillment.md", concept({ type: "Domain", title: "Fulfillment" })],
    ["systems/orders.md", concept({ type: "System", title: "Orders",
      body: "[Commerce](../domains/commerce.md) [Queue](../resources/shared-queue.md)", relationships: `
  - kind: part-of
    target: domains/commerce
    evidence: [${SOURCE_ID}]
  - kind: consumes
    target: resources/shared-queue
    evidence: [${SOURCE_ID}]` })],
    ["systems/shipping.md", concept({ type: "System", title: "Shipping",
      body: "[Fulfillment](../domains/fulfillment.md)", relationships: `
  - kind: part-of
    target: domains/fulfillment
    evidence: [${SOURCE_ID}]` })],
    ["repositories/orders.md", concept({ type: "Repository", title: "Orders repository",
      body: "[Commerce](../domains/commerce.md)", relationships: `
  - kind: part-of
    target: domains/commerce
    evidence: [${SOURCE_ID}]` })],
    ["components/orders-api.md", concept({ type: "Component", title: "Orders API",
      body: `[Orders](../systems/orders.md) [Repository](../repositories/orders.md) [Queue](../resources/shared-queue.md)

# Embedded Knowledge

| Name | Role | Kind | Technology | Identity | Evidence |
|---|---|---|---|---|---|
| Internal data store | Store API data. | object-storage | aws / s3 |  | \`${SOURCE_ID}\` |
| Shared audit table | Store shared audit data. | database-table | aws / dynamodb | \`arn:aws:dynamodb:ap-southeast-1:123456789012:table/audit\` | \`${SOURCE_ID}\` |
| Event source mapping | Connect runtime wiring. | resource | aws / lambda |  | \`${SOURCE_ID}\` |

# Embedded Relations

| Source | Relation | Target | Evidence |
|---|---|---|---|
| self | writes-to | Internal data store | \`${SOURCE_ID}\` |
| self | writes-to | Shared audit table | \`${SOURCE_ID}\` |
| self | part-of | Internal data store | \`${SOURCE_ID}\` |`, relationships: `
  - kind: part-of
    target: systems/orders
    evidence: [${SOURCE_ID}]
  - kind: implemented-in
    target: repositories/orders
    evidence: [${SOURCE_ID}]
  - kind: publishes-to
    target: resources/shared-queue
    evidence: [${SOURCE_ID}]` })],
    ["components/orders-worker.md", concept({ type: "Component", title: "Orders Worker",
      body: `[Orders](../systems/orders.md) [Queue](../resources/shared-queue.md)

# Embedded Knowledge

| Name | Role | Kind | Technology | Identity | Evidence |
|---|---|---|---|---|---|
| Internal data store | Store worker data. | object-storage | aws / s3 |  | \`${SOURCE_ID}\` |
| Shared audit table | Store shared audit data. | database-table | aws / dynamodb | \`arn:aws:dynamodb:ap-southeast-1:123456789012:table/audit\` | \`${SOURCE_ID}\` |

# Embedded Relations

| Source | Relation | Target | Evidence |
|---|---|---|---|
| resources/shared-queue | redrives-to | Shared audit table | \`${SOURCE_ID}\` |
| self | monitors | Missing resource | \`${SOURCE_ID}\` |`, relationships: `
  - kind: part-of
    target: systems/orders
    evidence: [${SOURCE_ID}]
  - kind: triggered-by
    target: resources/shared-queue
    evidence: [${SOURCE_ID}]` })],
    ["resources/shared-queue.md", concept({ type: "Resource", title: "Shared Queue",
      body: "[Shipping](../systems/shipping.md)", relationships: `
  - kind: part-of
    target: systems/shipping
    evidence: [${SOURCE_ID}]` })],
    ["components/shipping-worker.md", concept({ type: "Component", title: "Shipping Worker",
      body: "[Shipping](../systems/shipping.md)", relationships: `
  - kind: part-of
    target: systems/shipping
    evidence: [${SOURCE_ID}]` })],
    ["flows/order-submit.md", concept({ type: "Flow", title: "Submit order",
      body: "[Orders](../systems/orders.md) [API](../components/orders-api.md) [Queue](../resources/shared-queue.md)",
      relationships: `
  - kind: part-of
    target: systems/orders
    evidence: [${SOURCE_ID}]`, flowSteps: `
  - order: 1
    source: components/orders-api
    action: publishes
    target: resources/shared-queue
    mode: asynchronous
    evidence: [${SOURCE_ID}]` })],
    [active.path, active.content],
    [resolved.path, resolved.content],
    [candidate.path, candidate.content],
    ["guidance/resolved.md", concept({ type: "Maintainer Guidance", title: "Resolved guidance" })],
  ]);
}

test("[AB-VIS-001..004][AB-VIS-011..019][AB-VIS-023] projection is deterministic, directed and Domain bounded", async () => {
  const documents = fixtureDocuments();
  const reader = {
    commit: "a".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()].reverse(); },
    async readMarkdown(relativePath: string) {
      const value = documents.get(relativePath);
      if (!value) throw new Error(`missing fixture: ${relativePath}`);
      return value;
    },
  };
  const graph = await loadHubGraph(reader, 256 * 1024);
  const options = { hub: "github.com/acme/hub#main", domain: "domains/commerce" };
  const first = buildPublishedVisualizationProjection(graph, options);
  const second = buildPublishedVisualizationProjection(graph, options);

  assert.equal(first.commit, reader.commit);
  assert.equal(first.schemaVersion, 3);
  assert.equal(serializePublishedVisualizationProjection(first), serializePublishedVisualizationProjection(second));
  const eligible = [...graph.domainScopes.get(options.domain) ?? []]
    .filter(([, role]) => role !== "boundary").map(([id]) => id);
  assert.deepEqual(new Set(first.nodes.filter((node) => node.membership === "primary"
    && node.representation === "concept").map((node) => node.id)),
    new Set(eligible));
  assert.deepEqual(displayEndpoints("triggered-by", "worker", "queue"),
    { source: "queue", target: "worker", directed: true });
  assert.deepEqual(displayEndpoints("part-of", "child", "parent"),
    { source: "child", target: "parent", directed: false });

  assert.deepEqual(first.nodes.filter((node) => node.membership === "boundary").map((node) => node.id),
    ["resources/shared-queue"]);
  assert.equal(first.nodes.find((node) => node.id === "resources/shared-queue")?.expandable, false);
  assert.deepEqual(first.nodes.find((node) => node.id === "resources/shared-queue")?.domainIds,
    ["domains/fulfillment"]);
  assert.equal(first.nodes.some((node) => node.id === "systems/shipping"), false);
  assert.equal(first.nodes.some((node) => node.type === "Question" || node.type === "Maintainer Guidance"), false);
  assert.deepEqual(first.nodes.find((node) => node.id === "components/orders-api")?.systemIds, ["systems/orders"]);
  assert.deepEqual(first.nodes.find((node) => node.id === "components/orders-api")?.repositoryIds, ["repositories/orders"]);

  const embedded = first.nodes.filter((node) => node.representation === "embedded");
  assert.equal(embedded.length, 3);
  assert.equal(embedded.filter((node) => node.title === "Internal data store").length, 2);
  const sharedAudit = embedded.find((node) => node.title === "Shared audit table");
  assert.equal(sharedAudit?.externalIdentity, "arn:aws:dynamodb:ap-southeast-1:123456789012:table/audit");
  assert.deepEqual(sharedAudit?.parentIds, ["components/orders-api", "components/orders-worker"]);
  assert.equal(first.nodes.some((node) => node.title === "Event source mapping"), false);
  assert.equal(first.edges.filter((edge) => edge.representation === "embedded").length, 7);
  assert.equal(first.edges.some((edge) => edge.representation === "embedded" && edge.predicate === "writes-to"
    && edge.displaySource === "components/orders-api" && edge.displayTarget === sharedAudit?.id), true);
  assert.equal(first.edges.some((edge) => edge.representation === "embedded" && edge.predicate === "redrives-to"
    && edge.displaySource === "resources/shared-queue" && edge.displayTarget === sharedAudit?.id), true);
  assert.equal(first.edges.some((edge) => edge.predicate === "part-of" && edge.representation === "embedded"), false);
  assert.equal(first.omissions.some((item) => item.detail.includes("part-of") && item.detail.includes("unsupported")), true);
  assert.equal(first.omissions.some((item) => item.detail.includes("Missing resource")
    && item.detail.includes("unresolved or ambiguous endpoint")), true);

  const trigger = first.edges.find((edge) => edge.predicate === "triggered-by");
  assert.deepEqual(trigger && [trigger.declaredSource, trigger.declaredTarget,
    trigger.displaySource, trigger.displayTarget, trigger.directed], [
    "components/orders-worker", "resources/shared-queue",
    "resources/shared-queue", "components/orders-worker", true,
  ]);
  const systemConsumption = first.edges.find((edge) => edge.predicate === "consumes"
    && edge.declaredSource === "systems/orders");
  assert.deepEqual(systemConsumption && [systemConsumption.displaySource,
    systemConsumption.displayTarget, systemConsumption.displayClass, systemConsumption.directed],
  ["systems/orders", "resources/shared-queue", "runtime", true]);
  assert.deepEqual(first.flows, [{ id: "flows/order-submit", steps: [{
    order: 1,
    source: "components/orders-api",
    action: "publishes",
    target: "resources/shared-queue",
    mode: "asynchronous",
    evidence: [SOURCE_ID],
  }] }]);
  assert.deepEqual(first.questions.map((item) => [item.subject, item.state]),
    [["components/orders-api", "open"]]);
  assert.equal(first.omissions.some((item) => item.subject === "relationships/orders-shipping"), true);
  assert.equal(first.edges.some((edge) => edge.declaredSource === "relationships/orders-shipping"), false);

  assert.throws(() => buildPublishedVisualizationProjection(graph, { ...options, maximumNodes: 2 }), /node limit exceeded/);
  assert.throws(() => buildPublishedVisualizationProjection(graph, { ...options, domain: "domains/missing" }), /exact Published Domain/);
});

test("[AB-PROFILE-READ-002..004][AB-PROFILE-READ-007..008] Profile visualization uses the shared Domain projection", async (context) => {
  const active = question({ kind: "missing-evidence", state: "open",
    subject: "domains/orders/knowledge/api", property: "owner" });
  const documents = new Map([
    ["index.md", `---\nokf_version: "0.2"\n---\n\n# Hub\n\n* [Profile](${AGENTBASE_OKF_PROFILE_PATH}) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n* [Orders](domains/orders/) - Domain Capsule\n* [Fulfillment](domains/fulfillment/) - Domain Capsule\n`],
    ["shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n* [Shared Stream](knowledge/stream.md) - Resource\n"],
    [AGENTBASE_OKF_PROFILE_PATH, renderAgentBaseOkfProfileDocument()],
    ["domains/orders/index.md", `${concept({ type: "Domain", title: "Orders" }).trimEnd()}\n\n* [Orders repository](repositories/orders.md) - Repository\n* [Orders API](knowledge/api.md) - Component\n* [Question](questions/${path.posix.basename(active.path)}) - Question\n`],
    ["domains/fulfillment/index.md", `${concept({ type: "Domain", title: "Fulfillment" }).trimEnd()}\n\n* [Fulfillment Worker](knowledge/worker.md) - Component\n`],
    ["domains/orders/repositories/orders.md", concept({ type: "Repository", title: "Orders repository",
      body: "[Orders](../index.md)", relationships: `
  - kind: part-of
    target: domains/orders
    evidence: [${SOURCE_ID}]` })],
    ["domains/orders/knowledge/api.md", concept({ type: "Component", title: "Orders API",
      body: "[Repository](../repositories/orders.md) [Worker](../../fulfillment/knowledge/worker.md)", relationships: `
  - kind: implemented-in
    target: domains/orders/repositories/orders
    evidence: [${SOURCE_ID}]
  - kind: publishes-to
    target: domains/fulfillment/knowledge/worker
    evidence: [${SOURCE_ID}]` })],
    ["shared/knowledge/stream.md", concept({ type: "Resource", title: "Shared Stream",
      body: "[Orders](../../domains/orders/index.md)", relationships: `
  - kind: part-of
    target: domains/orders
    evidence: [${SOURCE_ID}]` })],
    ["domains/fulfillment/knowledge/worker.md", concept({ type: "Component", title: "Fulfillment Worker",
      body: "[Fulfillment](../index.md)", relationships: `
  - kind: part-of
    target: domains/fulfillment
    evidence: [${SOURCE_ID}]` })],
    [`domains/orders/${active.path}`, active.content],
  ]);
  const graph = await loadHubGraph({
    commit: "6".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) { return documents.get(relativePath)!; },
  }, 256 * 1024);
  const projection = buildPublishedVisualizationProjection(graph, {
    hub: "github.com/acme/hub#main", domain: "domains/orders",
  });

  assert.equal(projection.profile, "profile-1.0");
  assert.deepEqual(projection.domain, {
    id: "domains/orders", path: "domains/orders/index.md", title: "Orders", selector: "domains/orders",
  });
  const api = projection.nodes.find((node) => node.id === "domains/orders/knowledge/api");
  assert.equal(api?.home, "domains/orders");
  assert.deepEqual(api?.domainIds, []);
  assert.deepEqual(api?.scopeRoles, ["home", "participant"]);
  assert.deepEqual(projection.nodes.find((node) => node.id === "shared/knowledge/stream")?.scopeRoles,
    ["participant"]);
  assert.deepEqual(projection.nodes.find((node) => node.id === "domains/fulfillment/knowledge/worker")?.scopeRoles,
    ["boundary"]);
  assert.equal(projection.nodes.some((node) => node.id === "domains/fulfillment"), false);
  assert.deepEqual(projection.questions.map((item) => item.subject), ["domains/orders/knowledge/api"]);
  const packet = prepareDiagramPacket(projection, {
    diagramType: "architecture",
    conceptIds: ["domains/orders/knowledge/api", "domains/fulfillment/knowledge/worker"],
  });
  assert.equal(packet.status === "ready" ? packet.packet.profile : undefined, "profile-1.0");

  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-domain-site-"));
  context.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const output = path.join(temporary, "site");
  buildStaticDomainSite(projection, { outputDirectory: output, visibilityAcknowledged: true });
  const generated = fs.readFileSync(path.join(output, "data/domain.json"), "utf8");
  const browser = fs.readFileSync(path.join(output, "assets/app.js"), "utf8");
  assert.match(generated, /"profile": "profile-1\.0"/);
  assert.match(generated, /"scopeRoles": \[/);
  assert.match(browser, /Selected Domain roles/);
  assert.match(browser, /projection\.profile/);
});

test("[AB-REFRESH-018][AB-VIS-015] repository-anchored new Resource enters its Domain projection", async () => {
  const documents = new Map([
    ["domains/crawler.md", concept({ type: "Domain", title: "Crawler" })],
    ["repositories/worker.md", concept({ type: "Repository", title: "Worker repository",
      body: "[Crawler](../domains/crawler.md)", relationships: `
  - kind: part-of
    target: domains/crawler
    evidence: [${SOURCE_ID}]` })],
    ["resources/retry-queue.md", concept({ type: "Resource", title: "Retry queue",
      body: "Implemented in [Worker repository](../repositories/worker.md).", relationships: `
  - kind: implemented-in
    target: repositories/worker
    evidence: [${SOURCE_ID}]` })],
  ]);
  const graph = await loadHubGraph({
    commit: "d".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) { return documents.get(relativePath)!; },
  }, 256 * 1024);
  const projection = buildPublishedVisualizationProjection(graph, {
    hub: "github.com/acme/hub#main", domain: "domains/crawler",
  });
  const resource = projection.nodes.find((node) => node.id === "resources/retry-queue");
  assert.equal(resource?.membership, "primary");
  assert.deepEqual(resource?.repositoryIds, ["repositories/worker"]);
  assert.equal(projection.edges.some((edge) => edge.declaredSource === "resources/retry-queue"
    && edge.predicate === "implemented-in" && edge.declaredTarget === "repositories/worker"), true);
});

test("[AB-VIS-005..010][AB-SCHEMA-050] diagram packets preserve Published topology or report insufficient data", async () => {
  const documents = fixtureDocuments();
  const graph = await loadHubGraph({
    commit: "b".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) { return documents.get(relativePath)!; },
  }, 256 * 1024);
  const projection = buildPublishedVisualizationProjection(graph, {
    hub: "github.com/acme/hub#main", domain: "domains/commerce",
  });
  const before = serializePublishedVisualizationProjection(projection);

  const architecture = prepareDiagramPacket(projection, {
    diagramType: "architecture",
    conceptIds: ["systems/orders", "components/orders-api", "resources/shared-queue"],
  });
  assert.equal(architecture.status, "ready");
  assert.deepEqual(architecture.status === "ready" && new Set(architecture.packet.edges.map((edge) => edge.predicate)),
    new Set(["consumes", "publishes-to", "part-of"]));

  const dependency = prepareDiagramPacket(projection, {
    diagramType: "dependency", conceptIds: ["components/orders-api", "resources/shared-queue"],
  });
  assert.equal(dependency.status, "ready");
  assert.deepEqual(dependency.status === "ready" && dependency.packet.edges.map((edge) => edge.predicate),
    ["publishes-to"]);
  const systemDependency = prepareDiagramPacket(projection, {
    diagramType: "dependency", conceptIds: ["systems/orders", "resources/shared-queue"],
  });
  assert.equal(systemDependency.status, "ready");
  assert.deepEqual(systemDependency.status === "ready"
    && systemDependency.packet.edges.map((edge) => edge.predicate), ["consumes"]);
  assert.equal(prepareDiagramPacket(projection, {
    diagramType: "dependency", conceptIds: ["systems/orders", "components/orders-api"],
  }).status, "insufficient-data");

  const sequence = prepareDiagramPacket(projection, {
    diagramType: "sequence", conceptIds: ["flows/order-submit"],
  });
  assert.equal(sequence.status, "ready");
  assert.deepEqual(sequence.status === "ready" && sequence.packet.flows[0]?.steps.map((step) => step.order), [1]);
  assert.deepEqual(sequence.status === "ready" && sequence.packet.nodes.map((node) => node.id),
    ["components/orders-api", "flows/order-submit", "resources/shared-queue"]);
  assert.equal(prepareDiagramPacket(projection, {
    diagramType: "sequence", conceptIds: ["systems/orders"],
  }).status, "insufficient-data");

  assert.throws(() => prepareDiagramPacket(projection, {
    diagramType: "architecture", conceptIds: ["systems/shipping"],
  }), /outside the Published Domain projection/);
  assert.throws(() => prepareDiagramPacket(projection, {
    diagramType: "architecture", conceptIds: ["resources/shared-queue"],
  }), /boundary concepts require their accepted connecting edge/);
  assert.equal(serializePublishedVisualizationProjection(projection), before);
});

test("[AB-VIS-006..010][AB-VIS-012..024] static Domain site is reproducible, offline and no-overwrite", async (context) => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-domain-site-test-"));
  context.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const documents = fixtureDocuments();
  const graph = await loadHubGraph({
    commit: "c".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) { return documents.get(relativePath)!; },
  }, 256 * 1024);
  const projection = buildPublishedVisualizationProjection(graph, {
    hub: "github.com/acme/hub#main", domain: "domains/commerce",
  });
  const first = path.join(temporary, "first"), second = path.join(temporary, "second");
  const result = buildStaticDomainSite(projection, { outputDirectory: first, visibilityAcknowledged: true });
  buildStaticDomainSite(projection, { outputDirectory: second, visibilityAcknowledged: true });
  assert.deepEqual({ status: result.status, commit: result.commit, receipt: result.receipt },
    { status: "built", commit: graph.commit, receipt: "agentbase-build.json" });

  const relativeFiles = ["agentbase-build.json", "assets/app.css", "assets/app.js",
    "assets/cytoscape.min.js", "data/domain.json", "index.html"];
  for (const relative of relativeFiles) {
    assert.deepEqual(fs.readFileSync(path.join(first, ...relative.split("/"))),
      fs.readFileSync(path.join(second, ...relative.split("/"))));
  }
  const receipt = JSON.parse(fs.readFileSync(path.join(first, "agentbase-build.json"), "utf8"));
  assert.deepEqual(receipt.files.map((file: { path: string }) => file.path), relativeFiles.slice(1));
  assert.equal(receipt.commit, graph.commit);
  assert.equal("generatedAt" in receipt || "outputDirectory" in receipt, false);
  const generatedText = relativeFiles.filter((relative) => relative !== "assets/cytoscape.min.js")
    .map((relative) => fs.readFileSync(path.join(first, ...relative.split("/")), "utf8")).join("\n");
  assert.doesNotMatch(generatedText, new RegExp(temporary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(generatedText, /ghp_[A-Za-z0-9]{20,}|search_hub_okf|prepare_hub_visualization/);
  const generatedIndex = fs.readFileSync(path.join(first, "index.html"), "utf8");
  const generatedApp = fs.readFileSync(path.join(first, "assets/app.js"), "utf8");
  const browserBuildKey = `8-${graph.commit}`;
  assert.match(generatedIndex, /Interactive 2D Domain knowledge map/);
  assert.equal(generatedIndex.includes(`assets/app.css?build=${browserBuildKey}`), true);
  assert.equal(generatedIndex.includes(`assets/cytoscape.min.js?build=${browserBuildKey}`), true);
  assert.equal(generatedIndex.includes(`assets/app.js?build=${browserBuildKey}`), true);
  assert.doesNotMatch(generatedIndex, /__AGENTBASE_BUILD_KEY__/);
  assert.match(generatedApp, /new URL\(import\.meta\.url\)\.search/);
  assert.match(generatedApp, /fetch\(`data\/domain\.json\$\{browserBuildQuery\}`\)/);
  assert.match(generatedApp, /name: "preset"/);
  assert.match(generatedApp, /minZoom: \.12/);
  assert.match(generatedApp, /autoungrabify: false/);
  assert.match(generatedApp, /node\.type !== "Domain"/);
  assert.match(generatedApp, /edge\.displayClass !== "structural"/);
  assert.match(generatedApp, /node\.repositoryIds\.length === 1/);
  assert.match(generatedApp, /repository-region/);
  assert.match(generatedApp, /cy\.nodes\('\[type = "Repository"\]'\)\.ungrabify\(\)/);
  assert.match(generatedApp, /"text-max-width": 116, "text-valign": "center", "text-wrap": "ellipsis"/);
  assert.match(generatedApp, /cy\.on\("dragfree", "node"/);
  assert.match(generatedApp, /clampToOwnership/);
  assert.match(generatedApp, /Shared \/ External/);
  assert.match(generatedApp, /flowToggle\.checked/);
  assert.match(generatedIndex, /id="flow-toggle" type="checkbox" checked/);
  assert.match(generatedApp, /node\.type === "Flow" \? `Flow · \$\{node\.title\}`/);
  assert.match(generatedApp, /nodeById\.get\(selected\)\?\.type === "System"/);
  assert.match(generatedApp, /candidate\.parentIds\.includes\(selected\)/);
  assert.match(generatedApp, /flowToggle\.checked = true/);
  assert.match(generatedApp, /fixedPositions\(graphNodes, graphHost\.clientWidth <= 720 \? 1 : 2, visualEdges\)/);
  assert.match(generatedApp, /edge\.displaySource === node\.id \? edge\.displayTarget/);
  assert.match(generatedApp, /repositoryIds\.length === 1/);
  assert.match(generatedApp, /repositoryIds\.length > 1/);
  assert.match(generatedApp, /maximumBottom \+ 100/);
  assert.match(generatedApp, /relationOrderedRepositories/);
  assert.match(generatedApp, /shape: "ellipse"/);
  assert.match(generatedApp, /initialVisible = \(\) => new Set\(graphNodes\.map/);
  assert.match(generatedIndex, /id="view-document"/);
  assert.match(generatedIndex, /id="document-dialog"/);
  assert.match(generatedApp, /documentDialog\.showModal\(\)/);
  assert.match(generatedApp, /Show exact evidence/);
  assert.match(generatedApp, /files or sources/);
  assert.match(generatedApp, /node\.representation === "embedded"/);
  assert.match(generatedApp, /textContent/);
  const generatedCss = fs.readFileSync(path.join(first, "assets/app.css"), "utf8");
  assert.match(generatedCss, /\.details \{[^}]*display: none/);
  assert.match(generatedCss, /\.details\.is-open \{ display: block; \}/);
  assert.doesNotMatch(generatedIndex, />Domain<\/span>/);
  assert.match(generatedIndex, /Repository card and region/);
  assert.match(generatedIndex, /Reset layout/);
  assert.match(generatedIndex, /About this Domain/);
  assert.equal(fs.existsSync(path.join(first, "assets/three.module.min.js")), false);

  const layoutSource = generatedApp.slice(generatedApp.indexOf("function repositoryRegionId"),
    generatedApp.indexOf("\nfunction outsideLabel"));
  type LayoutNode = { id: string; type: string; repositoryIds: string[] };
  type LayoutEdge = { displaySource: string; displayTarget: string };
  type Region = { x: number; y: number; width: number; height: number };
  const evaluateLayout = Function(`"use strict"; ${layoutSource}; return fixedPositions;`) as () =>
    (nodes: LayoutNode[], columns: number, edges: LayoutEdge[]) => {
      positions: Map<string, { x: number; y: number }>;
      regions: Map<string, Region>;
    };
  const fixedPositions = evaluateLayout();
  const repositoryIds = ["repositories/bridge", "repositories/worker", "repositories/pipeline"];
  const layoutNodes: LayoutNode[] = [
    ...repositoryIds.map((id) => ({ id, type: "Repository", repositoryIds: [id] })),
    { id: "components/bridge", type: "Function", repositoryIds: [repositoryIds[0]!] },
    { id: "components/worker", type: "Function", repositoryIds: [repositoryIds[1]!] },
    { id: "components/pipeline", type: "Function", repositoryIds: [repositoryIds[2]!] },
  ];
  const layoutEdges = [
    { displaySource: "components/bridge", displayTarget: "components/worker" },
    { displaySource: "components/bridge", displayTarget: "components/pipeline" },
  ];
  const layout = fixedPositions(layoutNodes, 1, layoutEdges);
  const bridgeRegion = layout.regions.get(repositoryIds[0]!)!;
  const workerRegion = layout.regions.get(repositoryIds[1]!)!;
  const pipelineRegion = layout.regions.get(repositoryIds[2]!)!;
  assert.equal(new Set([bridgeRegion.x, workerRegion.x, pipelineRegion.x]).size > 1, true,
    "[AB-VIS-024] three Repository regions form a ring even at the narrow breakpoint");
  assert.equal(bridgeRegion.y < workerRegion.y && bridgeRegion.y < pipelineRegion.y, true,
    "[AB-VIS-024] the highest-degree Repository starts the relation-aware ring");
  for (const [leftIndex, left] of [bridgeRegion, workerRegion, pipelineRegion].entries()) {
    for (const right of [bridgeRegion, workerRegion, pipelineRegion].slice(leftIndex + 1)) {
      assert.equal(Math.abs(left.x - right.x) < (left.width + right.width) / 2
        && Math.abs(left.y - right.y) < (left.height + right.height) / 2, false,
      "[AB-VIS-024] fixed Repository regions do not overlap");
    }
  }
  const crosses = (sourceId: string, targetId: string, region: Region) => {
    const source = layout.positions.get(sourceId)!, target = layout.positions.get(targetId)!;
    return Array.from({ length: 101 }, (_, index) => index / 100).some((ratio) => {
      const x = source.x + (target.x - source.x) * ratio;
      const y = source.y + (target.y - source.y) * ratio;
      return Math.abs(x - region.x) <= region.width / 2 && Math.abs(y - region.y) <= region.height / 2;
    });
  };
  assert.equal(crosses("components/bridge", "components/worker", pipelineRegion), false,
    "[AB-VIS-024] bridge-to-worker arrow avoids the unrelated pipeline region");
  assert.equal(crosses("components/bridge", "components/pipeline", workerRegion), false,
    "[AB-VIS-024] bridge-to-pipeline arrow avoids the unrelated worker region");

  assert.throws(() => buildStaticDomainSite(projection,
    { outputDirectory: "relative/site", visibilityAcknowledged: true }), /explicit absolute path/);
  assert.throws(() => buildStaticDomainSite(projection,
    { outputDirectory: path.parse(temporary).root, visibilityAcknowledged: true }), /filesystem root/);
  const occupied = path.join(temporary, "occupied"); fs.mkdirSync(occupied); fs.writeFileSync(path.join(occupied, "keep"), "keep");
  assert.throws(() => buildStaticDomainSite(projection,
    { outputDirectory: occupied, visibilityAcknowledged: true }), /new or empty/);
  assert.equal(fs.readFileSync(path.join(occupied, "keep"), "utf8"), "keep");

  const interrupted = path.join(temporary, "interrupted"); fs.mkdirSync(interrupted);
  const stagesBefore = fs.readdirSync(temporary).filter((name) => name.startsWith(".agentbase-domain-site-")).length;
  assert.throws(() => buildStaticDomainSite(projection,
    { outputDirectory: interrupted, visibilityAcknowledged: true }, { assetsRoot: path.join(temporary, "missing-assets") }));
  assert.deepEqual(fs.readdirSync(interrupted), []);
  assert.equal(fs.readdirSync(temporary).filter((name) => name.startsWith(".agentbase-domain-site-")).length, stagesBefore);
});
