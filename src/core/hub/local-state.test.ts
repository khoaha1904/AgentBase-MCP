import assert from "node:assert/strict";
import test from "node:test";

import { createHubIdentity } from "./identity.ts";
import { advanceSynchronization, createLocalHubOwnerLock, createLocalHubState } from "./local-state.ts";

test("[AB-LOCAL-HUB-001][AB-LOCAL-HUB-011] admits exact local main state and serialized owner", () => {
  const state = createLocalHubState({
    root: "/private/AgentBase-Hub",
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: "a".repeat(40), activeHead: "b".repeat(40), catalogVersion: "2.0.0",
  });
  assert.equal(state.root, "/private/AgentBase-Hub");
  assert.equal(createLocalHubOwnerLock({ ownerId: "accept:12345678", operation: "accept", acquiredAt: "2026-08-12T00:00:00Z" }).operation, "accept");
  assert.throws(() => createLocalHubState({ ...state, root: "relative" }), /absolute/);
  assert.throws(() => createLocalHubOwnerLock({ ownerId: "short", operation: "accept", acquiredAt: "now" }), /owner/);
});

test("[AB-LOCAL-HUB-008] synchronization preserves original head through conflict and validation", () => {
  const base = {
    id: "sync-12345678", phase: "prepared" as const,
    originalHead: "a".repeat(40), remoteHead: "b".repeat(40),
    recognizedProposalIds: [], remainingCommits: ["c".repeat(40)],
  };
  const fetched = advanceSynchronization(base, "fetched");
  const rebasing = advanceSynchronization(fetched, "rebasing");
  const conflict = advanceSynchronization(rebasing, "conflict", { conflictPaths: ["repositories/a/repository.md"] });
  assert.equal(conflict.originalHead, base.originalHead);
  const resumed = advanceSynchronization(conflict, "rebasing", { conflictPaths: [] });
  const validated = advanceSynchronization(resumed, "validated", { candidateHead: "d".repeat(40) });
  assert.equal(advanceSynchronization(validated, "advanced").candidateHead, "d".repeat(40));
  assert.throws(() => advanceSynchronization(rebasing, "conflict"), /conflict paths/);
});
