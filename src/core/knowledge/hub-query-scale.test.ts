import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument } from "./okf-document.ts";
import { searchHubConcepts, traverseHubConcepts } from "./hub-query.ts";
import { validateOkfRelationships } from "./okf-relationships.ts";

function domain(index: number): string {
  return `---
title: Domain ${index}
description: Qualification domain ${index}.
type: Domain
relationships: []
---
# Domain ${index}
`;
}

function worker(domainIndex: number, workerIndex: number): string {
  return `---
title: Worker ${domainIndex}-${workerIndex}
description: Shared worker qualification term.
type: Component
relationships:
  - kind: part-of
    target: domains/domain-${domainIndex}
    evidence: [domain-membership]
---
# Worker ${domainIndex}-${workerIndex}
`;
}

const documents = new Map<string, string>();
for (let domainIndex = 0; domainIndex < 10; domainIndex += 1) {
  documents.set(`domains/domain-${domainIndex}.md`, domain(domainIndex));
  for (let workerIndex = 0; workerIndex < 100; workerIndex += 1) {
    documents.set(`components/domain-${domainIndex}/worker-${workerIndex}.md`, worker(domainIndex, workerIndex));
  }
}
const reader = {
  commit: "d".repeat(40),
  async listMarkdownPaths() { return [...documents.keys()]; },
  async readMarkdown(relativePath: string) {
    const value = documents.get(relativePath);
    if (!value) throw new Error("missing");
    return value;
  },
};

test("[AB-BENCH-039][SC-001..004] ten Domains and one thousand nodes remain scoped and traversable", async () => {
  assert.equal(documents.size, 1010);
  const ambiguous = await searchHubConcepts(reader, "shared worker");
  assert.equal(ambiguous.status, "scope_required");
  assert.equal(ambiguous.status === "scope_required" ? ambiguous.candidateDomains.length : 0, 10);
  const scoped = await searchHubConcepts(reader, "shared worker", { domain: "domains/domain-7", limit: 100 });
  assert.equal(scoped.status, "ok");
  assert.equal(scoped.status === "ok" ? scoped.matches.length : 0, 100);
  assert.ok(scoped.status === "ok" && scoped.matches.every((match) => match.domains[0] === "domains/domain-7"));
  const exact = await searchHubConcepts(reader, "components/domain-7/worker-42");
  assert.equal(exact.status === "ok" ? exact.matches[0]?.identity : undefined, "components/domain-7/worker-42");
  const traversed = await traverseHubConcepts(reader, "components/domain-7/worker-42", {
    direction: "outbound", kinds: ["part-of"], maxDepth: 1, limit: 2,
  });
  assert.deepEqual(traversed.nodes.map((node) => node.identity), [
    "components/domain-7/worker-42", "domains/domain-7",
  ]);
  assert.equal(traversed.truncated, false);
});

test("[AB-SCHEMA-021][AB-BENCH-039] one change validates with only its referenced unchanged target", () => {
  const content = `---
title: New Worker
description: One incremental worker.
type: Component
status: draft
generated: { by: agentbase/0.0.0, at: 2026-08-15T00:00:00Z }
sources:
  - id: domain-membership
    resource: repository://repository-scale-aaaaaaaaaaaa/README.md#L1-L1
relationships:
  - kind: part-of
    target: domains/domain-7
    evidence: [domain-membership]
---
# New Worker

Part of [Domain 7](../domains/domain-7.md).
`;
  const concept = parseConceptDocument("components/new-worker.md", content);
  const validation = validateOkfRelationships([{ identity: "components/new-worker", concept }], {
    targets: [{ identity: "domains/domain-7", path: "domains/domain-7.md", type: "Domain" }],
    strictSourceIdentities: new Set(["components/new-worker"]),
  });
  assert.deepEqual(validation.failures, []);
});
