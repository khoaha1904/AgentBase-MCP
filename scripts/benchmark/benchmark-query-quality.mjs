import { performance } from "node:perf_hooks";

import { searchHubConcepts } from "../../src/core/knowledge/query/hub-query.ts";
import { loadHubSearchProjection, resetHubSearchProjectionCache } from "../../src/core/knowledge/query/hub-query-search-index.ts";

export async function runQueryQualityQualification() {
  resetHubSearchProjectionCache();
  const documents = new Map();
  for (let domainIndex = 0; domainIndex < 10; domainIndex += 1) {
    const domain = `domains/domain-${String(domainIndex).padStart(2, "0")}`;
    documents.set(`${domain}.md`, `---\ntype: Domain\ntitle: Domain ${domainIndex}\ndescription: Qualification domain ${domainIndex}.\n---\n# Domain ${domainIndex}\n`);
    for (let memberIndex = 0; memberIndex < 99; memberIndex += 1) {
      const ordinal = domainIndex * 99 + memberIndex;
      const identity = `components/worker-${String(ordinal).padStart(4, "0")}`;
      documents.set(`${identity}.md`, `---
type: Component
title: Settlement Worker ${ordinal}
description: Processes settlement signal${String(ordinal).padStart(4, "0")}.
tags: [qualification, worker]
relationships:
  - kind: part-of
    target: ${domain}
    evidence: []
---
# Settlement Worker ${ordinal}

[Domain ${domainIndex}](/${domain}.md)

## Runtime

Handles deterministic ledger signal${String(ordinal).padStart(4, "0")} for qualification.
`);
    }
  }
  const reader = {
    commit: "7".repeat(40),
    async listMarkdownPaths() { return [...documents.keys()]; },
    async readMarkdown(relativePath) {
      const value = documents.get(relativePath);
      if (!value) throw new Error(`missing qualification document: ${relativePath}`);
      return value;
    },
  };
  const buildStarted = performance.now();
  await loadHubSearchProjection(reader, 256 * 1024);
  const buildMilliseconds = performance.now() - buildStarted;
  const cases = Array.from({ length: 100 }, (_, index) => {
    const ordinal = (index * 37) % 990;
    return { query: `settlement signal${String(ordinal).padStart(4, "0")}`,
      expected: `components/worker-${String(ordinal).padStart(4, "0")}` };
  });
  const durations = [], failures = [];
  for (const item of cases) {
    const started = performance.now();
    const result = await searchHubConcepts(reader, item.query, { global: true, limit: 5 });
    durations.push(performance.now() - started);
    const matches = result.status === "ok" ? result.matches : [];
    if (!matches.some((match) => match.identity === item.expected)) failures.push(item.expected);
    if (matches.length > 5 || matches.some((match) => (match.context?.length ?? 0) > 8)) failures.push(`${item.expected}: public bound exceeded`);
  }
  durations.sort((left, right) => left - right);
  const p95Milliseconds = durations[Math.ceil(durations.length * 0.95) - 1] ?? Infinity;
  return {
    scenario: "hub-query-quality", conceptCount: documents.size, queryCount: cases.length,
    topFiveRecall: (cases.length - failures.filter((item) => !item.includes(":")).length) / cases.length,
    buildMilliseconds: Number(buildMilliseconds.toFixed(3)),
    queryMilliseconds: { p50: Number((durations[49] ?? 0).toFixed(3)), p95: Number(p95Milliseconds.toFixed(3)), maximum: Number((durations.at(-1) ?? 0).toFixed(3)) },
    bounds: { resultLimit: 5, contextLimit: 8, maximumDocumentBytes: 256 * 1024 }, failures,
    passed: documents.size === 1000 && !failures.length && p95Milliseconds < 1000,
  };
}
