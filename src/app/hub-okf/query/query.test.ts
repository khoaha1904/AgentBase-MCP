import assert from "node:assert/strict";
import test from "node:test";

import { createHubIdentity } from "../../../core/hub/index.ts";
import { readPublishedHubConcept, searchPublishedHub } from "./query.ts";

test("[AB-QUERY-004][AB-QUERY-012..015] Published search returns additive lexical detail without reading Active", async () => {
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
  const read = await readPublishedHubConcept(localHub, conceptPath, git);
  assert.match(read.excerpt, /durable ledger/);
  assert.equal(revisions.every((value) => value.startsWith(publishedCommit)), true);
});
