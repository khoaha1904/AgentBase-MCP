import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState, HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import { GitHubHubApi, type GitRequest, type GitHubPullRequest } from "../../../providers/github-hub/index.ts";
import { publishPendingHubProposals, type PublishGitHub } from "./publish.ts";

const SOURCE_ID = "repository-acme-aaaaaaaaaaaa";
const IDS = ["1".repeat(24), "2".repeat(24)];
const DIGESTS = ["a".repeat(64), "b".repeat(64)];

function git(cwd: string, args: readonly string[]): string {
  return execFileSync("/usr/bin/git", [...args], { cwd, encoding: "utf8" }).trim();
}

function concept(revision: string, purpose: string): string {
  return `---\ntype: Repository\ntitle: Acme\ndescription: Acme repository\nstatus: draft\n`
    + `generated: { by: 'agentbase/0.0.0', at: '2026-08-22T00:00:00Z' }\n`
    + `sources:\n  - resource: repository://${SOURCE_ID}/README.md#L1-L1\n`
    + `relationships:\n  - { kind: part-of, target: domains/crawler, evidence: [source] }\n`
    + `agentbase:\n  repository:\n    id: ${SOURCE_ID}\n    display_name: acme\n`
    + `    aliases: { remotes: [], root_commits: [] }\n`
    + `    observed_source: { commit: ${revision}, dirty: false, dirty_digest: null, observed_at: '2026-08-22T00:00:00Z' }\n`
    + `---\n\n# Purpose\n\n${purpose}\n`;
}

function commitMessage(id: string, mode: "new" | "refresh", digest: string): string {
  return [
    `AgentBase OKF proposal ${id}`, "",
    `${HUB_PROPOSAL_TRAILERS.id}: ${id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: repositories/acme`,
    `${HUB_PROPOSAL_TRAILERS.sourceId}: ${SOURCE_ID}`,
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: 7.0.0`,
    `${HUB_PROPOSAL_TRAILERS.mode}: ${mode}`,
  ].join("\n");
}

function retainedProposal(stateRoot: string, root: string, id: string, commit: string, digest: string, change: "created" | "modified"): void {
  const proposalRoot = path.join(stateRoot, "proposals", id), bundle = path.join(proposalRoot, "bundle");
  fs.mkdirSync(bundle, { recursive: true });
  fs.copyFileSync(path.join(root, "index.md"), path.join(bundle, "index.md"));
  fs.mkdirSync(path.join(bundle, "repositories"));
  fs.copyFileSync(path.join(root, "repositories/acme.md"), path.join(bundle, "repositories/acme.md"));
  fs.writeFileSync(path.join(proposalRoot, "accepted.json"), `${JSON.stringify({
    id, sourceRepositoryId: SOURCE_ID, diffDigest: `sha256:${digest}`, acceptedCommit: commit,
  })}\n`);
  fs.writeFileSync(path.join(proposalRoot, "inspection.json"), `${JSON.stringify({ groups: {
    added: change === "created" ? [{ path: "repositories/acme.md" }] : [],
    updated: change === "modified" ? [{ path: "repositories/acme.md" }] : [],
    removed: [], supersededOrRetracted: [],
    questionsAndLimitations: { questions: [], limitations: change === "modified" ? ["runtime verification remains pending"] : [] },
  } })}\n`);
}

test("[AB-PUBLISH-001..010] MCP creates bounded batch and recoverable Init/Refresh PRs", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-publish-test-"));
  const remote = path.join(root, "hub.git"), hubRoot = path.join(root, "hub"), stateRoot = path.join(root, "state");
  try {
    fs.mkdirSync(hubRoot); git(root, ["init", "--bare", "--initial-branch=main", remote]); git(hubRoot, ["init", "-b", "main"]);
    fs.writeFileSync(path.join(hubRoot, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    git(hubRoot, ["add", "index.md"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", "base"]);
    git(hubRoot, ["remote", "add", "origin", remote]); git(hubRoot, ["push", "origin", "main"]);
    const remoteBase = git(hubRoot, ["rev-parse", "HEAD"]), sourceRevisions = ["c".repeat(40), "d".repeat(40)];
    fs.mkdirSync(path.join(hubRoot, "repositories"));
    fs.writeFileSync(path.join(hubRoot, "repositories/acme.md"), concept(sourceRevisions[0]!, "Initial knowledge."));
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", commitMessage(IDS[0]!, "new", DIGESTS[0]!)]);
    const initCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    retainedProposal(stateRoot, hubRoot, IDS[0]!, initCommit, DIGESTS[0]!, "created");
    fs.writeFileSync(path.join(hubRoot, "repositories/acme.md"), concept(sourceRevisions[1]!, "Refreshed knowledge."));
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", commitMessage(IDS[1]!, "refresh", DIGESTS[1]!)]);
    const refreshCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    retainedProposal(stateRoot, hubRoot, IDS[1]!, refreshCommit, DIGESTS[1]!, "modified");
    const localHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("agentbase/hub", "main"),
      remoteBase, activeHead: refreshCommit, catalogVersion: "7.0.0" });
    const pushes: string[] = [], pullCalls: { title: string; body: string; base: string }[] = [];
    const pulls: (GitHubPullRequest & { state: "open" | "closed" })[] = [];
    let failBase: string | undefined;
    const ref = (branch: string) => {
      const result = execFileSync("/usr/bin/git", ["show-ref", "--verify", "--hash", `refs/heads/${branch}`], {
        cwd: remote, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
      });
      return result.trim();
    };
    const optionalRef = (branch: string) => {
      try { return ref(branch); } catch { return undefined; }
    };
    const github: PublishGitHub = {
      async getRepository() { return { fullName: "agentbase/hub", defaultBranch: "main" }; },
      async getBranchRef(branch) { const commit = optionalRef(branch); if (!commit) throw new Error("missing ref"); return { branch, commit }; },
      async findBranchRef(branch) { const commit = optionalRef(branch); return commit ? { branch, commit } : undefined; },
      async listPullRequests(head, base, state) {
        return pulls.filter((pull) => pull.headBranch === head && pull.baseBranch === base && (state === "all" || pull.state === state));
      },
      async createPullRequest(headBranch, headCommit, title, body, baseBranch) {
        if (baseBranch === failBase) throw new Error("simulated PR failure");
        pullCalls.push({ title, body, base: baseBranch });
        const pull = { number: pulls.length + 1, url: `https://github.com/agentbase/hub/pull/${pulls.length + 1}`,
          headBranch, headCommit, headRepository: "agentbase/hub", baseBranch, state: "open" as const };
        pulls.push(pull); return pull;
      },
    };
    const gitRunner = async (request: GitRequest) => {
      if (request.args[0] === "push") pushes.push(request.args.at(-1)!);
      const args = request.args[0] === "push" ? ["push", remote, ...request.args.slice(2)] : [...request.args];
      return { stdout: git(hubRoot, args), stderr: "" };
    };
    const common = { stateRoot, localHub, token: "github_pat_secret_canary", github, git: gitRunner };
    const initInspection = path.join(stateRoot, "proposals", IDS[0]!, "inspection.json");
    fs.renameSync(initInspection, `${initInspection}.retained`);
    const batch = await publishPendingHubProposals({ ...common, selectedProposalIds: [IDS[0]!] });
    assert.equal(batch.mode, "batch"); assert.equal(batch.units[0]?.baseBranch, "main");
    assert.equal(batch.branch, batch.units[0]?.branch); assert.deepEqual(batch.pullRequest, batch.units[0]?.pullRequest);
    for (const heading of ["Purpose", "Scope", "Knowledge Changes", "Uncertainty", "Evidence and Validation", "Reviewer Action"]) {
      assert.match(pullCalls[0]!.body, new RegExp(`## ${heading}`));
    }
    assert.match(pullCalls[0]!.body, /retained inspection metadata unavailable/);
    assert.doesNotMatch(pullCalls[0]!.body, /github_pat_secret_canary|agentbase-publish-test-/);
    fs.renameSync(`${initInspection}.retained`, initInspection);
    failBase = `agentbase/okf-${IDS[0]}`;
    await assert.rejects(publishPendingHubProposals({ ...common, selectedProposalIds: IDS }), /stopped after 1\/2 unit/);
    failBase = undefined;
    const stack = await publishPendingHubProposals({ ...common, selectedProposalIds: IDS });
    assert.equal(stack.mode, "stack");
    assert.deepEqual(stack.units.map((unit) => [unit.baseBranch, unit.headCommit]), [
      ["main", initCommit], [`agentbase/okf-${IDS[0]}`, refreshCommit],
    ]);
    const pushCount = pushes.length, pullCount = pulls.length;
    const retry = await publishPendingHubProposals({ ...common, selectedProposalIds: IDS });
    assert.deepEqual(retry, stack); assert.equal(pushes.length, pushCount); assert.equal(pulls.length, pullCount);
    const forcedBatch = await publishPendingHubProposals({ ...common, selectedProposalIds: IDS, publicationMode: "batch" });
    assert.equal(forcedBatch.mode, "batch"); assert.equal(forcedBatch.units.length, 1); assert.equal(forcedBatch.units[0]?.baseBranch, "main");
    assert.equal(ref("main"), remoteBase);
    const requests: { url: string; method: string; body?: string }[] = [];
    const http: typeof fetch = async (input, init) => {
      const request = { url: String(input), method: init?.method ?? "GET", ...(typeof init?.body === "string" ? { body: init.body } : {}) };
      requests.push(request);
      const submitted = request.body ? JSON.parse(request.body) as { base: string; head: string } : undefined;
      const base = submitted?.base ?? new URL(request.url).searchParams.get("base") ?? "main";
      const head = submitted?.head ?? `agentbase/okf-${IDS[1]}`;
      return new Response(JSON.stringify(request.method === "POST" ? {
        number: 99, html_url: "https://github.com/agentbase/hub/pull/99",
        head: { ref: head, sha: refreshCommit, repo: { full_name: "agentbase/hub" } }, base: { ref: base },
      } : [{
        number: 98, html_url: "https://github.com/agentbase/hub/pull/98",
        head: { ref: head, sha: refreshCommit, repo: { full_name: "agentbase/hub" } }, base: { ref: base },
      }]), { status: 200, headers: { "content-type": "application/json" } });
    };
    const api = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), "canary", http);
    const explicitBase = `agentbase/okf-${IDS[0]}`;
    await api.listPullRequests(`agentbase/okf-${IDS[1]}`, explicitBase, "all");
    await api.createPullRequest(`agentbase/okf-${IDS[1]}`, refreshCommit, "title", "body", explicitBase);
    assert.equal(new URL(requests[0]!.url).searchParams.get("base"), explicitBase);
    assert.equal(new URL(requests[0]!.url).searchParams.get("state"), "all");
    assert.equal((JSON.parse(requests[1]!.body!) as { base: string }).base, explicitBase);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
