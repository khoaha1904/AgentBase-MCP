import assert from "node:assert/strict";
import test from "node:test";

import {
  OkfValidationError,
  createRepositorySourceResource,
  parseConceptDocument,
  renderConceptDocument,
  validateAgentBaseDraft,
  validatePublishableAgentBaseDraft,
} from "../index.ts";

function concept(frontmatter: string, body = "# Overview\n\nA concept.\n"): string {
  return `---\n${frontmatter}\n---\n\n${body}`;
}

test("[AB-MVP-010][AB-MVP-013] parses the minimum concept and preserves unknown values", () => {
  const parsed = parseConceptDocument("components/catalog.md", concept([
    "type: Software Component",
    "extension:",
    "  nested: [one, { two: true }]",
  ].join("\n")));
  assert.equal(parsed.conceptId, "components/catalog");
  assert.equal(parsed.type, "Software Component");
  const rendered = renderConceptDocument(parsed);
  const reparsed = parseConceptDocument(parsed.path, rendered);
  assert.deepEqual(reparsed.frontmatter.extension, parsed.frontmatter.extension);
});

test("[AB-BENCH-037] production drafts reject benchmark-only metadata", () => {
  const parsed = parseConceptDocument("systems/cart.md", concept([
    "type: System",
    "status: draft",
    "benchmark_key: hidden-probe",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
  ].join("\n")));
  assert.match(validatePublishableAgentBaseDraft(parsed).join("\n"), /benchmark_key/);
  assert.equal(validateAgentBaseDraft(parsed).some((failure) => failure.includes("benchmark_key")), false);
});

test("[AB-MVP-010] rejects missing frontmatter, duplicate keys, aliases and missing type", () => {
  assert.throws(() => parseConceptDocument("plain.md", "# no frontmatter\n"), OkfValidationError);
  assert.throws(() => parseConceptDocument("duplicate.md", concept("type: A\ntype: B")), /unique|duplicate/i);
  assert.throws(() => parseConceptDocument("alias.md", concept("type: A\nbase: &base [one]\ncopy: *base")), /alias/i);
  assert.throws(() => parseConceptDocument("missing.md", concept("title: Missing type")), /type/);
  assert.throws(() => parseConceptDocument("empty.md", concept("type: '   '")), /type/);
});

test("[AB-MVP-010] bounds frontmatter, depth, collection size and scalar size", () => {
  assert.throws(() => parseConceptDocument("large.md", concept(`type: A\nvalue: ${"x".repeat(65_536)}`)), /frontmatter/i);
  assert.throws(() => parseConceptDocument("deep.md", concept(`type: A\nvalue: ${"[".repeat(20)}x${"]".repeat(20)}`)), /depth/i);
  assert.throws(() => parseConceptDocument("many.md", concept(`type: A\nvalue: [${Array.from({ length: 4100 }, () => "x").join(",")}]`)), /node/i);
  assert.throws(() => parseConceptDocument("scalar.md", concept(`type: A\nvalue: ${"x".repeat(33_000)}`)), /scalar/i);
});

test("[AB-MVP-010][AB-MVP-013] normalizes bare verified and tolerates unknown types or absent optional fields", () => {
  const parsed = parseConceptDocument("unknown.md", concept([
    "type: Future Producer Type",
    "verified: { by: 'human:khoa', at: '2026-08-12T00:00:00Z' }",
  ].join("\n")));
  assert.deepEqual(parsed.verified, [{ by: "human:khoa", at: "2026-08-12T00:00:00Z" }]);
  assert.equal(parsed.status, "stable");
});

test("[AB-MVP-012] AgentBase producer policy requires draft ownership and never invents verification", () => {
  const valid = parseConceptDocument("repo.md", concept([
    "type: Software Repository",
    "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
    "sources:",
    "  - id: repo-source",
    "    resource: repository://repository-demo-0123456789ab/src/app.ts#L1-L5",
  ].join("\n")));
  assert.deepEqual(validateAgentBaseDraft(valid), []);
  const verified = { ...valid, verified: [{ by: "human:khoa", at: "2026-08-12T00:00:00Z" }] };
  assert.ok(validateAgentBaseDraft(verified).some((failure) => failure.includes("verified")));
});

test("[AB-MVP-012] producer policy rejects unresolved footnotes and malformed repository resources", () => {
  const unresolved = parseConceptDocument("repo.md", concept([
    "type: Software Repository",
    "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
    "sources:",
    "  - id: known",
    "    resource: repository://repository-demo-0123456789ab/src/app.ts#L1-L5",
  ].join("\n"), "Claim.[^missing]\n\n[^missing]: Missing source.\n"));
  assert.ok(validateAgentBaseDraft(unresolved).some((failure) => failure.includes("footnote missing")));

  const unsafe = parseConceptDocument("unsafe.md", concept([
    "type: Software Repository",
    "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
    "sources:",
    "  - id: unsafe",
    "    resource: repository://repository-demo-0123456789ab/../secret#L1-L1",
  ].join("\n")));
  assert.ok(validateAgentBaseDraft(unsafe).some((failure) => failure.includes("not normalized")));
});

test("[AB-MVP-012] builds normalized repository source resources without checkout roots", () => {
  assert.equal(
    createRepositorySourceResource("repository-demo-0123456789ab", "src/catalog item.ts", 3, 9),
    "repository://repository-demo-0123456789ab/src/catalog%20item.ts#L3-L9",
  );
  assert.throws(() => createRepositorySourceResource("repository-demo-0123456789ab", "../secret", 1, 1), /relative/);
  assert.throws(() => createRepositorySourceResource("bad id", "src/app.ts", 1, 1), /repositoryId/);
});
