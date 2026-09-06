import assert from "node:assert/strict";
import test from "node:test";

import {
  buildContextFreshnessEnvelope,
} from "./context-freshness.ts";
import {
  readHubConceptWithFreshness,
  searchHubConcepts,
  searchHubConceptsWithFreshness,
} from "./hub-query.ts";
import { resetHubSearchProjectionCache } from "./hub-query-search-index.ts";

const PUBLISHED = "a".repeat(40);
const OBSERVED_AT = "2026-09-01T00:00:00.000Z";

function strongId(index: number): string {
  return `repository-r-${index.toString(16).padStart(12, "0")}`;
}

test("[AB-FRESH-002..004][AB-FRESH-008..009] freshness aggregation is deterministic, bounded and strict", () => {
  const repositories = [1, 2].map((index) => ({
    conceptId: `repositories/r-${index}`,
    repositoryId: strongId(index),
    observedRevision: String(index).repeat(40),
    observedAt: index === 1 ? "2020-01-01T00:00:00Z" : OBSERVED_AT,
  }));
  const currentSources = repositories.map((repository) => ({
    repositoryId: repository.repositoryId,
    revision: repository.observedRevision,
  }));
  const fresh = buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    evaluatedAt: "2026-09-04T00:00:00.000Z",
    repositories,
    currentSources,
  });
  assert.equal(fresh.status, "fresh");
  assert.equal(fresh.reason, "all_source_revisions_match");
  assert.equal(fresh.current_source_verified, true);
  assert.deepEqual(fresh.repositories.map((repository) => repository.concept_id), ["repositories/r-1", "repositories/r-2"]);

  const stale = buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    evaluatedAt: fresh.evaluated_at,
    repositories,
    currentSources: [{ repositoryId: strongId(1), revision: "f".repeat(40) }, currentSources[1]!],
  });
  assert.equal(stale.status, "stale");
  assert.equal(stale.reason, "source_revision_changed");
  assert.equal(stale.current_source_verified, true, "a differing source can still have been explicitly verified");

  const unknown = buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    evaluatedAt: fresh.evaluated_at,
    repositories,
  });
  assert.equal(unknown.status, "unknown");
  assert.equal(unknown.reason, "current_source_not_fully_verified");
  assert.equal(unknown.repositories.every((repository) => repository.reason === "current_source_not_verified"), true);

  const many = Array.from({ length: 65 }, (_, offset) => {
    const index = offset + 1;
    return {
      conceptId: `repositories/bounded-${String(index).padStart(2, "0")}`,
      repositoryId: strongId(index),
      observedRevision: (index % 10).toString().repeat(40),
      observedAt: OBSERVED_AT,
    };
  });
  const bounded = buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    evaluatedAt: fresh.evaluated_at,
    repositories: many,
    currentSources: many.map((repository) => ({ repositoryId: repository.repositoryId, revision: repository.observedRevision })),
  });
  assert.equal(bounded.repositories.length, 64);
  assert.equal(bounded.omitted_repository_count, 1);
  assert.equal(bounded.status, "unknown");
  assert.equal(bounded.reason, "repository_context_omitted");

  assert.throws(() => buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    repositories: [repositories[0]!, { ...repositories[0]!, observedRevision: "e".repeat(40) }],
  }), /observation conflicts/);
  assert.throws(() => buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    repositories: [repositories[0]!, { ...repositories[0]!, conceptId: "repositories/duplicate" }],
  }), /identity conflicts/);
  assert.throws(() => buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    repositories,
    currentSources: [{ repositoryId: strongId(1), revision: "1".repeat(40) },
      { repositoryId: strongId(1), revision: "2".repeat(40) }],
  }), /receipts conflict/);
  assert.throws(() => buildContextFreshnessEnvelope({ publishedCommit: "not-a-commit", repositories: [] }), /Published commit/);
  assert.throws(() => buildContextFreshnessEnvelope({
    publishedCommit: PUBLISHED,
    evaluatedAt: "not-a-time",
    repositories: [],
  }), /evaluation time/);
});

function repository(title: string, id: string, revision: string, domain: string): string {
  return `---
type: Repository
title: ${title}
description: ${title} source.
agentbase:
  repository:
    id: ${id}
    display_name: ${title}
    aliases: { remotes: [], root_commits: [] }
    observed_source:
      commit: '${revision}'
      dirty: false
      dirty_digest: null
      observed_at: '${OBSERVED_AT}'
relationships:
  - kind: part-of
    target: ${domain}
---
# ${title}

[Domain](/${domain}.md)
`;
}

function component(title: string, repositoryId: string, resourceId: string): string {
  return `---
type: Component
title: ${title}
description: Uses the shared work queue.
relationships:
  - kind: implemented-in
    target: ${repositoryId}
  - kind: depends-on
    target: ${resourceId}
---
# ${title}

[Repository](/${repositoryId}.md)
[Shared queue](/${resourceId}.md)
`;
}

test("[AB-FRESH-001][AB-FRESH-005][AB-FRESH-007][AB-FRESH-011] Published search adds scoped warning-only freshness without changing matches", async () => {
  resetHubSearchProjectionCache();
  const documents = new Map([
    ["domains/work.md", "---\ntype: Domain\ntitle: Work\ndescription: Work domain.\n---\n# Work\n"],
    ["repositories/producer.md", repository("Producer", strongId(1), "1".repeat(40), "domains/work")],
    ["repositories/consumer.md", repository("Consumer", strongId(2), "2".repeat(40), "domains/work")],
    ["components/producer.md", component("Producer component", "repositories/producer", "resources/work-queue")],
    ["components/consumer.md", component("Consumer component", "repositories/consumer", "resources/work-queue")],
    ["resources/work-queue.md", "---\ntype: Resource\ntitle: Shared Work Queue\ndescription: Shared work queue boundary.\n---\n# Shared Work Queue\n"],
  ]);
  const reader = {
    commit: PUBLISHED,
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath: string) {
      const value = documents.get(relativePath);
      if (!value) throw new Error("missing");
      return value;
    },
  };
  const baseline = await searchHubConcepts(reader, "shared work queue", { global: true, limit: 5 });
  resetHubSearchProjectionCache();
  const result = await searchHubConceptsWithFreshness(reader, "shared work queue", { global: true, limit: 5 });
  assert.equal(result.status, "ok");
  assert.deepEqual(result.status === "ok" ? result.matches.map((match) => match.identity) : [],
    baseline.status === "ok" ? baseline.matches.map((match) => match.identity) : []);
  assert.equal(result.freshness.published_commit, PUBLISHED);
  assert.equal(result.freshness.status, "unknown");
  assert.equal(result.freshness.reason, "current_source_not_fully_verified");
  assert.deepEqual(result.freshness.repositories.map((repository) => repository.repository_id), [strongId(2), strongId(1)]);
  assert.equal(result.freshness.repositories.every((repository) => repository.current_source_verified === false), true);
});

test("[AB-FRESH-006] exact read remains single-document and reports only a contained Repository observation", async () => {
  let reads = 0;
  const repositoryMarkdown = repository("Producer", strongId(1), "1".repeat(40), "domains/work");
  const repositoryReader = {
    commit: PUBLISHED,
    async listMarkdownPaths(): Promise<readonly string[]> { throw new Error("exact read must not list the Hub"); },
    async readMarkdown() { reads += 1; return repositoryMarkdown; },
  };
  const result = await readHubConceptWithFreshness(repositoryReader, "repositories/producer.md");
  assert.equal(reads, 1);
  assert.equal(result.freshness.status, "unknown");
  assert.equal(result.freshness.repositories[0]?.repository_id, strongId(1));
  assert.equal(result.freshness.repositories[0]?.observed_revision, "1".repeat(40));

  const componentReader = {
    ...repositoryReader,
    async readMarkdown() { reads += 1; return component("Producer component", "repositories/producer", "resources/work-queue"); },
  };
  const componentResult = await readHubConceptWithFreshness(componentReader, "components/producer.md");
  assert.equal(componentResult.freshness.status, "unknown");
  assert.equal(componentResult.freshness.reason, "no_repository_context");
  assert.deepEqual(componentResult.freshness.repositories, []);

  const malformed = repositoryMarkdown.replace(`commit: '${"1".repeat(40)}'`, "commit: malformed");
  await assert.rejects(() => readHubConceptWithFreshness({ ...repositoryReader,
    async readMarkdown() { return malformed; } }, "repositories/producer.md"), /observation is malformed/);
});
