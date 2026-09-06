import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalHubState, HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import { GitHubHubApi, type GitRequest, type GitHubPullRequest } from "../../../providers/github-hub/index.ts";
import { publishPendingHubProposals, type PublishGitHub } from "./test-support.ts";
import { synchronizeLocalHub } from "./synchronize.ts";
import { recoverSynchronizationTransaction } from "./recovery.ts";
import {
  initializeHub, previewHubInitialization,
} from "../ci/upgrade.ts";
import { renderHubCiBundle } from "../ci/artifact.ts";
import { HUB_CI_WORKFLOW_PATH } from "../ci/workflow.ts";
import { HUB_README_PATH, renderHubReadme } from "../workspace/readme.ts";

const SOURCE_ID = "repository-acme-aaaaaaaaaaaa";
const SOURCE_ID_B = "repository-beta-bbbbbbbbbbbb";
const IDS = ["1".repeat(24), "2".repeat(24), "3".repeat(24), "4".repeat(24), "5".repeat(24)];
const DIGESTS = ["a".repeat(64), "b".repeat(64), "c".repeat(64), "d".repeat(64), "e".repeat(64)];

function git(cwd: string, args: readonly string[], environment?: NodeJS.ProcessEnv, input?: string): string {
  return execFileSync("/usr/bin/git", [...args], { cwd, encoding: "utf8", ...(environment ? { env: environment } : {}),
    ...(input === undefined ? {} : { input }) }).trim();
}

function concept(revision: string, purpose: string, sourceId = SOURCE_ID, title = "Acme"): string {
  return `---\ntype: Repository\ntitle: ${title}\ndescription: ${title} repository\nstatus: draft\n`
    + `generated: { by: 'agentbase/0.0.0', at: '2026-08-22T00:00:00Z' }\n`
    + `sources:\n  - id: source\n    resource: repository://${sourceId}/README.md#L1-L1\n`
    + `relationships:\n  - { kind: part-of, target: domains/crawler, evidence: [source] }\n`
    + `agentbase:\n  repository:\n    id: ${sourceId}\n    display_name: ${title.toLowerCase()}\n`
    + `    aliases: { remotes: [], root_commits: [] }\n`
    + `    observed_source: { commit: ${revision}, dirty: false, dirty_digest: null, observed_at: '2026-08-22T00:00:00Z' }\n`
    + `---\n\n# Purpose\n\n${purpose}\n\n[Domain](../domains/crawler.md)\n`;
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

function enrichmentCommitMessage(id: string, digest: string): string {
  return [
    `AgentBase OKF proposal ${id}`, "", `${HUB_PROPOSAL_TRAILERS.id}: ${id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: domains/crawler`,
    `${HUB_PROPOSAL_TRAILERS.domainId}: domains/crawler`,
    `${HUB_PROPOSAL_TRAILERS.sourceIds}: ${SOURCE_ID},${SOURCE_ID_B}`,
    `${HUB_PROPOSAL_TRAILERS.manifestDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: sha256:${digest}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: 7.0.0`,
    `${HUB_PROPOSAL_TRAILERS.mode}: enrichment`,
  ].join("\n");
}

function batchCommitMessage(id: string, digest: string): string {
  return enrichmentCommitMessage(id, digest)
    .replaceAll("domains/crawler", "domains/batch")
    .replace("AgentBase-Proposal-Mode: enrichment", "AgentBase-Proposal-Mode: batch-new");
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
    removed: [],
    questionsAndLimitations: { questions: [], limitations: change === "modified" ? ["runtime verification remains pending"] : [] },
  } })}\n`);
}

test("[AB-PUBLISH-001..011][AB-HUB-CI-008..010][AB-HUB-SETUP-018..021][AB-CONCURRENCY-008..010][AB-CONCURRENCY-012][AB-IMPACT-011] MCP creates independent, stacked and recoverable Hub PRs", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-publish-test-"));
  const remote = path.join(root, "hub.git"), hubRoot = path.join(root, "hub"), stateRoot = path.join(root, "state");
  try {
    fs.mkdirSync(hubRoot); git(root, ["init", "--bare", "--initial-branch=main", remote]); git(hubRoot, ["init", "-b", "main"]);
    fs.writeFileSync(path.join(hubRoot, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    for (const [relative, bytes] of Object.entries(renderHubCiBundle().files)) {
      const target = path.join(hubRoot, ...relative.split("/")); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, bytes);
    }
    git(hubRoot, ["add", "index.md", ...Object.keys(renderHubCiBundle().files)]);
    git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", "base"]);
    git(hubRoot, ["remote", "add", "origin", remote]); git(hubRoot, ["push", "origin", "main"]);
    const remoteBase = git(hubRoot, ["rev-parse", "HEAD"]), sourceRevisions = ["c".repeat(40), "d".repeat(40)];
    fs.mkdirSync(path.join(hubRoot, "repositories"));
    fs.writeFileSync(path.join(hubRoot, "repositories/acme.md"), concept(sourceRevisions[0]!, "Initial knowledge."));
    fs.writeFileSync(path.join(hubRoot, "repositories/index.md"), "# Repositories\n\n* [Acme](acme.md) - Repository\n");
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", commitMessage(IDS[0]!, "new", DIGESTS[0]!)]);
    const initCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    retainedProposal(stateRoot, hubRoot, IDS[0]!, initCommit, DIGESTS[0]!, "created");
    fs.writeFileSync(path.join(hubRoot, "repositories/acme.md"), concept(sourceRevisions[1]!, "Refreshed knowledge."));
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", commitMessage(IDS[1]!, "refresh", DIGESTS[1]!)]);
    const refreshCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    retainedProposal(stateRoot, hubRoot, IDS[1]!, refreshCommit, DIGESTS[1]!, "modified");
    fs.writeFileSync(path.join(hubRoot, "repositories/beta.md"),
      concept("e".repeat(40), "Independent knowledge.", SOURCE_ID_B, "Beta"));
    fs.appendFileSync(path.join(hubRoot, "repositories/index.md"), "\n* [Beta](beta.md) - Repository\n");
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", commitMessage(IDS[2]!, "new", DIGESTS[2]!, SOURCE_ID_B, "repositories/beta")]);
    const betaCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    retainedProposal(stateRoot, hubRoot, IDS[2]!, betaCommit, DIGESTS[2]!, "created", SOURCE_ID_B, "repositories/beta.md");
    fs.mkdirSync(path.join(hubRoot, "domains"));
    fs.writeFileSync(path.join(hubRoot, "domains/crawler.md"), `---\ntype: Domain\ntitle: Crawler\ndescription: Crawler Domain\nstatus: draft\ngenerated: { by: 'agentbase/0.0.0', at: '2026-08-22T00:00:00Z' }\nsources:\n  - resource: repository://${SOURCE_ID}/README.md#L1-L1\n---\n\n# Purpose\n\nCrawler.\n`);
    fs.writeFileSync(path.join(hubRoot, "domains/index.md"), "# Domains\n\n* [Crawler](crawler.md) - Domain\n");
    fs.appendFileSync(path.join(hubRoot, "index.md"), "\n* [Domains](domains/index.md) - business domains\n");
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", enrichmentCommitMessage(IDS[3]!, DIGESTS[3]!) ]);
    const enrichmentCommit = git(hubRoot, ["rev-parse", "HEAD"]), enrichmentRoot = path.join(stateRoot, "proposals", IDS[3]!);
    fs.mkdirSync(path.join(enrichmentRoot, "bundle", "domains"), { recursive: true });
    fs.copyFileSync(path.join(hubRoot, "index.md"), path.join(enrichmentRoot, "bundle", "index.md"));
    fs.copyFileSync(path.join(hubRoot, "domains/crawler.md"), path.join(enrichmentRoot, "bundle", "domains/crawler.md"));
    fs.writeFileSync(path.join(enrichmentRoot, "accepted.json"), `${JSON.stringify({ id: IDS[3], mode: "enrichment",
      domainId: "domains/crawler", sourceRepositoryIds: [SOURCE_ID, SOURCE_ID_B], diffDigest: `sha256:${DIGESTS[3]}`,
      acceptedCommit: enrichmentCommit })}\n`);
    fs.writeFileSync(path.join(enrichmentRoot, "inspection.json"), `${JSON.stringify({ groups: { added: [{ path: "domains/crawler.md" }],
      updated: [], removed: [], questionsAndLimitations: { questions: [], limitations: [] } } })}\n`);
    fs.writeFileSync(path.join(enrichmentRoot, "enrichment-summary.json"), `${JSON.stringify({
      manifestDigest: `sha256:${DIGESTS[3]}`, providerScope: { accountId: "123456789012", regions: ["ap-southeast-1"] },
      profileVersions: { "aws.sts.caller-identity": 1, "aws.sqs.queue": 1 },
      candidates: [{ id: "candidate-111111111111111111111111", question: { id: "question-111111111111111111111111", revision: 1 } }],
    })}\n`);
    fs.writeFileSync(path.join(hubRoot, "domains/batch.md"), `---\ntype: Domain\ntitle: Batch\ndescription: Batch Domain\nstatus: draft\ngenerated: { by: 'agentbase/0.0.0', at: '2026-08-22T00:00:00Z' }\nsources:\n  - resource: repository://${SOURCE_ID}/README.md#L1-L1\n---\n\n# Purpose\n\nBatch.\n`);
    git(hubRoot, ["add", "domains/batch.md"]); git(hubRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", batchCommitMessage(IDS[4]!, DIGESTS[4]!) ]);
    const batchCommit = git(hubRoot, ["rev-parse", "HEAD"]), batchRoot = path.join(stateRoot, "proposals", IDS[4]!);
    fs.mkdirSync(path.join(batchRoot, "bundle", "domains"), { recursive: true });
    fs.copyFileSync(path.join(hubRoot, "index.md"), path.join(batchRoot, "bundle", "index.md"));
    fs.copyFileSync(path.join(hubRoot, "domains/batch.md"), path.join(batchRoot, "bundle", "domains/batch.md"));
    fs.writeFileSync(path.join(batchRoot, "accepted.json"), `${JSON.stringify({ id: IDS[4], mode: "batch-new",
      domainId: "domains/batch", sourceRepositoryIds: [SOURCE_ID, SOURCE_ID_B], diffDigest: `sha256:${DIGESTS[4]}`,
      acceptedCommit: batchCommit })}\n`);
    fs.writeFileSync(path.join(batchRoot, "inspection.json"), `${JSON.stringify({ groups: { added: [],
      updated: [{ path: "domains/batch.md" }], removed: [],
      questionsAndLimitations: { questions: [], limitations: [] } }, batch: {
        members: [{ repositoryId: SOURCE_ID, paths: ["repositories/acme.md"] },
          { repositoryId: SOURCE_ID_B, paths: ["repositories/beta.md"] }], sharedPaths: ["domains/batch.md"],
      } })}\n`);
    const localHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("agentbase/hub", "main"),
      localHubId: "f".repeat(24), remoteBase, activeHead: batchCommit, catalogVersion: "7.0.0" });
    git(hubRoot, ["update-ref", "refs/agentbase/published", remoteBase]);
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
      async updatePullRequest(number, headBranch, headCommit, baseBranch, title, body) {
        const index = pulls.findIndex((pull) => pull.number === number);
        if (index < 0) throw new Error("missing pull request");
        pullCalls.push({ title, body, base: baseBranch });
        const pull = { ...pulls[index]!, headBranch, headCommit, baseBranch };
        pulls[index] = pull;
        return pull;
      },
    };
    const gitRequests: GitRequest[] = [];
    const gitRunner = async (request: GitRequest) => {
      gitRequests.push(request);
      if (request.args[0] === "push") pushes.push(request.args.at(-1)!);
      const args = request.args[0] === "push" ? ["push", remote, ...request.args.slice(2)] : [...request.args];
      const environment = request.commitTimestamp
        ? { ...process.env, GIT_AUTHOR_DATE: request.commitTimestamp, GIT_COMMITTER_DATE: request.commitTimestamp }
        : undefined;
      const stdout = git(request.cwd, args, environment, request.stdin);
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
    assert.deepEqual(git(hubRoot, ["diff", "--name-only", remoteBase, independent.headCommit]).split("\n"),
      ["repositories/beta.md", "repositories/index.md"]);
    assert.doesNotMatch(git(hubRoot, ["show", `${independent.headCommit}:repositories/index.md`]), /Acme/);
    const enrichment = await publishPendingHubProposals({ ...common, selectedProposalIds: [IDS[3]!] });
    assert.equal(enrichment.mode, "independent"); assert.equal(enrichment.units[0]?.baseBranch, "main");
    const enrichmentReview = pullCalls.find((call) => call.title.includes("Enrichment"));
    assert.ok(enrichmentReview); assert.match(enrichmentReview.body, /domains\/crawler/);
    assert.match(enrichmentReview.body, new RegExp(`${SOURCE_ID}[\\s\\S]*${SOURCE_ID_B}`));
    assert.match(enrichmentReview.body, /123456789012.*ap-southeast-1.*aws\.sqs\.queue@1.*candidates: 1; Questions: 1/);
    const batchInit = await publishPendingHubProposals({ ...common, selectedProposalIds: [IDS[4]!] });
    assert.equal(batchInit.mode, "independent"); assert.equal(batchInit.units[0]?.baseBranch, "main");
    const batchReview = pullCalls.find((call) => call.title.includes("Batch Init"));
    assert.ok(batchReview); assert.match(batchReview.body, new RegExp(`${SOURCE_ID}[\\s\\S]*${SOURCE_ID_B}`));
    assert.match(batchReview.body, /subject: domains\/batch/);
    assert.match(batchReview.body, /Repositories: 2\./);
    assert.match(batchReview.body, /Batch Attribution.*repositories\/acme\.md.*Shared Navigation.*domains\/batch\.md/s);
    const forcedBatch = await publishPendingHubProposals({ ...common, selectedProposalIds: stackIds, publicationMode: "batch" });
    assert.equal(forcedBatch.mode, "batch"); assert.equal(forcedBatch.units.length, 1); assert.equal(forcedBatch.units[0]?.baseBranch, "main");

    const initializationOptions = { stateRoot, localHub, token: "github_pat_secret_canary", github, git: gitRunner,
      createdAt: "2026-08-22T00:00:00Z" };
    const initializationPreview = await previewHubInitialization(initializationOptions);
    assert.equal(initializationPreview.state, "changes-required");
    assert.equal(initializationPreview.base_commit, remoteBase);
    assert.equal(initializationPreview.readme_state, "missing"); assert.equal(initializationPreview.ci_state, "current");
    assert.deepEqual(initializationPreview.change_paths, [HUB_README_PATH]);
    const initialization = await initializeHub(initializationOptions, {
      baseCommit: initializationPreview.base_commit, initializationDigest: initializationPreview.initialization_digest,
    });
    assert.equal(initialization.result, "created"); assert.ok(initialization.head_commit); assert.ok(initialization.pull_request);
    assert.equal(ref("main"), remoteBase);
    assert.deepEqual(git(hubRoot, ["diff", "--name-only", remoteBase, initialization.head_commit!]), HUB_README_PATH);
    assert.equal(git(hubRoot, ["show", `${initialization.head_commit}:${HUB_README_PATH}`]), renderHubReadme().trimEnd());
    assert.match(renderHubReadme(), /created and managed by AgentBase-MCP/);
    assert.doesNotMatch(renderHubReadme(), /github\.com/);
    assert.match(renderHubReadme(), /\[`index\.md`\]\(index\.md\)/);
    assert.match(renderHubReadme(), /does not duplicate repository source code or the private local Code Graph/);
    assert.doesNotMatch(pullCalls.find((call) => call.title === "Initialize AgentBase-Hub")?.body ?? "",
      /github_pat_secret_canary|agentbase-publish-test-/);
    const initializationRetry = await initializeHub(initializationOptions, {
      baseCommit: initializationPreview.base_commit, initializationDigest: initializationPreview.initialization_digest,
    });
    assert.equal(initializationRetry.result, "recovered"); assert.deepEqual(initializationRetry.pull_request, initialization.pull_request);
    const badInitializationRoot = path.join(root, "bad-initialization");
    git(hubRoot, ["worktree", "add", "--detach", badInitializationRoot, remoteBase]);
    fs.writeFileSync(path.join(badInitializationRoot, HUB_README_PATH), renderHubReadme());
    fs.writeFileSync(path.join(badInitializationRoot, "extra.txt"), "unexpected\n");
    git(badInitializationRoot, ["add", "--all"]); git(badInitializationRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", "conflicting initialization branch"]);
    const badInitializationHead = git(badInitializationRoot, ["rev-parse", "HEAD"]);
    git(badInitializationRoot, ["push", "--force", remote, `${badInitializationHead}:refs/heads/${initializationPreview.head_branch}`]);
    git(hubRoot, ["worktree", "remove", "--force", badInitializationRoot]);
    await assert.rejects(initializeHub(initializationOptions, {
      baseCommit: initializationPreview.base_commit, initializationDigest: initializationPreview.initialization_digest,
    }), /outside the reviewed baseline/);
    assert.equal(ref("main"), remoteBase);

    git(remote, ["update-ref", "refs/heads/main", initialization.head_commit!, remoteBase]);
    const currentInitialization = await previewHubInitialization(initializationOptions);
    assert.equal(currentInitialization.state, "current"); assert.deepEqual(currentInitialization.change_paths, []);
    const driftRoot = path.join(root, "drifted-ci");
    git(hubRoot, ["worktree", "add", "--detach", driftRoot, initialization.head_commit!]);
    fs.writeFileSync(path.join(driftRoot, ...HUB_CI_WORKFLOW_PATH.split("/")), "name: drifted\n");
    git(driftRoot, ["add", HUB_CI_WORKFLOW_PATH]); git(driftRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost",
      "commit", "-m", "drift CI"]);
    const driftHead = git(driftRoot, ["rev-parse", "HEAD"]);
    git(driftRoot, ["push", remote, `${driftHead}:refs/heads/main`]);
    git(hubRoot, ["worktree", "remove", "--force", driftRoot]);
    const driftedInitialization = await previewHubInitialization(initializationOptions);
    assert.equal(driftedInitialization.readme_state, "present"); assert.equal(driftedInitialization.ci_state, "outdated");
    assert.deepEqual(driftedInitialization.change_paths, Object.keys(renderHubCiBundle().files).sort());
    git(remote, ["update-ref", "refs/heads/main", remoteBase, driftHead]);

    git(remote, ["update-ref", "refs/heads/main", batch.headCommit, remoteBase]);
    const rewrittenRoot = path.join(root, "rewritten-remote");
    fs.mkdirSync(rewrittenRoot);
    git(rewrittenRoot, ["init", "--initial-branch=main"]);
    fs.writeFileSync(path.join(rewrittenRoot, "index.md"), "---\nokf_version: '0.2'\n---\n");
    git(rewrittenRoot, ["add", "index.md"]);
    git(rewrittenRoot, ["-c", "user.name=Test", "-c", "user.email=test@localhost", "commit", "-m", "unrelated rewrite"]);
    const rewrittenHead = git(rewrittenRoot, ["rev-parse", "HEAD"]);
    git(rewrittenRoot, ["push", "--force", remote, `${rewrittenHead}:refs/heads/main`]);
    const transactionsBeforeRewrite = new Set(fs.existsSync(path.join(stateRoot, "transactions"))
      ? fs.readdirSync(path.join(stateRoot, "transactions")) : []);
    await assert.rejects(synchronizeLocalHub({ stateRoot, localHub, token: "github_pat_secret_canary", git: gitRunner }),
      /no longer contains the admitted Published boundary/);
    const rewriteTransaction = fs.readdirSync(path.join(stateRoot, "transactions"))
      .find((entry) => !transactionsBeforeRewrite.has(entry));
    assert.ok(rewriteTransaction);
    await recoverSynchronizationTransaction(stateRoot, rewriteTransaction, localHub, gitRunner);
    git(hubRoot, ["push", "--force", remote, `${batch.headCommit}:refs/heads/main`]);
    const synchronization = await synchronizeLocalHub({ stateRoot, localHub, token: "github_pat_secret_canary", git: gitRunner });
    assert.ok(gitRequests.some((request) => request.args.includes("cherry-pick")
      && request.args.includes("user.name=AgentBase") && request.args.includes("user.email=agentbase@localhost")),
    "synchronization replay supplies a bounded Git identity without relying on machine-global config");
    assert.equal(fs.existsSync(path.join(stateRoot, "transactions", synchronization.id)), false,
      "successful synchronization closes its recovery transaction");
    const synchronizedHub = createLocalHubState({ root: hubRoot, hub: createHubIdentity("agentbase/hub", "main"),
      localHubId: "f".repeat(24), remoteBase: batch.headCommit, activeHead: synchronization.activeHead, catalogVersion: "7.0.0" });
    const recoveryId = "sync-crashwindow", recoveryRoot = path.join(stateRoot, "transactions", recoveryId);
    fs.mkdirSync(recoveryRoot, { recursive: true });
    fs.writeFileSync(path.join(recoveryRoot, "transaction.json"), `${JSON.stringify({
      phase: "validated", localHubId: synchronizedHub.localHubId, originalHead: synchronization.originalHead,
      priorPublished: localHub.remoteBase, remoteHead: batch.headCommit, candidateHead: synchronization.activeHead,
      candidateRoot: path.join(recoveryRoot, "candidate"),
    })}\n`);
    const staleLock = path.join(stateRoot, "mutation.lock");
    fs.mkdirSync(staleLock, { recursive: true, mode: 0o700 });
    fs.chmodSync(staleLock, 0o700);
    fs.writeFileSync(path.join(staleLock, "owner.json"), `${JSON.stringify({ ownerId: recoveryId, pid: 2_147_483_647 })}\n`, { mode: 0o600 });
    git(hubRoot, ["checkout", "--detach", synchronization.activeHead]);
    assert.equal((await recoverSynchronizationTransaction(stateRoot, recoveryId, synchronizedHub, gitRunner)).outcome, "already-advanced");
    assert.equal(git(hubRoot, ["symbolic-ref", "--short", "HEAD"]), "main");
    assert.equal(fs.existsSync(recoveryRoot), false);
    const reconciled = await publishPendingHubProposals({ ...common, localHub: synchronizedHub, selectedProposalIds: [IDS[2]!] });
    assert.ok(gitRequests.some((request) => request.args.includes(
      `refs/heads/agentbase/okf-${IDS[2]}:refs/remotes/origin/agentbase/okf-${IDS[2]}`)),
    "publication reconciliation fetches an explicit remote-tracking ref for main-only Hub clones");
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
    await api.updatePullRequest(99, `agentbase/okf-${IDS[1]}`, refreshCommit, "main", "updated title", "updated body");
    assert.equal(new URL(requests[0]!.url).searchParams.get("base"), explicitBase);
    assert.equal(new URL(requests[0]!.url).searchParams.get("state"), "all");
    assert.equal((JSON.parse(requests[1]!.body!) as { base: string }).base, explicitBase);
    assert.equal(new URL(requests[2]!.url).searchParams.has("base"), false);
    assert.equal(requests[3]!.method, "PATCH");
    assert.deepEqual(JSON.parse(requests[3]!.body!), { base: "main", title: "updated title", body: "updated body" });
    const enterpriseRequests: string[] = [];
    const enterprise = new GitHubHubApi(createHubIdentity("agentbase/hub", "release/knowledge", "github.corp.example"), "canary",
      async (input) => {
        enterpriseRequests.push(String(input));
        return new Response(JSON.stringify([{ number: 7, html_url: "https://github.corp.example/agentbase/hub/pull/7",
          head: { ref: "agentbase/change", sha: refreshCommit, repo: { full_name: "agentbase/hub" } },
          base: { ref: "release/knowledge" } }]), { status: 200 });
      });
    assert.deepEqual(await enterprise.countOpenPullRequests(), { count: 1, truncated: false });
    assert.match(enterpriseRequests[0]!, /^https:\/\/github\.corp\.example\/api\/v3\/repos\/agentbase\/hub\/pulls\?/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
