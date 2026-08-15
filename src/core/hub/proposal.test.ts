import assert from "node:assert/strict";
import test from "node:test";
import { createHubIdentity } from "./identity.ts";
import { advanceHubProposal, assertDependencySafePrefix, createHubProposal, createLocalProposal, renderLocalProposalTrailers } from "./proposal.ts";

test("[AB-HUB-005][AB-HUB-012][AB-HUB-013] proposal identity and phases are deterministic", () => {
  const input = {
    mode: "new" as const, subject: "repositories/acme", hub: createHubIdentity("acme/hub", "main"), baseCommit: "a".repeat(40),
    sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
    evidenceDigest: `sha256:${"c".repeat(64)}`, schemaVersion: "1.0.0",
    selectedSchemas: ["Software Component", "Software Repository"],
    treeDigest: `sha256:${"d".repeat(64)}`, diffDigest: `sha256:${"e".repeat(64)}`,
  };
  const first = createHubProposal(input);
  const second = createHubProposal({ ...input, selectedSchemas: [...input.selectedSchemas].reverse() });
  assert.equal(first.id, second.id);
  const committed = advanceHubProposal(first, "committed", { commit: "b".repeat(40) });
  assert.equal(advanceHubProposal(committed, "pushed").phase, "pushed");
  assert.throws(() => advanceHubProposal(first, "pushed", { commit: "b".repeat(40) }));
  assert.throws(() => createHubProposal({ ...input, diffDigest: "raw-hex" }), /SHA-256/);
  assert.equal(createHubProposal({ ...input, subject: "systems/shopping-cart" }).subject, "systems/shopping-cart");
  assert.throws(() => createHubProposal({ ...input, subject: "questions/unresolved" }), /normalized Hub path/);
});

test("[AB-LOCAL-HUB-003][AB-LOCAL-HUB-005][AB-LOCAL-HUB-006] local proposals have portable trailers and safe prefix selection", () => {
  const make = (id: string, parentCommit: string, acceptedCommit: string) => createLocalProposal({
    id, mode: "new", subject: "repositories/orders", sourceRepositoryId: "repository-orders-aaaaaaaaaaaa",
    evidenceDigest: `sha256:${"c".repeat(64)}`, schemaVersion: "2.0.0", selectedSchemas: ["Service"],
    parentCommit, acceptedCommit, treeDigest: `sha256:${"d".repeat(64)}`, diffDigest: `sha256:${"e".repeat(64)}`,
    createdAt: "2026-08-12T00:00:00Z", acceptedAt: "2026-08-12T00:01:00Z",
  });
  const first = make("1".repeat(24), "a".repeat(40), "b".repeat(40));
  const second = make("2".repeat(24), first.acceptedCommit, "c".repeat(40));
  assert.match(renderLocalProposalTrailers(first), /AgentBase-Proposal-ID: 111/);
  assert.deepEqual(assertDependencySafePrefix([first, second], [first.id]), [first]);
  assert.throws(() => assertDependencySafePrefix([first, second], [second.id]), /contiguous/);
});

test("[AB-HUB-SETUP-007][AB-HUB-SETUP-008] prepared local-only proposal uses stable local authority", () => {
  const input = {
    mode: "new" as const, subject: "repositories/acme", localHubId: "1".repeat(24), baseCommit: "a".repeat(40),
    sourceRepositoryId: "repository-acme-aaaaaaaaaaaa", evidenceDigest: `sha256:${"c".repeat(64)}`,
    schemaVersion: "2.0.0", selectedSchemas: ["Repository"], treeDigest: `sha256:${"d".repeat(64)}`,
    diffDigest: `sha256:${"e".repeat(64)}`,
  };
  const proposal = createHubProposal(input);
  assert.equal(proposal.localHubId, input.localHubId);
  assert.equal("hub" in proposal, false);
  assert.equal(createHubProposal(input).id, proposal.id);
  assert.throws(() => createHubProposal({ ...input, localHubId: "short" }), /localHubId/);
});
