import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import { runGit, type GitOutput, type GitRequest, type GitHubPullRequest } from "../../../providers/github-hub/index.ts";
import type { PublishGitHub } from "../publication/publish.ts";
import { executeHubBootstrap, previewHubBootstrap } from "./bootstrap.ts";
import { readPersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { createLocalHub } from "./setup.ts";

type Fixture = Readonly<{
  root: string;
  environment: NodeJS.ProcessEnv;
  base: string;
  commits: readonly string[];
  proposals: readonly string[];
  git: (request: GitRequest) => Promise<GitOutput>;
  github: PublishGitHub;
  mainPushes(): number;
  remoteMain(): string | undefined;
  pullCount(): number;
  failNextPull(): void;
  failNextFetch(): void;
  populateRemote(): void;
  raceNextMainPush(): void;
  cleanup(): void;
}>;

async function commitKnowledge(root: string, sequence: number): Promise<Readonly<{ id: string; commit: string }>> {
  const id = String(sequence).repeat(24), subject = `repositories/repo-${sequence}`;
  fs.appendFileSync(path.join(root, "index.md"), `\nKnowledge ${sequence}.\n`);
  await runGit({ args: ["add", "index.md"], cwd: root, operation: "stage fixture knowledge" });
  const message = [
    `Knowledge ${sequence}`, "", `${HUB_PROPOSAL_TRAILERS.id}: ${id}`,
    `${HUB_PROPOSAL_TRAILERS.subject}: ${subject}`,
    `${HUB_PROPOSAL_TRAILERS.sourceId}: repository-repo-${sequence}-${String(sequence).repeat(12)}`,
    `${HUB_PROPOSAL_TRAILERS.evidenceDigest}: sha256:${String(sequence).repeat(64)}`,
    `${HUB_PROPOSAL_TRAILERS.diffDigest}: sha256:${String(sequence + 2).repeat(64)}`,
    `${HUB_PROPOSAL_TRAILERS.catalog}: 2.0.0`,
  ].join("\n");
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "--no-gpg-sign", "--no-verify", "-m", message],
    cwd: root, operation: "commit fixture knowledge", commitTimestamp: `2026-08-13T00:0${sequence}:00Z` });
  const commit = (await runGit({ args: ["rev-parse", "HEAD"], cwd: root, operation: "resolve fixture knowledge" })).stdout.trim();
  return { id, commit };
}

async function fixture(knowledgeCount = 2): Promise<Fixture> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-bootstrap-test-"));
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data"),
    XDG_STATE_HOME: path.join(root, "state"), AGENTBASE_HUB_GITHUB_TOKEN: "token-canary" };
  const created = await createLocalHub(environment, runGit, "2026-08-13T00:00:00Z");
  const knowledge: Array<Readonly<{ id: string; commit: string }>> = [];
  for (let sequence = 1; sequence <= knowledgeCount; sequence += 1) knowledge.push(await commitKnowledge(created.localRoot, sequence));
  let main: string | undefined, mainPushCount = 0, failPull = false, failFetch = false, racePush = false;
  const branches = new Map<string, string>(), pulls: GitHubPullRequest[] = [];
  const git = async (request: GitRequest): Promise<GitOutput> => {
    const command = request.args[0];
    if (command === "ls-remote") return { stdout: main ? `${main}\trefs/heads/main\n` : "", stderr: "" };
    if (command === "push") {
      const refspec = String(request.args.at(-1)), [commit, ref] = refspec.split(":");
      if (!commit || !ref) throw new Error("invalid fixture push");
      if (ref === "refs/heads/main") {
        if (racePush) { racePush = false; main = "e".repeat(40); throw new Error("bootstrap remote Hub main: Git exited with status 1"); }
        if (main) throw new Error("bootstrap remote Hub main: Git exited with status 1");
        main = commit; mainPushCount += 1;
      }
      else branches.set(ref.replace("refs/heads/", ""), commit);
      return { stdout: "", stderr: "" };
    }
    if (command === "fetch") {
      if (failFetch) { failFetch = false; throw new Error("simulated fetch interruption"); }
      if (!main) throw new Error("fixture remote main missing");
      await runGit({ args: ["update-ref", "refs/remotes/origin/main", main], cwd: request.cwd, operation: "fixture fetch" });
      return { stdout: "", stderr: "" };
    }
    return runGit(request);
  };
  const github: PublishGitHub = {
    async getRepository() { return { fullName: "acme/AgentBase-Hub", defaultBranch: "main" }; },
    async getBranchRef(branch) {
      const commit = branch === "main" ? main : branches.get(branch);
      if (!commit) throw new Error("fixture ref missing");
      return { branch, commit };
    },
    async findBranchRef(branch) { const commit = branches.get(branch); return commit ? { branch, commit } : undefined; },
    async listOpenPullRequests(branch) { return pulls.filter((pull) => pull.headBranch === branch); },
    async createPullRequest(headBranch, headCommit) {
      if (failPull) { failPull = false; throw new Error("GitHub request failed with status 403 token-canary"); }
      const pull = { number: 7, url: "https://github.com/acme/AgentBase-Hub/pull/7", headBranch, headCommit,
        headRepository: "acme/AgentBase-Hub", baseBranch: "main" };
      pulls.push(pull); return pull;
    },
  };
  return { root, environment, base: created.baseCommit, commits: knowledge.map((item) => item.commit), proposals: knowledge.map((item) => item.id), git, github,
    mainPushes: () => mainPushCount, remoteMain: () => main, pullCount: () => pulls.length,
    failNextPull: () => { failPull = true; }, failNextFetch: () => { failFetch = true; },
    populateRemote: () => { main = "f".repeat(40); }, raceNextMainPush: () => { racePush = true; },
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-HUB-SETUP-010][AB-HUB-SETUP-011] all-to-main publishes the exact active head without a PR", async () => {
  const current = await fixture();
  try {
    const preview = await previewHubBootstrap("https://github.com/acme/AgentBase-Hub", "all-to-main", current.environment, current.git);
    assert.equal(preview.baseCommit, current.base);
    assert.deepEqual(preview.commits, current.commits);
    const receipt = await executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "all-to-main", current.environment,
      { git: current.git, github: current.github });
    assert.equal(receipt.phase, "completed");
    assert.equal(current.remoteMain(), current.commits.at(-1));
    assert.equal(current.mainPushes(), 1);
    assert.equal(current.pullCount(), 0);
    assert.equal(readPersistedHubConfiguration(current.environment)?.kind, "remote");
    await assert.rejects(executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "all-to-main", current.environment,
      { git: current.git, github: current.github }), /already complete/);
  } finally { current.cleanup(); }
});

test("[AB-HUB-SETUP-012][AB-HUB-SETUP-013] base-only bootstrap with zero knowledge needs no PR and resumes after main push", async () => {
  const current = await fixture(0);
  try {
    current.failNextFetch();
    await assert.rejects(executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "base-to-main-knowledge-pr", current.environment,
      { git: current.git, github: current.github }), /fetch interruption/);
    assert.equal(current.remoteMain(), current.base);
    assert.equal(current.mainPushes(), 1);
    const receipt = await executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "base-to-main-knowledge-pr", current.environment,
      { git: current.git, github: current.github });
    assert.equal(receipt.phase, "completed");
    assert.equal(receipt.publication, undefined);
    assert.equal(current.mainPushes(), 1);
    assert.equal(current.pullCount(), 0);
  } finally { current.cleanup(); }
});

test("[AB-HUB-SETUP-012][AB-HUB-SETUP-013][AB-HUB-SETUP-015] base-only bootstrap retries one exact knowledge PR", async () => {
  const current = await fixture();
  try {
    current.failNextPull();
    const failure = await executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "base-to-main-knowledge-pr", current.environment,
      { git: current.git, github: current.github }).then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));
    assert.match(failure, /update the one global token/);
    assert.doesNotMatch(failure, /token-canary/);
    assert.equal(current.remoteMain(), current.base);
    assert.equal(current.mainPushes(), 1);
    const receipt = await executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "base-to-main-knowledge-pr", current.environment,
      { git: current.git, github: current.github });
    assert.equal(receipt.phase, "completed");
    assert.deepEqual(receipt.publication?.commits, current.commits);
    assert.equal(current.mainPushes(), 1);
    assert.equal(current.pullCount(), 1);
  } finally { current.cleanup(); }
});

test("[AB-HUB-SETUP-009][AB-HUB-SETUP-016] populated bootstrap target fails before mutation", async () => {
  const current = await fixture();
  try {
    current.populateRemote();
    await assert.rejects(executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "all-to-main", current.environment,
      { git: current.git, github: current.github }), /no refs/);
    assert.equal(current.mainPushes(), 0);
    assert.equal(readPersistedHubConfiguration(current.environment)?.kind, "local-only");
  } finally { current.cleanup(); }
});

test("[AB-HUB-SETUP-009][AB-HUB-SETUP-017] a ref created after empty inspection is reported as a race", async () => {
  const current = await fixture();
  try {
    current.raceNextMainPush();
    await assert.rejects(executeHubBootstrap("https://github.com/acme/AgentBase-Hub", "all-to-main", current.environment,
      { git: current.git, github: current.github }), /gained a ref/);
    assert.equal(current.mainPushes(), 0);
    assert.equal(readPersistedHubConfiguration(current.environment)?.kind, "local-only");
  } finally { current.cleanup(); }
});
