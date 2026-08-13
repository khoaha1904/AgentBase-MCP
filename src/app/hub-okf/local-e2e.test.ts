import assert from "node:assert/strict";
import { execFile, execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import type { GitRequest } from "../../providers/github-hub/index.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { submitHubProposal, type SubmissionGitHub } from "./submit.ts";

const execute = promisify(execFile);
const EVIDENCE = `sha256:${"f".repeat(64)}`;

function git(cwd: string, args: readonly string[]): string {
  return execFileSync("/usr/bin/git", [...args], { cwd, encoding: "utf8" }).trim();
}

test("[AB-HUB-003][AB-HUB-009..015] local Git E2E publishes one non-target branch and recovers one PR", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-hub-e2e-"));
  const remote = path.join(root, "hub.git"), seed = path.join(root, "seed"), checkout = path.join(root, "checkout");
  const baseBundle = path.join(root, "base-bundle"), authored = path.join(root, "authored"), proposalRoot = path.join(root, "proposal");
  try {
    fs.mkdirSync(seed); git(root, ["init", "--bare", "--initial-branch=main", remote]); git(seed, ["init", "-b", "main"]);
    fs.writeFileSync(path.join(seed, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    git(seed, ["add", "index.md"]);
    git(seed, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", "base"]);
    git(seed, ["remote", "add", "origin", remote]); git(seed, ["push", "origin", "main"]);
    const baseCommit = git(seed, ["rev-parse", "HEAD"]);
    git(root, ["clone", "--branch", "main", remote, checkout]);
    fs.mkdirSync(baseBundle);
    fs.copyFileSync(path.join(seed, "index.md"), path.join(baseBundle, "index.md"));
    fs.cpSync(baseBundle, authored, { recursive: true });
    fs.mkdirSync(path.join(authored, "repositories/acme"), { recursive: true });
    fs.writeFileSync(path.join(authored, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Acme](repositories/acme/) - repository\n");
    fs.writeFileSync(path.join(authored, "repositories/acme/index.md"), "# Acme\n\n* [Repository](repository.md) - identity\n");
    const concept = "---\ntype: Repository\ntitle: Acme\ndescription: Acme repository\nstatus: draft\n"
      + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
      + "sources:\n  - resource: repository://repository-acme-aaaaaaaaaaaa/README.md#L1-L1\n"
      + "---\n\n# Purpose\n\nAcme.\n";
    fs.writeFileSync(path.join(authored, "repositories/acme/repository.md"), concept);
    const prepared = prepareNewHubProposal({
      hub: createHubIdentity("agentbase/hub", "main"), baseCommit,
      sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
      hubBundleRoot: baseBundle, authoredBundleRoot: authored, proposalRoot,
      subjectDirectory: "repositories/acme", evidenceDigest: EVIDENCE,
      signals: ["repository"], createdAt: "2026-08-12T00:00:00Z",
    });
    const beforeTarget = git(remote, ["rev-parse", "refs/heads/main"]);
    const gitRunner = async (request: GitRequest) => {
      if (request.args[0] === "remote" && request.args[1] === "get-url") {
        return { stdout: `${prepared.proposal.hub.canonicalHttpsUrl}\n`, stderr: "" };
      }
      const environment = {
        ...process.env,
        ...(request.commitTimestamp ? {
          GIT_AUTHOR_DATE: request.commitTimestamp,
          GIT_COMMITTER_DATE: request.commitTimestamp,
        } : {}),
      };
      const args = request.args[0] === "push" && request.args[1] === "origin"
        ? ["push", remote, ...request.args.slice(2)]
        : [...request.args];
      const result = await execute("/usr/bin/git", args, { cwd: request.cwd, env: environment });
      return { stdout: result.stdout, stderr: result.stderr };
    };
    let pullCount = 0;
    const ref = (branch: string) => {
      const result = spawnSync("/usr/bin/git", ["show-ref", "--verify", "--hash", `refs/heads/${branch}`], {
        cwd: remote,
        encoding: "utf8",
      });
      return result.status === 0 ? result.stdout.trim() : undefined;
    };
    const github: SubmissionGitHub = {
      async getRepository() { return { fullName: "agentbase/hub", defaultBranch: "main" }; },
      async getBranchRef(branch) { const commit = ref(branch); if (!commit) throw new Error("missing ref"); return { branch, commit }; },
      async findBranchRef(branch) { const commit = ref(branch); return commit ? { branch, commit } : undefined; },
      async listOpenPullRequests() { return []; },
      async createPullRequest(headBranch, headCommit) {
        pullCount += 1;
        return { number: 1, url: "https://github.com/agentbase/hub/pull/1", headBranch, headCommit, headRepository: "agentbase/hub", baseBranch: "main" };
      },
    };
    const receipt = await submitHubProposal({
      configuredHub: prepared.proposal.hub, proposalRoot, checkoutRoot: checkout,
      token: "local-canary", expectedDiffDigest: prepared.proposal.diffDigest,
      git: gitRunner, github,
    });
    assert.equal(git(remote, ["rev-parse", "refs/heads/main"]), beforeTarget);
    assert.equal(ref(prepared.proposal.branch), receipt.commit);
    const commitDates = git(remote, ["show", "-s", "--format=%aI%n%cI", receipt.commit]).split("\n");
    assert.deepEqual(commitDates.map((value) => new Date(value).toISOString()), [
      "2026-08-12T00:00:00.000Z",
      "2026-08-12T00:00:00.000Z",
    ]);
    assert.equal(pullCount, 1);
    assert.deepEqual(git(remote, ["for-each-ref", "--format=%(refname)", "refs/heads"]).split("\n").sort(), [
      `refs/heads/${prepared.proposal.branch}`, "refs/heads/main",
    ].sort());
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
