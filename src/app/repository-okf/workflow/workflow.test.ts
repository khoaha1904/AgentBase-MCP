import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { computeOkfTreeDigest } from "../../../core/knowledge/index.ts";
import { executeOkfCli } from "../cli.ts";
import {
  applyRepositoryProposal,
  diffRepositoryProposal,
  prepareRepositoryProposal,
  validateRepositoryProposal,
} from "./workflow.ts";

const EVIDENCE_DIGEST = `sha256:${"b".repeat(64)}`;

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-product-flow-"));
  const write = (base: string, relative: string, content: string) => {
    const target = path.join(base, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  return { root, environment: { AGENTBASE_HOME: path.join(root, "agentbase") }, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function generatedConcept(type: string, title: string, body: string, sourcePath: string): string {
  return [
    "---",
    `type: ${type}`,
    `title: ${title}`,
    "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
    "sources:",
    "  - id: repository-source",
    `    resource: repository://repository-fixture-0123456789ab/${sourcePath}#L1-L6`,
    "---",
    "",
    body,
    "",
    "[^repository-source]: Current repository evidence.",
    "",
  ].join("\n");
}

test("[AB-MVP-008..015] product flow prepares, authors and diffs a linked multi-concept OKF bundle", () => {
  const current = fixture();
  try {
    const before = computeOkfTreeDigest(path.join(current.root, "okf"));
    const prepared = prepareRepositoryProposal(current.root, EVIDENCE_DIGEST, {
      proposalId: "proposal-product-000001",
      now: "2026-08-12T00:00:00.000Z",
      environment: current.environment,
    });
    current.write(prepared.bundleRoot, "index.md", [
      "---",
      "okf_version: '0.2'",
      "---",
      "",
      "# Repository knowledge",
      "",
      "* [Repository](repositories/fixture.md) - repository overview",
      "* [Catalog](components/catalog.md) - catalog component",
      "* [Inspection flow](flows/inspection.md) - cross-component flow",
      "* [Open question](questions/workspace-policy.md) - impactful uncertainty",
      "",
    ].join("\n"));
    current.write(prepared.bundleRoot, "repositories/fixture.md", generatedConcept(
      "Software Repository",
      "Fixture repository",
      "# Components\n\nThe repository contains [catalog](../components/catalog.md) and an [inspection flow](../flows/inspection.md).[^repository-source]",
      "src/app/inspect.ts",
    ));
    current.write(prepared.bundleRoot, "components/catalog.md", generatedConcept(
      "Software Component",
      "Catalog",
      "# Responsibility\n\nCatalog supplies module metadata to the [inspection flow](../flows/inspection.md).[^repository-source]",
      "src/catalog/repository.ts",
    ));
    current.write(prepared.bundleRoot, "flows/inspection.md", generatedConcept(
      "Software Flow",
      "Workspace inspection",
      "# Flow\n\nThe repository entry calls catalog and workspace boundaries. See the [open question](../questions/workspace-policy.md).[^repository-source]",
      "src/app/inspect.ts",
    ));
    current.write(prepared.bundleRoot, "questions/workspace-policy.md", generatedConcept(
      "Open Question",
      "Workspace policy ownership",
      "# Known\n\nA policy check exists.[^repository-source]\n\n# Question\n\nWhich maintainer owns policy changes?",
      "src/workspace/policy.ts",
    ));

    const validated = validateRepositoryProposal(current.root, prepared.metadata.proposalId, current.environment);
    assert.equal(validated.state, "generated");
    assert.equal(validated.producerValidation?.passed, true);
    const diff = diffRepositoryProposal(current.root, prepared.metadata.proposalId, current.environment);
    assert.equal(diff.applicable, true);
    assert.equal(diff.entries.filter((entry) => entry.change === "created").length, 5);
    assert.equal(computeOkfTreeDigest(path.join(current.root, "okf")), before);
    assert.equal(fs.existsSync(path.join(current.root, "okf")), false);
    const applied = applyRepositoryProposal(current.root, prepared.metadata.proposalId, "test:explicit-apply", current.environment);
    assert.equal(applied.phase, "finalized");
    assert.equal(computeOkfTreeDigest(path.join(current.root, "okf")), diff.proposedTreeDigest);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-009][AB-MVP-015] CLI routes prepare without applying current OKF", async () => {
  const current = fixture();
  let output = "";
  let errors = "";
  try {
    const code = await executeOkfCli([
      "prepare",
      "--repo",
      current.root,
      "--evidence-digest",
      EVIDENCE_DIGEST,
    ], (value) => { output += value; }, (value) => { errors += value; }, current.environment);
    assert.equal(code, 0, errors);
    const parsed = JSON.parse(output) as { metadata: { state: string }; bundleRoot: string };
    assert.equal(parsed.metadata.state, "prepared");
    assert.match(parsed.bundleRoot, /state[\\/]repositories[\\/][a-f0-9]{24}[\\/]proposals[\\/]/);
    assert.equal(fs.existsSync(path.join(current.root, "okf")), false);
  } finally {
    current.cleanup();
  }
});
