import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildPublishedVisualizationProjection,
  createQuestionId,
  displayEndpoints,
  loadHubGraph,
  renderQuestionDocument,
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
      body: "[Orders](../systems/orders.md) [Repository](../repositories/orders.md) [Queue](../resources/shared-queue.md)", relationships: `
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
      body: "[Orders](../systems/orders.md) [Queue](../resources/shared-queue.md)", relationships: `
  - kind: part-of
    target: systems/orders
    evidence: [${SOURCE_ID}]
  - kind: triggered-by
    target: resources/shared-queue
    evidence: [${SOURCE_ID}]` })],
    ["resources/shared-queue.md", concept({ type: "Interface", title: "Shared Queue",
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

test("[AB-VIS-001..004][AB-VIS-011..014] projection is deterministic, directed and Domain bounded", async () => {
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
  assert.equal(serializePublishedVisualizationProjection(first), serializePublishedVisualizationProjection(second));
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

test("[AB-VIS-006..010][AB-VIS-012..014] static Domain site is reproducible, offline and no-overwrite", async (context) => {
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
  const browserBuildKey = `2-${graph.commit}`;
  assert.match(generatedIndex, /Interactive 2D Domain knowledge map/);
  assert.equal(generatedIndex.includes(`assets/app.css?build=${browserBuildKey}`), true);
  assert.equal(generatedIndex.includes(`assets/cytoscape.min.js?build=${browserBuildKey}`), true);
  assert.equal(generatedIndex.includes(`assets/app.js?build=${browserBuildKey}`), true);
  assert.doesNotMatch(generatedIndex, /__AGENTBASE_BUILD_KEY__/);
  assert.match(generatedApp, /new URL\(import\.meta\.url\)\.search/);
  assert.match(generatedApp, /fetch\(`data\/domain\.json\$\{browserBuildQuery\}`\)/);
  assert.match(generatedApp, /name: "concentric"/);
  assert.match(generatedApp, /flowToggle\.checked/);
  assert.equal(fs.existsSync(path.join(first, "assets/three.module.min.js")), false);

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
