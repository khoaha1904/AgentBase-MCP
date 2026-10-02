#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import {
  buildPublishedVisualizationProjection,
  conceptIdentityFromPath,
  createQuestionId,
  loadHubGraph,
  loadOkfBundle,
  parseConceptDocument,
  renderConceptDocument,
  renderAgentBaseOkfProfileDocument,
  renderQuestionDocument,
  searchHubConcepts,
} from "../../src/core/knowledge/index.ts";
import { buildStaticDomainSite } from "../../src/app/hub-okf/visualization/domain-site.ts";
import { AwsCliAdapter } from "../../src/providers/aws-cli/index.ts";
import { createMockAwsSqsRunner } from "../../src/app/hub-okf/test-support/mock-aws-sqs.ts";
import { prepareDomainEnrichment, runDomainEnrichment } from "../../src/app/hub-okf/enrichment/index.ts";

const COMMIT = "a".repeat(40);
const ACCOUNT = "123456789012";
const REGION = "ap-southeast-1";

function source(repo, relative, id, sourceRepositoryId, fixtureRoot) {
  return { id, resource: `repository://${sourceRepositoryId}/${relative}#L1-L24`, observed_revision: gitHead(path.join(fixtureRoot, repo)) };
}

function gitHead(root) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

function assertClean(root) {
  assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }), "", `${root} must be clean`);
  assert.match(gitHead(root), /^[a-f0-9]{40}$/);
}

function concept(pathname, type, title, description, sources, relationships = [], body = description) {
  const links = relationships.map((relationship) => {
    const target = /^domains\/[^/]+$/.test(relationship.target)
      ? `${relationship.target}/index.md` : `${relationship.target}.md`;
    const relative = path.posix.relative(path.posix.dirname(pathname), target);
    return `- [${relationship.target}](${relative}) (${relationship.kind})`;
  });
  return renderConceptDocument({ conceptId: conceptIdentityFromPath(pathname), path: pathname, type, status: "draft",
    frontmatter: { type, title, description, status: "draft", sources, ...(relationships.length ? { relationships } : {}) },
    verified: [], body: `# Overview\n\n${body}${links.length ? `\n\n# Relations\n\n${links.join("\n")}` : ""}\n` });
}

function repository(pathname, id, displayName, repo, description, domainSource, fixtureRoot) {
  return renderConceptDocument({ conceptId: conceptIdentityFromPath(pathname), path: pathname, type: "Repository", status: "draft",
    frontmatter: { type: "Repository", title: displayName, description, status: "draft",
      sources: [source(repo, "README.md", `${repo}-readme`, id, fixtureRoot), domainSource],
      relationships: [{ kind: "part-of", target: "domains/crawler", evidence: [domainSource.id] }],
      agentbase: { repository: { id, display_name: displayName, aliases: { remotes: [], root_commits: [gitHead(path.join(fixtureRoot, repo))] }, observed_source: { commit: gitHead(path.join(fixtureRoot, repo)), dirty: false, dirty_digest: null, observed_at: "2026-08-28T00:00:00Z" } } } },
    verified: [], body: `# Purpose\n\n${description}\n\nPrimary Domain: [Crawler](../index.md).\n` });
}

function questionDocument(repoId) {
  const origin = { kind: "relation-candidate", originSubject: "domains/crawler/knowledge/crawler-publisher", originProperty: "queue", scopeKey: "crawler-jobs" };
  const id = createQuestionId(origin);
  return { id, content: renderQuestionDocument({ id, revision: 1, state: "open", ...origin,
    subject: origin.originSubject, property: origin.originProperty,
    references: [{ referenceKind: "candidate-evidence", candidateKey: "crawler-jobs-relation", sourceResource: `repository://${repoId}/main.tf#L1-L24` }],
    missingEvidence: ["provider identity for shared queue"], limitations: [], guidance: [],
    title: "Confirm crawler-jobs producer relation", createdAt: "2026-08-28T00:00:00Z" }) };
}

function qualificationDocuments(fixtureRoot) {
  const publisherId = "repository-crawler-publisher-111111111111";
  const workerId = "repository-crawler-worker-222222222222";
  const pipelineId = "repository-serverless-pipeline-333333333333";
  const owner = { id: "owner-domain", resource: "agentbase://owner-guidance/domains/crawler" };
  const publisherTf = source("crawler-publisher", "main.tf", "publisher-terraform", publisherId, fixtureRoot);
  const publisherHandler = source("crawler-publisher", "src/handler.py", "publisher-handler", publisherId, fixtureRoot);
  const workerTf = source("crawler-worker", "main.tf", "worker-terraform", workerId, fixtureRoot);
  const workerHandler = source("crawler-worker", "src/handler.py", "worker-handler", workerId, fixtureRoot);
  const documents = new Map();
  documents.set("index.md", "---\nokf_version: \"0.2\"\n---\n\n# AgentBase Hub\n\n* [Profile](shared/agentbase-profile.md) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n* [Crawler](domains/crawler/index.md) - Domain\n");
  documents.set("shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n");
  documents.set("shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument());
  const domainRoot = "domains/crawler";
  const publisherRepository = `${domainRoot}/repositories/crawler-publisher`;
  const workerRepository = `${domainRoot}/repositories/crawler-worker`;
  const pipelineRepository = `${domainRoot}/repositories/serverless-data-pipelines-demo`;
  const jobsResource = `${domainRoot}/knowledge/crawler-jobs`;
  const bucketResource = `${domainRoot}/knowledge/crawler-results-bucket`;
  const tableResource = `${domainRoot}/knowledge/crawler-jobs-table`;
  const publisherFunction = `${domainRoot}/knowledge/crawler-publisher`;
  const workerFunction = `${domainRoot}/knowledge/crawler-worker`;
  documents.set(`${publisherRepository}.md`, repository(`${publisherRepository}.md`, publisherId, "Crawler publisher", "crawler-publisher", "Publishes crawler jobs.", owner, fixtureRoot));
  documents.set(`${workerRepository}.md`, repository(`${workerRepository}.md`, workerId, "Crawler worker", "crawler-worker", "Consumes and stores crawler jobs.", owner, fixtureRoot));
  documents.set(`${pipelineRepository}.md`, repository(`${pipelineRepository}.md`, pipelineId, "Serverless data pipelines", "serverless-data-pipelines-demo", "Existing crawler data pipeline fixture.", owner, fixtureRoot));
  documents.set(`${jobsResource}.md`, concept(`${jobsResource}.md`, "Resource", "crawler-jobs SQS queue", "Shared SQS queue carrying crawler jobs.", [publisherTf, workerTf, owner], [{ kind: "part-of", target: domainRoot, evidence: [owner.id] }], "The `crawler-jobs` queue is a first-class transport between publisher and worker."));
  documents.set(`${bucketResource}.md`, concept(`${bucketResource}.md`, "Resource", "Crawler results S3 bucket", "S3 bucket storing processed crawler payloads.", [workerTf, owner], [{ kind: "part-of", target: domainRoot, evidence: [owner.id] }]));
  documents.set(`${tableResource}.md`, concept(`${tableResource}.md`, "Resource", "Crawler jobs DynamoDB table", "DynamoDB table indexing processed crawler jobs.", [workerTf, owner], [{ kind: "part-of", target: domainRoot, evidence: [owner.id] }]));
  documents.set(`${publisherFunction}.md`, concept(`${publisherFunction}.md`, "Function", "Crawler publisher Lambda", "Lambda that sends crawler jobs to SQS.", [publisherTf, publisherHandler], [
    { kind: "implemented-in", target: publisherRepository, evidence: [publisherTf.id] },
    { kind: "publishes-to", target: jobsResource, evidence: [publisherTf.id, publisherHandler.id] },
  ], "The publisher calls `send_message` with `CRAWLER_QUEUE_URL`."));
  documents.set(`${workerFunction}.md`, concept(`${workerFunction}.md`, "Function", "Crawler worker Lambda", "Lambda triggered by SQS and writing results.", [workerTf, workerHandler], [
    { kind: "implemented-in", target: workerRepository, evidence: [workerTf.id] },
    { kind: "triggered-by", target: jobsResource, evidence: [workerTf.id, workerHandler.id] },
    { kind: "writes-to", target: bucketResource, evidence: [workerTf.id] },
    { kind: "writes-to", target: tableResource, evidence: [workerTf.id] },
  ], "The worker consumes SQS records and persists payloads to S3 and DynamoDB."));
  const question = questionDocument(publisherId);
  documents.set(`${domainRoot}/questions/${question.id}.md`, question.content);
  const navigation = [
    [publisherRepository, "Crawler publisher", "Repository"],
    [workerRepository, "Crawler worker", "Repository"],
    [pipelineRepository, "Serverless data pipelines", "Repository"],
    [jobsResource, "crawler-jobs SQS queue", "Resource"],
    [bucketResource, "Crawler results S3 bucket", "Resource"],
    [tableResource, "Crawler jobs DynamoDB table", "Resource"],
    [publisherFunction, "Crawler publisher Lambda", "Function"],
    [workerFunction, "Crawler worker Lambda", "Function"],
  ].map(([identity, title, type]) => `* [${title}](${path.posix.relative(domainRoot, `${identity}.md`)}) - ${type}`);
  navigation.push(`* [Confirm crawler-jobs producer relation](questions/${question.id}.md) - Question`);
  documents.set(`${domainRoot}/index.md`, concept(`${domainRoot}/index.md`, "Domain", "Crawler", "Crawler qualification Domain", [owner], [], `Crawler qualification Domain.\n\n# Knowledge\n\n${navigation.join("\n")}`));
  return { documents, publisherId, workerId, pipelineId, questionId: question.id, publisherTf, workerTf };
}

function reader(documents) {
  return { commit: COMMIT, async listMarkdownPaths() { return [...documents.keys()]; }, async readMarkdown(relativePath) {
    const value = documents.get(relativePath); if (!value) throw new Error(`missing fixture ${relativePath}`); return value;
  } };
}

export async function qualify(outputDirectory, { fixtureRoot }) {
  const pipeline = path.join(fixtureRoot, "serverless-data-pipelines-demo");
  const publisher = path.join(fixtureRoot, "crawler-publisher");
  const worker = path.join(fixtureRoot, "crawler-worker");
  for (const root of [pipeline, publisher, worker]) assertClean(root);
  assert.match(fs.readFileSync(path.join(publisher, "main.tf"), "utf8"), /crawler-jobs/);
  assert.match(fs.readFileSync(path.join(worker, "main.tf"), "utf8"), /crawler-jobs/);
  const fixture = qualificationDocuments(fixtureRoot);
  const graph = await loadHubGraph(reader(fixture.documents), 256 * 1024);
  const projection = buildPublishedVisualizationProjection(graph, { hub: "fixture/crawler-qualification#main", domain: "domains/crawler" });
  assert.equal(projection.nodes.filter((node) => node.type === "Resource").length, 3);
  assert.equal(projection.nodes.filter((node) => node.type === "Function").length, 2);
  assert.ok(projection.edges.some((edge) => edge.predicate === "publishes-to"));
  assert.ok(projection.edges.some((edge) => edge.predicate === "triggered-by"));
  const result = await searchHubConcepts(reader(fixture.documents), "shared SQS queue", { domain: "domains/crawler", types: ["Resource"], limit: 5 });
  assert.equal(result.status, "ok");
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].path, "domains/crawler/knowledge/crawler-jobs.md");
  assert.ok(result.matches[0].context?.some((relation) => relation.predicate === "part-of"));

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-crawler-qualification-"));
  const hubRoot = path.join(temp, "hub"); fs.mkdirSync(hubRoot, { recursive: true });
  for (const [relative, content] of fixture.documents) { const target = path.join(hubRoot, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); }
  const bundle = loadOkfBundle(hubRoot, { requireAgentBaseRootIndex: true });
  const before = bundle.treeDigest;
  const stateRoot = path.join(temp, "state");
  const candidate = { id: `candidate-${"a".repeat(24)}`, kind: "relation", sourceConceptId: "domains/crawler/knowledge/crawler-publisher", targetConceptId: "domains/crawler/knowledge/crawler-jobs", predicate: "publishes-to", queue: { name: "crawler-jobs", accountId: ACCOUNT, region: REGION }, identityEvidenceIds: ["publisher-terraform", "worker-terraform"], interactionEvidenceIds: ["publisher-terraform"], question: { id: fixture.questionId, revision: 1 } };
  assert.equal(fixture.documents.has(candidate.sourceConceptId + ".md"), true);
  const manifest = prepareDomainEnrichment({ stateRoot, publishedRoot: hubRoot, baseCommit: COMMIT, domainId: "domains/crawler", repositoryIds: [fixture.publisherId, fixture.workerId, fixture.pipelineId], candidates: [candidate], accountId: ACCOUNT, regions: [REGION], createdAt: "2026-08-28T00:00:00Z" });
  const mock = createMockAwsSqsRunner({ accountId: ACCOUNT, queues: [{ name: "crawler-jobs", accountId: ACCOUNT, region: REGION }] });
  const enrichment = await runDomainEnrichment({ stateRoot, publishedRoot: hubRoot, manifestId: manifest.id, manifestRevision: manifest.revision, providerSessionConfirmed: true, adapter: new AwsCliAdapter(mock.runner) });
  assert.equal(enrichment.status, "ready"); assert.equal(enrichment.outcomes[0].status, "confirmed");
  assert.equal(loadOkfBundle(hubRoot, { requireAgentBaseRootIndex: true }).treeDigest, before);
  assert.equal(mock.calls.some((args) => args.includes("list-queues")), false);
  fs.rmSync(temp, { recursive: true, force: true });

  const site = buildStaticDomainSite(projection, { outputDirectory, visibilityAcknowledged: true });
  const receipt = JSON.parse(fs.readFileSync(path.join(outputDirectory, "agentbase-build.json"), "utf8"));
  assert.deepEqual(receipt.counts, { nodes: projection.nodes.length, edges: projection.edges.length, flows: 0, questions: 1 });
  assert.equal(site.domain, "domains/crawler");
  const siteText = fs.readFileSync(path.join(outputDirectory, "data/domain.json"), "utf8");
  assert.equal(siteText.includes("arn:aws"), false);
  return { sourceCommits: { publisher: gitHead(publisher), worker: gitHead(worker), pipeline: gitHead(pipeline) }, counts: receipt.counts, query: result.matches[0].path, enrichment: enrichment.outcomes[0].status, outputDirectory };
}
