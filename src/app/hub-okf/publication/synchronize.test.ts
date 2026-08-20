import assert from "node:assert/strict";
import test from "node:test";

import type { PendingHubProposal } from "../review/pending.ts";
import { recognizePublishedProposals, stablePatchIdentity } from "./synchronization-recognition.ts";

function proposal(id: string, commit: string, diff: string): PendingHubProposal {
  return {
    id,
    subject: "repositories/orders",
    sourceRepositoryId: "repository-orders-aaaaaaaaaaaa",
    evidenceDigest: `sha256:${"d".repeat(64)}`,
    diffDigest: `sha256:${diff.repeat(64)}`,
    schemaVersion: "2.0.0",
    parentCommit: "a".repeat(40),
    commit,
    diffSummary: "1 file changed",
    publicationState: "pending",
  };
}

test("[AB-LOCAL-HUB-008] synchronization recognizes exact, trailer and patch/diff identity", () => {
  const exact = proposal("1".repeat(24), "b".repeat(40), "1");
  const trailer = proposal("2".repeat(24), "c".repeat(40), "2");
  const patch = proposal("3".repeat(24), "d".repeat(40), "3");
  const pending = [exact, trailer, patch, proposal("4".repeat(24), "e".repeat(40), "4")];
  const messages = `AgentBase-Proposal-ID: ${trailer.id}`;
  const patchIdentity = stablePatchIdentity("diff --git a/a.md b/a.md\nindex abc..def\n+value\n");
  const result = recognizePublishedProposals(
    pending,
    new Set([exact.commit]),
    messages,
    new Map([[patch.commit, patchIdentity]]),
    new Set([patchIdentity]),
  );
  assert.deepEqual(result.recognized.map((item) => item.id), [exact.id, trailer.id, patch.id]);
  assert.deepEqual(result.remaining.map((item) => item.id), [pending[3]!.id]);
});
