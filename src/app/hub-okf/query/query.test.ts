import assert from "node:assert/strict";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../../core/hub/index.ts";
import type { GitRequest } from "../../../providers/github-hub/index.ts";
import { readActiveHubConcept, readActiveHubLiveEvidence, searchActiveHub, traverseActiveHub } from "./query.ts";

test("[AB-LOCAL-HUB-004][AB-QUERY-001] query reads the accepted commit, never workspace bytes", async () => {
  const head = "a".repeat(40);
  const localHub = createLocalHubState({
    root: "/private/AgentBase-Hub",
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: "b".repeat(40), activeHead: head, catalogVersion: "2.0.0",
  });
  const calls: GitRequest[] = [];
  const git = async (request: GitRequest) => {
    calls.push(request);
    return request.args[0] === "ls-tree"
      ? { stdout: "repositories/orders/service.md\0", stderr: "" }
      : { stdout: [
        "---", "title: Orders service", "description: Accepted business knowledge.",
        "type: System", "relationships: []", "---", "# Orders service",
        "Accepted pending business knowledge.", "",
      ].join("\n"), stderr: "" };
  };
  const searched = await searchActiveHub(localHub, "business", {}, git);
  assert.equal(searched.commit, head);
  assert.equal(searched.status === "ok" ? searched.matches[0]?.path : undefined, "repositories/orders/service.md");
  assert.equal((await traverseActiveHub(localHub, "repositories/orders/service", {}, git)).start,
    "repositories/orders/service");
  assert.match((await readActiveHubConcept(localHub, "repositories/orders/service.md", git)).excerpt, /Accepted/);
  assert.ok(calls.every((call) => call.args.some((argument) => argument.includes(head))));
  assert.ok(calls.every((call) => !call.args.includes("--work-tree")));
});

test("[AB-QUERY-006..008] live evidence is read from accepted Hub and bound to the authorized source", async () => {
  const head = "a".repeat(40), sourceCommit = "b".repeat(40);
  const localHub = createLocalHubState({
    root: "/private/AgentBase-Hub", hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: "c".repeat(40), activeHead: head, catalogVersion: "2.0.0",
  });
  const markdown = [
    "---", "type: System", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
    "sources:", "  - id: ttl", "    resource: repository://repository-shop-123456789abc/src/config.ts#L7-L9",
    "agentbase:", "  live_claims:", "    - id: AB-CLAIM-session-ttl",
    "      subject: systems/checkout", "      property: session.ttl", "      role: configuration",
    "      source_id: ttl", "      target: { kind: symbol, name: SESSION_TTL_DAYS }",
    `      observed: { commit: ${sourceCommit}, dirty: false, dirty_digest: null }`,
    "---", "# Checkout",
  ].join("\n");
  const git = async () => ({ stdout: markdown, stderr: "" });
  const ready = await readActiveHubLiveEvidence(localHub, "systems/checkout.md", {
    repositoryId: "repository-shop-123456789abc", commit: sourceCommit, dirty: false, dirtyDigest: null,
    limitations: [],
  }, git);
  assert.equal(ready.commit, head);
  assert.equal(ready.claims[0]?.status, "ready");
  assert.equal("value" in (ready.claims[0] as object), false);
  const mismatch = await readActiveHubLiveEvidence(localHub, "systems/checkout.md", {
    repositoryId: "repository-other-aaaaaaaaaaaa", commit: sourceCommit, dirty: false, dirtyDigest: null,
    limitations: [],
  }, git);
  assert.equal(mismatch.claims[0]?.status, "repository-mismatch");
  const unavailable = await readActiveHubLiveEvidence(localHub, "systems/checkout.md", undefined, git);
  assert.equal(unavailable.claims[0]?.status, "unavailable");
});
