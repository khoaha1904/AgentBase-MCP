import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../core/hub/index.ts";
import type { GitHubPullRequest, GitRequest } from "../../providers/github-hub/index.ts";
import { publishPendingHubProposals, type PublishGitHub } from "./publish.ts";

function message(id: string, subject: string, source: string): string {
  return [
    `AgentBase-Proposal-ID: ${id}`,
    `AgentBase-Subject: ${subject}`,
    `AgentBase-Source-ID: ${source}`,
    `AgentBase-Evidence-Digest: sha256:${"d".repeat(64)}`,
    `AgentBase-Diff-Digest: sha256:${"e".repeat(64)}`,
    "AgentBase-Schema-Catalog: 2.0.0",
    "",
  ].join("\n");
}

function fixture() {
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hub-publish-"));
  const base = "a".repeat(40);
  const commits = ["b".repeat(40), "c".repeat(40), "d".repeat(40), "e".repeat(40)];
  const ids = ["1".repeat(24), "2".repeat(24), "3".repeat(24), "4".repeat(24)];
  const localHub = createLocalHubState({
    root: stateRoot,
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: base, activeHead: commits[3]!, catalogVersion: "2.0.0",
  });
  const commands: GitRequest[] = [];
  const branches = new Map<string, string>();
  const pulls: GitHubPullRequest[] = [];
  const git = async (request: GitRequest) => {
    commands.push(request);
    if (request.args[0] === "rev-list") return { stdout: `${commits.join("\n")}\n`, stderr: "" };
    if (request.args[0] === "show") {
      const index = commits.indexOf(String(request.args[3]));
      const source = index === 3 ? "r1" : `r${index}`;
      return { stdout: message(ids[index]!, `repositories/r${index}`, `repository-${source}-aaaaaaaaaaaa`), stderr: "" };
    }
    if (request.args[0] === "rev-parse") {
      const commit = String(request.args[2]).slice(0, 40);
      const index = commits.indexOf(commit);
      return { stdout: `${index === 0 ? base : commits[index - 1]}\n`, stderr: "" };
    }
    if (request.args[0] === "push") {
      const [head, ref] = String(request.args[2]).split(":refs/heads/");
      branches.set(ref!, head!);
    }
    return { stdout: "1 file changed\n", stderr: "" };
  };
  const github: PublishGitHub = {
    async getRepository() { return { fullName: "acme/AgentBase-Hub", defaultBranch: "main" }; },
    async getBranchRef(branch) {
      const commit = branch === "main" ? base : branches.get(branch);
      if (!commit) throw new Error("missing ref");
      return { branch, commit };
    },
    async findBranchRef(branch) { const commit = branches.get(branch); return commit ? { branch, commit } : undefined; },
    async listOpenPullRequests(branch) { return pulls.filter((pull) => pull.headBranch === branch); },
    async createPullRequest(headBranch, headCommit) {
      const pull = {
        number: 7,
        url: "https://github.com/acme/AgentBase-Hub/pull/7",
        headBranch,
        headCommit,
        headRepository: "acme/AgentBase-Hub",
        baseBranch: "main",
      };
      pulls.push(pull);
      return pull;
    },
  };
  return { stateRoot, base, commits, ids, localHub, commands, branches, pulls, git, github };
}

test("[AB-LOCAL-HUB-006][AB-LOCAL-HUB-007][SC-002] four proposals from three sources publish first three in one PR", async () => {
  const current = fixture();
  try {
    const receipt = await publishPendingHubProposals({
      stateRoot: current.stateRoot,
      localHub: current.localHub,
      selectedProposalIds: current.ids.slice(0, 3),
      token: "canary",
      git: current.git,
      github: current.github,
    });
    assert.deepEqual(receipt.commits, current.commits.slice(0, 3));
    assert.equal(receipt.headCommit, current.commits[2]);
    assert.equal(current.commands.filter((item) => item.args[0] === "push").length, 1);
    assert.equal(current.pulls.length, 1);
    assert.equal(current.localHub.activeHead, current.commits[3]);
    const retry = await publishPendingHubProposals({
      stateRoot: current.stateRoot,
      localHub: current.localHub,
      selectedProposalIds: current.ids.slice(0, 3),
      token: "canary",
      git: current.git,
      github: current.github,
    });
    assert.equal(retry.id, receipt.id);
    assert.equal(current.commands.filter((item) => item.args[0] === "push").length, 1);
    assert.equal(current.pulls.length, 1);
  } finally { fs.rmSync(current.stateRoot, { recursive: true, force: true }); }
});

test("[AB-LOCAL-HUB-006][AB-LOCAL-HUB-009] unsafe selection and remote drift stop before push", async () => {
  const unsafe = fixture();
  try {
    await assert.rejects(publishPendingHubProposals({
      stateRoot: unsafe.stateRoot, localHub: unsafe.localHub,
      selectedProposalIds: [unsafe.ids[1]!], token: "canary", git: unsafe.git, github: unsafe.github,
    }), /contiguous/);
    assert.equal(unsafe.commands.some((item) => item.args[0] === "push"), false);
  } finally { fs.rmSync(unsafe.stateRoot, { recursive: true, force: true }); }

  const drift = fixture();
  const github = { ...drift.github, async getBranchRef(branch: string) { return { branch, commit: "f".repeat(40) }; } };
  try {
    await assert.rejects(publishPendingHubProposals({
      stateRoot: drift.stateRoot, localHub: drift.localHub,
      selectedProposalIds: [drift.ids[0]!], token: "canary", git: drift.git, github,
    }), /drifted/);
    assert.equal(drift.commands.some((item) => item.args[0] === "push"), false);
  } finally { fs.rmSync(drift.stateRoot, { recursive: true, force: true }); }
});
