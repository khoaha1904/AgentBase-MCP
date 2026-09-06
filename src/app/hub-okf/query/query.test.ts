import assert from "node:assert/strict";
import test from "node:test";

import { createHubIdentity } from "../../../core/hub/index.ts";
import { renderAgentBaseOkfProfileDocument } from "../../../core/knowledge/index.ts";
import {
  buildActiveHubContinuity,
  inspectInitialIngestHubContext,
  projectPublishedHubDomain,
  readPublishedHubConcept,
  searchPublishedHub,
} from "./query.ts";

test("[AB-QUERY-004][AB-QUERY-012..015][AB-FRESH-001][AB-FRESH-006..007][AB-FRESH-011] Published search/read add freshness without reading Active", async () => {
  const publishedCommit = "5".repeat(40), activeCommit = "6".repeat(40);
  const conceptPath = "components/ledger-worker.md";
  const published = `---
type: Component
title: Ledger Worker
description: Handles settlement workflows.
tags: [payments]
---
# Ledger Worker

## Settlement

Writes the durable ledger entry.
`;
  const draft = published.replace("durable ledger", "draft-only ledger");
  const revisions: string[] = [];
  const git = async (request: Readonly<{ args: readonly string[]; operation: string }>) => {
    if (request.operation === "list local Hub concepts") return { stdout: `${conceptPath}\0`, stderr: "" };
    const revisionPath = String(request.args[1]);
    revisions.push(revisionPath);
    const commit = revisionPath.slice(0, 40);
    return { stdout: commit === publishedCommit ? published : draft, stderr: "" };
  };
  const localHub = {
    root: "/tmp/agentbase-query-test",
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: publishedCommit,
    activeHead: activeCommit,
    catalogVersion: "7.0.0",
  };

  const result = await searchPublishedHub(localHub, "ledger settlement", { global: true }, git);
  assert.equal(result.commit, publishedCommit);
  assert.equal(result.status, "ok");
  const match = result.status === "ok" ? result.matches[0] : undefined;
  assert.equal(match?.identity, "components/ledger-worker");
  assert.equal(match?.relevance?.method, "bm25+");
  assert.deepEqual(match?.section?.headingPath, ["Ledger Worker", "Settlement"]);
  assert.match(match?.excerpt ?? "", /durable ledger/i);
  assert.deepEqual({
    commit: result.freshness.published_commit,
    status: result.freshness.status,
    reason: result.freshness.reason,
  }, { commit: publishedCommit, status: "unknown", reason: "no_repository_context" });
  const read = await readPublishedHubConcept(localHub, conceptPath, git);
  assert.match(read.excerpt, /durable ledger/);
  assert.equal(read.freshness.published_commit, publishedCommit);
  assert.equal(read.freshness.status, "unknown");
  assert.equal(revisions.every((value) => value.startsWith(publishedCommit)), true);
});

test("[AB-PROFILE-LIFECYCLE-001][AB-PROFILE-LIFECYCLE-003][AB-PROFILE-LIFECYCLE-009][AB-PROFILE-READ-001..007] Profile Repository resolution returns its actual subject and navigation", async () => {
  const commit = "7".repeat(40), repositoryId = "repository-checkout-aaaaaaaaaaaa";
  const files = new Map<string, string>([
    ["index.md", `---\nokf_version: "0.2"\n---\n\n# Hub\n\n* [Profile](shared/agentbase-profile.md) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n* [Orders](domains/orders/) - Domain Capsule\n`],
    ["shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n"],
    ["shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument()],
    ["domains/orders/index.md", `---\ntype: Domain\ntitle: Orders\ndescription: Orders domain.\n---\n\n# Orders\n\n* [Checkout](repositories/checkout.md) - Repository\n`],
    ["domains/orders/repositories/checkout.md", `---\ntype: Repository\ntitle: Checkout\ndescription: Checkout source.\nstatus: draft\nagentbase:\n  repository:\n    id: ${repositoryId}\n    display_name: checkout\n    aliases:\n      remotes: [https://github.com/acme/checkout.git]\n      root_commits: [${"a".repeat(40)}]\n---\n\n# Checkout\n`],
  ]);
  const git = async (request: Readonly<{ args: readonly string[]; operation: string }>) => {
    if (request.operation === "list local Hub concepts") {
      return { stdout: `${[...files.keys()].filter((value) => value.endsWith(".md")).join("\0")}\0`, stderr: "" };
    }
    const revisionPath = String(request.args[1]), separator = revisionPath.indexOf(":");
    const relative = revisionPath.slice(separator + 1), source = files.get(relative);
    if (separator !== 40 || source === undefined) throw new Error(`unexpected Profile fixture read: ${revisionPath}`);
    return { stdout: source, stderr: "" };
  };
  const localHub = { root: "/tmp/agentbase-profile-query-test",
    hub: createHubIdentity("acme/AgentBase-Hub", "main"), remoteBase: commit, activeHead: commit,
    catalogVersion: "7.0.0" };
  const context = await inspectInitialIngestHubContext(localHub, { displayName: "checkout",
    remotes: ["https://github.com/acme/checkout.git"], rootCommits: ["a".repeat(40)] },
  { boundary: "active" }, git);
  assert.equal(context.repository.kind, "existing");
  assert.equal(context.repositorySubject?.identity, "domains/orders/repositories/checkout");
  const continuity = await buildActiveHubContinuity(localHub, repositoryId,
    context.repositorySubject!.identity, {}, git);
  assert.equal(continuity.subject?.identity, context.repositorySubject?.identity);
  assert.equal(continuity.subjectDirectory, context.repositorySubject?.identity);
  assert.deepEqual(continuity.navigationPaths,
    ["domains/orders/index.md", "index.md", "shared/index.md"]);
  const search = await searchPublishedHub(localHub, "checkout", { domain: "domains/orders" }, git);
  assert.equal(search.profile, "profile-1.0");
  assert.equal(search.status === "ok" ? search.matches[0]?.scope?.domain : undefined,
    "domains/orders");
  const visualization = await projectPublishedHubDomain(localHub, "domains/orders", git);
  assert.equal(visualization.domain.id, "domains/orders");
  assert.deepEqual(visualization.nodes.find((node) => node.id === context.repositorySubject?.identity)?.scopeRoles,
    ["home"]);
});
