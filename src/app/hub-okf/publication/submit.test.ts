import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { createHubIdentity } from "../../../core/hub/index.ts";
import type { GitRequest, GitHubPullRequest } from "../../../providers/github-hub/index.ts";
import { prepareNewHubProposal } from "../authoring/prepare.ts";
import { readHubProposalState } from "../review/proposal-state.ts";
import { submitHubProposal, type SubmissionGitHub, type SubmitHubOptions } from "./submit.ts";

const BASE = "a".repeat(40), COMMIT = "b".repeat(40), EVIDENCE = `sha256:${"c".repeat(64)}`;

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-submit-test-"));
  const base = path.join(root, "base"), authored = path.join(root, "authored"), proposalRoot = path.join(root, "proposal");
  const checkoutRoot = path.join(root, "checkout");
  fs.mkdirSync(base); fs.mkdirSync(path.join(authored, "repositories", "acme"), { recursive: true });
  fs.mkdirSync(path.join(checkoutRoot, ".git"), { recursive: true });
  fs.writeFileSync(path.join(authored, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Acme](repositories/acme/) - repository\n");
  fs.writeFileSync(path.join(authored, "repositories/acme/index.md"), "# Acme\n\n* [Repository](repository.md) - identity\n");
  const concept = "---\ntype: Repository\ntitle: Acme\ndescription: Acme\nstatus: draft\n"
    + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
    + "sources:\n  - resource: repository://repository-acme-aaaaaaaaaaaa/README.md#L1-L2\n"
    + "---\n\n# Purpose\n\nAcme.\n";
  fs.writeFileSync(path.join(authored, "repositories/acme/repository.md"), concept);
  const prepared = prepareNewHubProposal({
    hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE,
    sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
    hubBundleRoot: base, authoredBundleRoot: authored, proposalRoot,
    subjectDirectory: "repositories/acme", evidenceDigest: EVIDENCE,
    signals: ["repository"], createdAt: "2026-08-12T00:00:00Z",
  });
  const commands: GitRequest[] = [], branches = new Map<string, string>(), pulls: GitHubPullRequest[] = [];
  let failPull = false;
  const git = async (request: GitRequest) => {
    commands.push(request);
    if (request.args[0] === "push") branches.set(prepared.proposal.branch, COMMIT);
    const stdout = request.args[0] === "rev-parse" ? `${COMMIT}\n`
      : request.args[0] === "remote" && request.args[1] === "get-url" ? `${prepared.proposal.hub.canonicalHttpsUrl}\n`
      : "";
    return { stdout, stderr: "" };
  };
  const github: SubmissionGitHub = {
    async getRepository() { return { fullName: "agentbase/hub", defaultBranch: "main" }; },
    async getBranchRef(branch) {
      const commit = branch === "main" ? BASE : branches.get(branch);
      if (!commit) throw new Error("missing ref");
      return { branch, commit };
    },
    async findBranchRef(branch) { const commit = branches.get(branch); return commit ? { branch, commit } : undefined; },
    async listOpenPullRequests() { return pulls; },
    async createPullRequest(headBranch, headCommit) {
      if (failPull) throw new Error("simulated PR failure");
      const pull = { number: 9, url: "https://github.com/agentbase/hub/pull/9", headBranch, headCommit, headRepository: "agentbase/hub", baseBranch: "main" };
      pulls.push(pull); return pull;
    },
  };
  const options: SubmitHubOptions = {
    configuredHub: prepared.proposal.hub, proposalRoot, checkoutRoot, token: "canary",
    expectedDiffDigest: prepared.proposal.diffDigest, git, github,
  };
  return {
    root, prepared, options, commands, branches, pulls,
    setFailPull(value: boolean) { failPull = value; },
    cleanup() { fs.rmSync(root, { recursive: true, force: true }); },
  };
}

test("[AB-HUB-009..011] submit commits reviewed bytes and pushes only deterministic branch without force", async () => {
  const current = fixture();
  try {
    const receipt = await submitHubProposal(current.options);
    assert.equal(receipt.commit, COMMIT);
    assert.equal(receipt.branch, current.prepared.proposal.branch);
    const commit = current.commands.find((request) => request.args.includes("commit"));
    assert.equal(commit?.commitTimestamp, "2026-08-12T00:00:00Z");
    assert.notEqual(commit?.commitTimestamp, "2000-01-01T00:00:00Z");
    const push = current.commands.find((request) => request.args[0] === "push");
    assert.deepEqual(push?.args, ["push", "origin", `${COMMIT}:refs/heads/${current.prepared.proposal.branch}`]);
    assert.equal(push?.args.some((value) => value.includes("--force")), false);
    assert.equal(current.commands.some((request) => request.args.some((value) => value.endsWith("refs/heads/main"))), false);
    assert.equal(readHubProposalState(current.options.proposalRoot).phase, "pr-opened");
  } finally { current.cleanup(); }
});

test("[AB-HUB-005][AB-HUB-009] submit rejects an invalid persisted creation timestamp before commit", async () => {
  const current = fixture();
  try {
    const metadataPath = path.join(current.options.proposalRoot, "proposal.json");
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8")) as { createdAt: string };
    metadata.createdAt = "not-a-timestamp";
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
    await assert.rejects(submitHubProposal(current.options), /creation timestamp/);
    assert.equal(current.commands.some((request) => request.args.includes("commit")), false);
  } finally { current.cleanup(); }
});

test("[AB-HUB-009][AB-HUB-014] drift and changed reviewed bytes fail before remote mutation", async () => {
  const changed = fixture();
  try {
    fs.appendFileSync(path.join(changed.options.proposalRoot, "bundle/index.md"), "changed\n");
    await assert.rejects(submitHubProposal(changed.options), /bytes changed/);
    assert.equal(changed.commands.length, 0);
  } finally { changed.cleanup(); }
  const drifted = fixture();
  try {
    const github = { ...drifted.options.github, getBranchRef: async (branch: string) => ({ branch, commit: "d".repeat(40) }) };
    await assert.rejects(submitHubProposal({ ...drifted.options, github }), /drifted/);
    assert.equal(drifted.commands.some((request) => request.args[0] === "push"), false);
  } finally { drifted.cleanup(); }
});

test("[AB-HUB-013] a conflicting existing proposal branch fails closed", async () => {
  const current = fixture();
  try {
    current.branches.set(current.prepared.proposal.branch, "e".repeat(40));
    await assert.rejects(submitHubProposal(current.options), /conflicting commit/);
    assert.equal(current.commands.some((request) => request.args[0] === "push"), false);
  } finally { current.cleanup(); }
});

test("[AB-HUB-009][AB-HUB-010] submit rejects changed origin and tampered branch identity", async () => {
  const remote = fixture();
  try {
    const git = async (request: GitRequest) => ({
      stdout: request.args[0] === "remote" ? "https://github.com/evil/hub.git\n" : "",
      stderr: "",
    });
    await assert.rejects(submitHubProposal({ ...remote.options, git }), /remote/);
    assert.equal(remote.commands.some((request) => request.args[0] === "push"), false);
  } finally { remote.cleanup(); }
  const branch = fixture();
  try {
    const statePath = path.join(branch.options.proposalRoot, "hub-proposal.json");
    const state = JSON.parse(fs.readFileSync(statePath, "utf8")) as { branch: string };
    state.branch = "main";
    fs.writeFileSync(statePath, JSON.stringify(state));
    await assert.rejects(submitHubProposal(branch.options), /branch identity/);
    assert.equal(branch.commands.length, 0);
  } finally { branch.cleanup(); }
});

test("[AB-HUB-014] cancellation before publication preserves prepared state and performs no Git action", async () => {
  const current = fixture();
  try {
    const controller = new AbortController(); controller.abort();
    await assert.rejects(submitHubProposal({ ...current.options, signal: controller.signal }), /cancelled/);
    assert.equal(readHubProposalState(current.options.proposalRoot).phase, "prepared");
    assert.equal(current.commands.length, 0);
  } finally { current.cleanup(); }
});
