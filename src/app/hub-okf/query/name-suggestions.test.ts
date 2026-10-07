import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseConceptDocument } from "../../../core/knowledge/index.ts";
import type { NameMatchResult } from "../../repository-source/index.ts";
import { comparePublishedNameLinks, retainNameSuggestions } from "./name-suggestions.ts";

test("[AB-NAME-006..008] Published comparison and private bounded reports preserve all suggestions without source bytes", () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-name-report-")));
  try {
    const definingId = `repository-infra-${"a".repeat(12)}`, usingId = `repository-producer-${"b".repeat(12)}`;
    const repos = [{ id: "infra", root, repositoryId: definingId }, { id: "producer", root, repositoryId: usingId }];
    const result: NameMatchResult = {
      links: Array.from({ length: 60 }, (_, index) => ({ name: `fleet-events-${index}`, defining_repo: "infra", using_repo: "producer",
        kind: "publishes-to", confidence: "exact", mechanisms: ["function-environment"], evidence: {
          definition: [{ repo: "infra", path: "main.tf", line: index + 1 }], usage: [{ repo: "producer", path: "src/main.js", line: 1 }] } })),
      questions: [], referencedNotDefined: [], moduleVersionDrift: { modules: 0, repositories: 0 }, limitations: [],
    };
    const resource = parseConceptDocument("resources/events.md", `---\ntype: Resource\ntitle: fleet-events-0\ndescription: Shared events.\nsources:\n  - id: definition\n    resource: repository://${definingId}/main.tf#L1-L1\n---\n# Events\n`);
    const producer = parseConceptDocument("repositories/producer.md", `---\ntype: Repository\ntitle: Producer\ndescription: Event publisher.\nsources:\n  - id: usage\n    resource: repository://${usingId}/src/main.js#L1-L1\n---\n# Producer\n`);
    const graph = { commit: "a".repeat(40), concepts: new Map([[resource.conceptId, { document: resource }],
      [producer.conceptId, { document: producer }]]), edges: [{ source: producer.conceptId, target: resource.conceptId, kind: "publishes-to" }] } as never;
    const compared = comparePublishedNameLinks(repos, result, graph);
    assert.equal(compared.links.filter((link) => link.published).length, 1);
    const report = retainNameSuggestions(path.join(root, "reports"), compared);
    assert.equal(report.links.length, 50);
    assert.equal(report.omitted.links, 9);
    assert.equal(report.truncated, true);
    assert.equal(report.counts.published, 1);
    assert.ok(report.links.every((link) => !link.published));
    const full = JSON.parse(fs.readFileSync(report.fullReport, "utf8"));
    assert.equal(full.links.length, 60);
    assert.equal(JSON.stringify(full).includes(root), false);
    assert.equal(retainNameSuggestions(path.join(root, "reports"), compared).fullReport, report.fullReport);
    if (process.platform !== "win32") assert.equal(fs.statSync(report.fullReport).mode & 0o777, 0o600);
    const changedKind = { ...result, links: [{ ...result.links[0]!, kind: "reads-from" }] };
    assert.equal(comparePublishedNameLinks(repos, changedKind, graph).links[0]!.published, false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
