import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../core/hub/index.ts";
import { runGit } from "../../providers/github-hub/index.ts";
import { acceptHubProposal } from "./accept.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { searchActiveHub } from "./query.ts";

async function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-accept-"));
  const hubRoot = path.join(root, "AgentBase-Hub");
  const baseRoot = path.join(root, "base");
  const authored = path.join(root, "authored");
  const proposalRoot = path.join(root, "proposal");
  const stateRoot = path.join(root, "state");
  fs.mkdirSync(hubRoot);
  await runGit({ args: ["init", "-b", "main"], cwd: hubRoot, operation: "init Hub" });
  await runGit({ args: ["config", "user.name", "AgentBase Test"], cwd: hubRoot, operation: "configure name" });
  await runGit({ args: ["config", "user.email", "test@agentbase.local"], cwd: hubRoot, operation: "configure email" });
  await runGit({ args: ["remote", "add", "origin", "https://github.com/acme/AgentBase-Hub.git"], cwd: hubRoot, operation: "configure origin" });
  fs.writeFileSync(path.join(hubRoot, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
  await runGit({ args: ["add", "index.md"], cwd: hubRoot, operation: "stage base" });
  await runGit({ args: ["commit", "-m", "Hub base"], cwd: hubRoot, operation: "commit base", commitTimestamp: "2026-08-12T00:00:00Z" });
  const base = (await runGit({ args: ["rev-parse", "HEAD"], cwd: hubRoot, operation: "resolve base" })).stdout.trim();
  fs.mkdirSync(baseRoot);
  fs.copyFileSync(path.join(hubRoot, "index.md"), path.join(baseRoot, "index.md"));
  fs.mkdirSync(authored);
  fs.copyFileSync(path.join(hubRoot, "index.md"), path.join(authored, "index.md"));
  fs.mkdirSync(path.join(authored, "repositories", "orders"), { recursive: true });
  fs.writeFileSync(path.join(authored, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Orders](repositories/orders/)\n");
  fs.writeFileSync(path.join(authored, "repositories/orders/index.md"), "# Orders\n\n* [Repository](repository.md)\n");
  fs.writeFileSync(path.join(authored, "repositories/orders/repository.md"), [
    "---", "type: Repository", "title: Orders", "description: Orders repository", "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:01:00Z' }", "sources:",
    "  - resource: repository://repository-orders-aaaaaaaaaaaa/README.md#L1-L1", "---", "", "# Purpose", "", "Orders.", "",
  ].join("\n"));
  const prepared = prepareNewHubProposal({
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    baseCommit: base,
    sourceRepositoryId: "repository-orders-aaaaaaaaaaaa",
    hubBundleRoot: baseRoot,
    authoredBundleRoot: authored,
    proposalRoot,
    subjectDirectory: "repositories/orders",
    evidenceDigest: `sha256:${"e".repeat(64)}`,
    signals: ["repository", "admitted repository identity"],
    createdAt: "2026-08-12T00:01:00Z",
  });
  const localHub = createLocalHubState({
    root: hubRoot,
    hub: prepared.proposal.hub,
    remoteBase: base,
    activeHead: base,
    catalogVersion: "2.0.0",
  });
  return { root, hubRoot, proposalRoot, stateRoot, base, prepared, localHub };
}

test("[AB-LOCAL-HUB-002][AB-LOCAL-HUB-003] accept advances local main once with exact reviewed trailers and no network", async () => {
  const current = await fixture();
  try {
    const accepted = await acceptHubProposal({
      stateRoot: current.stateRoot,
      localHub: current.localHub,
      proposalRoot: current.proposalRoot,
      expectedDiffDigest: current.prepared.proposal.diffDigest,
    });
    assert.equal(accepted.parentCommit, current.base);
    const count = await runGit({ args: ["rev-list", "--count", `${current.base}..main`], cwd: current.hubRoot, operation: "count accepted commits" });
    assert.equal(count.stdout.trim(), "1");
    const message = await runGit({ args: ["show", "-s", "--format=%B", "main"], cwd: current.hubRoot, operation: "read accepted trailers" });
    assert.match(message.stdout, new RegExp(`AgentBase-Proposal-ID: ${accepted.id}`));
    assert.match(message.stdout, /AgentBase-Subject: repositories\/orders/);
    assert.equal(fs.existsSync(path.join(current.proposalRoot, "accepted.json")), true);
    const matches = await searchActiveHub(
      { ...current.localHub, activeHead: accepted.acceptedCommit },
      "Orders repository",
    );
    assert.equal(matches[0]?.commit, accepted.acceptedCommit);
    assert.equal(matches[0]?.path, "repositories/orders/repository.md");
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-LOCAL-HUB-002][AB-LOCAL-HUB-009] changed reviewed bytes fail before local main mutation", async () => {
  const current = await fixture();
  try {
    fs.appendFileSync(path.join(current.proposalRoot, "bundle", "index.md"), "\nchanged\n");
    await assert.rejects(acceptHubProposal({
      stateRoot: current.stateRoot,
      localHub: current.localHub,
      proposalRoot: current.proposalRoot,
      expectedDiffDigest: current.prepared.proposal.diffDigest,
    }), /changed/);
    const head = await runGit({ args: ["rev-parse", "main"], cwd: current.hubRoot, operation: "resolve unchanged main" });
    assert.equal(head.stdout.trim(), current.base);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});
