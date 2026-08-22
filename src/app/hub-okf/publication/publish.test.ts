import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState, HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import { GitHubHubApi, type GitRequest, type GitHubPullRequest } from "../../../providers/github-hub/index.ts";
import { publishPendingHubProposals, type PublishGitHub } from "./publish.ts";
import { synchronizeLocalHub } from "./synchronize.ts";

const SOURCE_ID = "repository-acme-aaaaaaaaaaaa";
const SOURCE_ID_B = "repository-beta-bbbbbbbbbbbb";
const IDS = ["1".repeat(24), "2".repeat(24), "3".repeat(24)];
const DIGESTS = ["a".repeat(64), "b".repeat(64), "c".repeat(64)];

function git(cwd: string, args: readonly string[], environment?: NodeJS.ProcessEnv): string {
  return execFileSync("/usr/bin/git", [...args], { cwd, encoding: "utf8", ...(environment ? { env: environment } : {}) }).trim();
}

function concept(revision: string, purpose: string, sourceId = SOURCE_ID, title = "Acme"): string {
  return `---\ntype: Repository\ntitle: ${title}\ndescription: ${title} repository\nstatus: draft\n`
    + `generated: { by: 'agentbase/0.0.0', at: '2026-08-22T00:00:00Z' }\n`
    + `sources:\n  - resource: repository://${sourceId}/README.md#L1-L1\n`
    + `relationships:\n  - { kind: part-of, target: domains/crawler, evidence: [source] }\n`
    + `agentbase:\n  repository:\n    id: ${sourceId}\n    display_name: ${title.toLowerCase()}\n`
    + `    aliases: { remotes: [], root_commits: [] }\n`
    + `    observed_source: { commit: ${revision}, dirty: false, dirty_digest: null, observed_at: '2026-08-22T00:00:00Z' }\n`
    + `---\n\n# Purpose\n\n${purpose}\n`;
}

function commitMessage(id: string, mode: "new" | "refresh", digest: string,
  sourceId = SOURCE_ID, subject = "repositories/acme"): string {
  return [
    `AgentBase OKF proposal ${id}`, "",
    `${HUB_PROPOSAL_TRAILERS.id}: ${id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: ${subject}`,
    `${HUB_PROPOSAL_TRAILERS.sourceId}: ${sourceId}`,
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: 7.0.0`,
    `${HUB_PROPOSAL_TRAILERS.mode}: ${mode}`,
  ].join("\n");
}

function retainedProposal(stateRoot: string, root: string, id: string, commit: string, digest: string,
  change: "created" | "modified", sourceId = SOURCE_ID, conceptPath = "repositories/acme.md"): void {
  const proposalRoot = path.join(stateRoot, "proposals", id), bundle = path.join(proposalRoot, "bundle");
  fs.mkdirSync(bundle, { recursive: true });
  fs.copyFileSync(path.join(root, "index.md"), path.join(bundle, "index.md"));
  fs.mkdirSync(path.dirname(path.join(bundle, conceptPath)), { recursive: true });
  fs.copyFileSync(path.join(root, conceptPath), path.join(bundle, conceptPath));
  fs.writeFileSync(path.join(proposalRoot, "accepted.json"), `${JSON.stringify({
    id, sourceRepositoryId: sourceId, diffDigest: `sha256:${digest}`, acceptedCommit: commit,
  })}\n`);
  fs.writeFileSync(path.join(proposalRoot, "inspection.json"), `${JSON.stringify({ groups: {
    added: change === "created" ? [{ path: conceptPath }] : [],
    updated: change === "modified" ? [{ path: conceptPath }] : [],
    removed: [], supersededOrRetracted: [],
    questionsAndLimitations: { questions: [], limitations: change === "modified" ? ["runtime verification remains pending"] : [] },
  } })}\n`);
}

test("[AB-PUBLISH-001..011] MCP creates independent, stacked and recoverable Hub PRs", async () => {
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
    fs.writeFileSync(path.join(hubRoot, "repositories/beta.md"),
      concept("e".repeat(40), "Independent knowledge.", SOURCE_ID_B, "Beta"));
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", commitMessage(IDS[2]!, "new", DIGESTS[2]!, SOURCE_ID_B, "repositories/beta")]);
    const betaCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    retainedProposal(stateRoot, hubRoot, IDS[2]!, betaCommit, DIGESTS[2]!, "created", SOURCE_ID_B, "repositories/beta.md");
    const localHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("agentbase/hub", "main"),
      remoteBase, activeHead: betaCommit, catalogVersion: "7.0.0" });
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
      async listPullRequestsForHead(head, state) {
        return pulls.filter((pull) => pull.headBranch === head && (state === "all" || pull.state === state));
      },
      async createPullRequest(headBranch, headCommit, title, body, baseBranch) {
        if (baseBranch === failBase) throw new Error("simulated PR failure");
        pullCalls.push({ title, body, base: baseBranch });
        const pull = { number: pulls.length + 1, url: `https://github.com/agentbase/hub/pull/${pulls.length + 1}`,
          headBranch, headCommit, headRepository: "agentbase/hub", baseBranch, state: "open" as const };
        pulls.push(pull); return pull;
      },
      async updatePullRequestBase(number, headBranch, headCommit, baseBranch) {
        const index = pulls.findIndex((pull) => pull.number === number);
        if (index < 0) throw new Error("missing pull request");
        const pull = { ...pulls[index]!, headBranch, headCommit, baseBranch };
        pulls[index] = pull;
        return pull;
      },
    };
    const gitRunner = async (request: GitRequest) => {
      if (request.args[0] === "push") pushes.push(request.args.at(-1)!);
      const args = request.args[0] === "push" ? ["push", remote, ...request.args.slice(2)] : [...request.args];
      const environment = request.commitTimestamp
        ? { ...process.env, GIT_AUTHOR_DATE: request.commitTimestamp, GIT_COMMITTER_DATE: request.commitTimestamp }
        : undefined;
      const stdout = git(request.cwd, args, environment);
      if (request.args[0] === "push") {
        const branch = request.args.at(-1)!.split(":refs/heads/")[1];
        if (branch) {
          const headCommit = ref(branch);
          for (let index = 0; index < pulls.length; index += 1) {
            if (pulls[index]!.headBranch === branch) pulls[index] = { ...pulls[index]!, headCommit };
          }
        }
      }
      return { stdout, stderr: "" };
    };
    const common = { stateRoot, localHub, token: "github_pat_secret_canary", github, git: gitRunner };
    const initInspection = path.join(stateRoot, "proposals", IDS[0]!, "inspection.json");
    fs.renameSync(initInspection, `${initInspection}.retained`);
    const batch = await publishPendingHubProposals({ ...common, selectedProposalIds: [IDS[0]!] });
    assert.equal(batch.mode, "independent"); assert.equal(batch.units[0]?.baseBranch, "main");
    assert.equal(batch.branch, batch.units[0]?.branch); assert.deepEqual(batch.pullRequest, batch.units[0]?.pullRequest);
    for (const heading of ["Purpose", "Scope", "Knowledge Changes", "Uncertainty", "Evidence and Validation", "Reviewer Action"]) {
      assert.match(pullCalls[0]!.body, new RegExp(`## ${heading}`));
    }
    assert.match(pullCalls[0]!.body, /retained inspection metadata unavailable/);
    assert.doesNotMatch(pullCalls[0]!.body, /github_pat_secret_canary|agentbase-publish-test-/);
    fs.renameSync(`${initInspection}.retained`, initInspection);
    failBase = `agentbase/okf-${IDS[0]}`;
    const stackIds = IDS.slice(0, 2);
    await assert.rejects(publishPendingHubProposals({ ...common, selectedProposalIds: stackIds }), /stopped after 1\/2 unit/);
    failBase = undefined;
    const stack = await publishPendingHubProposals({ ...common, selectedProposalIds: stackIds });
    assert.equal(stack.mode, "stack");
    assert.deepEqual(stack.units.map((unit) => unit.baseBranch), [
      "main", `agentbase/okf-${IDS[0]}`,
    ]);
    assert.equal(stack.units[0]?.headCommit, batch.headCommit);
    assert.equal(git(hubRoot, ["diff", "--format=", refreshCommit, stack.units[1]!.headCommit]), "");
    const pushCount = pushes.length, pullCount = pulls.length;
    const retry = await publishPendingHubProposals({ ...common, selectedProposalIds: stackIds });
    assert.deepEqual(retry, stack); assert.equal(pushes.length, pushCount); assert.equal(pulls.length, pullCount);
    const independent = await publishPendingHubProposals({ ...common, selectedProposalIds: [IDS[2]!] });
    assert.equal(independent.mode, "independent"); assert.equal(independent.units[0]?.baseBranch, "main");
    assert.equal(git(hubRoot, ["diff", "--name-only", remoteBase, independent.headCommit]), "repositories/beta.md");
    const forcedBatch = await publishPendingHubProposals({ ...common, selectedProposalIds: stackIds, publicationMode: "batch" });
    assert.equal(forcedBatch.mode, "batch"); assert.equal(forcedBatch.units.length, 1); assert.equal(forcedBatch.units[0]?.baseBranch, "main");
    git(remote, ["update-ref", "refs/heads/main", batch.headCommit, remoteBase]);
    const synchronization = await synchronizeLocalHub({ stateRoot, localHub, token: "github_pat_secret_canary", git: gitRunner });
    const synchronizedHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("agentbase/hub", "main"),
      remoteBase: batch.headCommit, activeHead: synchronization.activeHead, catalogVersion: "7.0.0" });
    const reconciled = await publishPendingHubProposals({ ...common, localHub: synchronizedHub, selectedProposalIds: [IDS[2]!] });
    assert.equal(reconciled.pullRequest.number, independent.pullRequest.number);
    assert.notEqual(reconciled.headCommit, independent.headCommit);
    assert.equal(git(hubRoot, ["merge-base", "--is-ancestor", batch.headCommit, reconciled.headCommit]), "");
    const conflictRoot = path.join(root, "conflicting-main");
    git(hubRoot, ["worktree", "add", "--detach", conflictRoot, batch.headCommit]);
    fs.mkdirSync(path.join(conflictRoot, "repositories"), { recursive: true });
    fs.writeFileSync(path.join(conflictRoot, "repositories/beta.md"), "conflicting published beta\n");
    git(conflictRoot, ["add", "--all"]); git(conflictRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", "conflicting published beta"]);
    const conflictingMain = git(conflictRoot, ["rev-parse", "HEAD"]);
    git(hubRoot, ["worktree", "remove", "--force", conflictRoot]);
    git(hubRoot, ["push", remote, `${conflictingMain}:refs/heads/main`]);
    git(hubRoot, ["fetch", "origin", "main"]);
    git(hubRoot, ["checkout", "--detach", synchronization.activeHead]);
    git(hubRoot, ["update-ref", "refs/heads/main", conflictingMain, synchronization.activeHead]);
    git(hubRoot, ["checkout", "main"]);
    fs.writeFileSync(path.join(hubRoot, "repositories/beta.md"),
      concept("e".repeat(40), "Independent knowledge.", SOURCE_ID_B, "Beta"));
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", commitMessage(IDS[2]!, "refresh", DIGESTS[2]!, SOURCE_ID_B, "repositories/beta")]);
    const conflictPending = git(hubRoot, ["rev-parse", "HEAD"]);
    const conflictHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("agentbase/hub", "main"),
      remoteBase: conflictingMain, activeHead: conflictPending, catalogVersion: "7.0.0" });
    const priorBranchHead = ref(`agentbase/okf-${IDS[2]}`);
    await assert.rejects(publishPendingHubProposals({ ...common, localHub: conflictHub,
      selectedProposalIds: [IDS[2]!] }), /stopped after 0\/1 unit/);
    assert.equal(ref(`agentbase/okf-${IDS[2]}`), priorBranchHead);
    assert.equal(ref("main"), conflictingMain);
    const requests: { url: string; method: string; body?: string }[] = [];
    const http: typeof fetch = async (input, init) => {
      const request = { url: String(input), method: init?.method ?? "GET", ...(typeof init?.body === "string" ? { body: init.body } : {}) };
      requests.push(request);
      const submitted = request.body ? JSON.parse(request.body) as { base: string; head: string } : undefined;
      const base = submitted?.base ?? new URL(request.url).searchParams.get("base") ?? "main";
      const head = submitted?.head ?? `agentbase/okf-${IDS[1]}`;
      return new Response(JSON.stringify(request.method === "GET" ? [{
        number: 98, html_url: "https://github.com/agentbase/hub/pull/98",
        head: { ref: head, sha: refreshCommit, repo: { full_name: "agentbase/hub" } }, base: { ref: base },
      }] : {
        number: 99, html_url: "https://github.com/agentbase/hub/pull/99",
        head: { ref: head, sha: refreshCommit, repo: { full_name: "agentbase/hub" } }, base: { ref: base },
      }), { status: 200, headers: { "content-type": "application/json" } });
    };
    const api = new GitHubHubApi(createHubIdentity("agentbase/hub", "main"), "canary", http);
    const explicitBase = `agentbase/okf-${IDS[0]}`;
    await api.listPullRequests(`agentbase/okf-${IDS[1]}`, explicitBase, "all");
    await api.createPullRequest(`agentbase/okf-${IDS[1]}`, refreshCommit, "title", "body", explicitBase);
    await api.listPullRequestsForHead(`agentbase/okf-${IDS[1]}`, "open");
    await api.updatePullRequestBase(99, `agentbase/okf-${IDS[1]}`, refreshCommit, "main");
    assert.equal(new URL(requests[0]!.url).searchParams.get("base"), explicitBase);
    assert.equal(new URL(requests[0]!.url).searchParams.get("state"), "all");
    assert.equal((JSON.parse(requests[1]!.body!) as { base: string }).base, explicitBase);
    assert.equal(new URL(requests[2]!.url).searchParams.has("base"), false);
    assert.equal(requests[3]!.method, "PATCH");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
