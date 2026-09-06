import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { executeCli } from "../../../cli.ts";

import { createHubIdentity, createHubProposal, createLocalHubState } from "../../../core/hub/index.ts";
import { AGENTBASE_PRODUCER } from "../../../product-version.ts";
import { computeOkfTreeDigest, renderAgentBaseOkfProfileDocument } from "../../../core/knowledge/index.ts";
import { runGit, type GitRequest } from "../../../providers/github-hub/index.ts";
import { bindHubProposalInspection, inspectHubProposal } from "../review/inspect.ts";
import { writeHubProposalState } from "../review/proposal-state.ts";
import { HUB_PUBLISHED_REF } from "../workspace/local-hub.ts";
import { publishHubProposalDirect, type DirectPublishOptions } from "./direct-publish.ts";
import { publishConfiguredHubProposal } from "./configured-publish.ts";
import { activatePersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { writeGlobalHubToken } from "../configuration/credential-file.ts";
import { hubProfileId } from "../../../core/hub/index.ts";
import { createHubRuntimeActions } from "../runtime-actions.ts";
import type { GitHubPullRequest } from "../../../providers/github-hub/index.ts";
import type { PreparedPrApi } from "./prepared-pr.ts";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

async function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-direct-test-"));
  const checkout = path.join(root, "hub"), remote = path.join(root, "remote.git");
  const proposalRoot = path.join(root, "proposal"), baseRoot = path.join(proposalRoot, "base");
  const bundleRoot = path.join(proposalRoot, "bundle");
  const hub = createHubIdentity("fixture/knowledge", "release/knowledge");
  const calls: GitRequest[] = [];
  const git = async (request: GitRequest) => {
    calls.push(request);
    const { token: _token, ...localRequest } = request;
    return runGit({ ...localRequest, args: ["-c", "protocol.file.allow=always",
      ...request.args.map((arg) => arg === hub.canonicalHttpsUrl ? remote : arg)] });
  };
  const command = async (args: readonly string[], cwd = checkout) => (await git({ args, cwd, operation: "test fixture" })).stdout.trim();
  await command(["init", "--bare", remote], root);
  await command(["init", "--initial-branch=main", checkout], root);
  write(baseRoot, "index.md", "---\nokf_version: '0.2'\n---\n# Hub\n\n* [Profile](shared/agentbase-profile.md)\n* [Shared](shared/index.md)\n* [Platform](domains/platform/index.md)\n");
  write(baseRoot, "shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument());
  write(baseRoot, "shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md)\n");
  const provenance = `status: draft\ngenerated:\n  by: ${AGENTBASE_PRODUCER}\n  at: 2026-09-06T00:00:00.000Z\nsources:\n  - id: fixture-doc\n    resource: https://example.com/fixture\n`;
  write(baseRoot, "domains/platform/index.md", `---\ntype: Domain\ntitle: Platform\ndescription: Platform.\n${provenance}---\n# Platform\n`);
  fs.cpSync(baseRoot, checkout, { recursive: true });
  await command(["add", "--all"]);
  await command(["-c", "user.name=Fixture", "-c", "user.email=fixture@localhost", "commit", "-m", "Base"]);
  const base = await command(["rev-parse", "HEAD"]);
  await command(["push", hub.canonicalHttpsUrl, `HEAD:refs/heads/${hub.targetBranch}`]);
  await command(["update-ref", HUB_PUBLISHED_REF, base]);
  fs.cpSync(baseRoot, bundleRoot, { recursive: true });
  write(bundleRoot, "domains/platform/knowledge/api.md", `---\ntype: Component\ntitle: API\ndescription: API.\n${provenance}---\n# API\n`);
  fs.appendFileSync(path.join(bundleRoot, "domains/platform/index.md"), "\n* [API](knowledge/api.md) - Component\n");
  const ordinary = inspectHubProposal([
    { path: "domains/platform/index.md", change: "modified", allowed: true },
    { path: "domains/platform/knowledge/api.md", change: "created", allowed: true },
  ], { baseRoot, proposedRoot: bundleRoot });
  const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(ordinary.entries)).digest("hex")}`;
  const proposal = createHubProposal({ mode: "new", subject: "domains/platform/knowledge/api", baseCommit: base,
    sourceRepositoryId: "repository-fixture-aaaaaaaaaaaa", evidenceDigest: `sha256:${"b".repeat(64)}`,
    schemaVersion: "7.0.0", selectedSchemas: ["Component"], treeDigest: computeOkfTreeDigest(bundleRoot), diffDigest, hub });
  writeHubProposalState(proposalRoot, proposal);
  write(proposalRoot, "inspection.json", JSON.stringify(bindHubProposalInspection(ordinary, { baseRoot, proposedRoot: bundleRoot, proposal })));
  write(proposalRoot, "proposal.json", JSON.stringify({ formatVersion: 1, state: "generated", proposalId: "proposal-direct-fixture",
    baseTreeDigest: computeOkfTreeDigest(baseRoot), evidenceDigest: proposal.evidenceDigest, createdAt: "2026-09-06T00:00:00.000Z" }));
  const options: DirectPublishOptions = { stateRoot: path.join(root, "state"), proposalRoot, expectedDiffDigest: diffDigest,
    authorization: "direct", token: "fixture-only", git,
    localHub: createLocalHubState({ root: checkout, hub, remoteBase: base, activeHead: base, catalogVersion: "7.0.0" }) };
  const advanceRemote = async () => {
    const tree = await command(["rev-parse", `${base}^{tree}`]);
    const commit = await command(["-c", "user.name=Other", "-c", "user.email=other@localhost", "commit-tree", tree, "-p", base, "-m", "Other writer"]);
    await command(["push", hub.canonicalHttpsUrl, `${commit}:refs/heads/${hub.targetBranch}`]);
    return commit;
  };
  return { root, checkout, remote, base, proposal, bundleRoot, options, calls, git, command, advanceRemote,
    remoteHead: () => command(["rev-parse", `refs/heads/${hub.targetBranch}`], remote),
    close: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-DIRECT-001..006] direct publication commits exact reviewed tree and recognizes Published without Accept", async () => {
  const f = await fixture();
  try {
    const result = await publishHubProposalDirect(f.options);
    assert.equal(result.remote, "published");
    assert.equal(result.local, "recognized");
    assert.equal(await f.remoteHead(), result.commit);
    assert.equal(await f.command(["rev-parse", "HEAD"]), result.commit);
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), result.commit);
    assert.equal(await f.command(["rev-parse", "HEAD^"]), f.base);
    assert.equal(await f.command(["show", "HEAD:domains/platform/knowledge/api.md"]), fs.readFileSync(path.join(f.bundleRoot, "domains/platform/knowledge/api.md"), "utf8").trim());
    assert.equal(fs.existsSync(path.join(f.options.proposalRoot, "accepted.json")), false);
    const pushes = f.calls.filter((call) => call.operation === "push direct publication");
    assert.equal(pushes.length, 1);
    assert.deepEqual(pushes[0]!.args, ["push", f.options.localHub.hub.canonicalHttpsUrl, `${result.commit}:refs/heads/release/knowledge`]);
    assert.deepEqual(await publishHubProposalDirect(f.options), result);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
  } finally { f.close(); }
});

test("[AB-PREPARED-PUBLISH-005..006] interrupted candidate rebuild preserves authoring and old runtime actions are absent", async () => {
  const f = await fixture();
  try {
    const actions = createHubRuntimeActions({ AGENTBASE_HOME: path.join(f.root, "runtime") });
    for (const name of ["accept", "submitMany", "listPending"]) assert.equal(name in actions, false);
    const digest = computeOkfTreeDigest(f.bundleRoot);
    await assert.rejects(publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (request.operation === "stage complete direct publication") throw new Error("interrupted build");
      return f.git(request);
    } }), /interrupted build/);
    assert.equal(await f.remoteHead(), f.base);
    const result = await publishHubProposalDirect(f.options);
    assert.equal(result.remote, "published");
    assert.equal(result.cleanup, undefined);
    assert.equal(computeOkfTreeDigest(f.bundleRoot), digest);
    const transaction = path.join(f.options.stateRoot, "transactions", `direct-${hubProfileId(f.options.localHub.hub)}-${f.proposal.id}`);
    assert.equal(fs.existsSync(path.join(transaction, "candidate")), false);
    assert.equal(fs.existsSync(path.join(transaction, "receipt.json")), true);
    assert.equal(await f.command(["rev-parse", `refs/agentbase/candidates/direct/${f.proposal.id}`]), result.commit);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
  } finally { f.close(); }
});

test("[AB-PREPARED-PUBLISH-005] failed cleanup is visible and retry after later Sync neither rewinds nor republishes", async () => {
  const f = await fixture();
  try {
    const first = await publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (request.operation === "clean publication candidate") throw new Error("busy worktree");
      return f.git(request);
    } });
    assert.equal(first.remote, "published");
    assert.equal(first.cleanup, "pending");
    const tree = await f.command(["rev-parse", `${first.commit}^{tree}`]);
    const successor = await f.command(["-c", "user.name=Other", "-c", "user.email=other@localhost",
      "commit-tree", tree, "-p", first.commit, "-m", "Later synchronized change"]);
    await f.command(["push", f.options.localHub.hub.canonicalHttpsUrl, `${successor}:refs/heads/release/knowledge`]);
    await f.command(["merge", "--ff-only", successor]);
    await f.command(["update-ref", HUB_PUBLISHED_REF, successor]);
    const recovered = await publishHubProposalDirect(f.options);
    assert.equal(recovered.local, "recognized");
    assert.equal(recovered.cleanup, undefined);
    assert.equal(await f.command(["rev-parse", "HEAD"]), successor);
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), successor);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
  } finally { f.close(); }
});

test("[AB-PREPARED-PUBLISH-001..002] PR policy shares exact candidate, retains Published and recovers lost PR acknowledgement", async () => {
  const f = await fixture();
  try {
    const pulls: GitHubPullRequest[] = [];
    let creations = 0, closed = false;
    const github: PreparedPrApi = {
      getBranchRef: async (branch) => ({ branch, commit: await f.remoteHead() }),
      findBranchRef: async (branch) => {
        const commit = await f.command(["for-each-ref", "--format=%(objectname)", `refs/heads/${branch}`], f.remote);
        return commit ? { branch, commit } : undefined;
      },
      listPullRequestsForHead: async (_branch, state) => closed && state === "open" ? [] : pulls,
      createPullRequest: async (headBranch, headCommit, _title, body, baseBranch) => {
        creations += 1;
        assert.match(body, /Reviewed diff:/);
        assert.match(body, /Questions and source limitations/);
        pulls.push({ number: 1, url: "https://github.com/fixture/knowledge/pull/1", headBranch, headCommit,
          headRepository: f.options.localHub.hub.repository, baseBranch: baseBranch! });
        throw new Error("lost PR response");
      },
    };
    const options = { ...f.options, authorization: "pr" as const, github };
    const first = await publishHubProposalDirect(options);
    assert.equal(first.remote, "unknown");
    const retried = await publishHubProposalDirect(options);
    assert.equal(retried.remote, "in-review");
    assert.equal(retried.pullRequest?.number, 1);
    assert.equal(retried.commit, first.commit);
    assert.equal(creations, 1);
    assert.equal(await f.remoteHead(), f.base);
    assert.equal(await f.command(["rev-parse", "HEAD"]), f.base);
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), f.base);
    assert.equal(await f.command(["rev-parse", `${first.commit}^`]), f.base);
    closed = true;
    await assert.rejects(publishHubProposalDirect(options), /closed/);
    assert.equal(creations, 1);
  } finally { f.close(); }
});

test("[AB-PREPARED-PUBLISH-001..002] PR publication refuses changed target or foreign branch before push", async () => {
  const f = await fixture();
  try {
    let branchExists = false;
    const github: PreparedPrApi = {
      getBranchRef: async (branch) => ({ branch, commit: branchExists ? f.base : "f".repeat(40) }),
      findBranchRef: async (branch) => branchExists ? { branch, commit: f.base } : undefined,
      listPullRequestsForHead: async () => [],
      createPullRequest: async () => { throw new Error("must not create PR"); },
    };
    await assert.rejects(publishHubProposalDirect({ ...f.options, authorization: "pr", github }), /remote Hub changed/);
    branchExists = true;
    await assert.rejects(publishHubProposalDirect({ ...f.options, authorization: "pr", github }), /different content/);
    assert.equal(f.calls.filter((call) => call.operation === "push reviewed PR candidate").length, 0);
    assert.equal(await f.remoteHead(), f.base);
  } finally { f.close(); }
});

test("[AB-DIRECT-007][AB-DIRECT-008] CLI publishes through persisted profile into isolated real Git without Accept", async () => {
  const f = await fixture();
  try {
    const environment = { AGENTBASE_HOME: path.join(f.root, "application") };
    const hub = f.options.localHub.hub;
    activatePersistedHubConfiguration({ formatVersion: 1, kind: "remote", localHubId: hubProfileId(hub),
      localRoot: f.checkout, baseCommit: f.base, catalogVersion: "7.0.0", host: hub.host,
      repository: hub.repository, targetBranch: hub.targetBranch }, environment);
    writeGlobalHubToken("fixture-only", environment);
    await runGit({ args: ["remote", "add", "origin", hub.canonicalHttpsUrl], cwd: f.checkout, operation: "configure fixture identity" });
    const retained = path.join(environment.AGENTBASE_HOME, "state/hub-runtime/proposals", f.proposal.id);
    fs.mkdirSync(path.dirname(retained), { recursive: true });
    fs.cpSync(f.options.proposalRoot, retained, { recursive: true });
    const output: string[] = [], errors: string[] = [];
    const args = ["hub", "publish", "--proposal", f.proposal.id, "--digest", f.proposal.diffDigest, "--mode", "direct"];
    const dependencies = { environment, writeOutput: (s: string) => output.push(s), writeError: (s: string) => errors.push(s),
      publishHub: (input: Parameters<typeof publishConfiguredHubProposal>[0], env: NodeJS.ProcessEnv) =>
        publishConfiguredHubProposal(input, env, { git: f.git }) };
    assert.equal(await executeCli(args, undefined, dependencies), 0, errors.join(""));
    assert.equal(await executeCli(args, undefined, dependencies), 0, errors.join(""));
    const result = JSON.parse(output[0]!);
    assert.equal(await f.remoteHead(), result.commit);
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), result.commit);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
    assert.equal(fs.existsSync(path.join(retained, "accepted.json")), false);
  } finally { f.close(); }
});

test("[AB-DIRECT-001][AB-DIRECT-002][AB-DIRECT-006] bad confirmation, changed bytes and pending local work never push", async () => {
  const f = await fixture();
  try {
    await assert.rejects(publishHubProposalDirect({ ...f.options, expectedDiffDigest: "wrong" }), /confirmation/);
    const file = path.join(f.bundleRoot, "domains/platform/knowledge/api.md"), content = fs.readFileSync(file, "utf8");
    fs.appendFileSync(file, "unreviewed");
    await assert.rejects(publishHubProposalDirect(f.options), /bytes changed/);
    fs.writeFileSync(file, content);
    write(f.checkout, "README.md", "Pending local work\n");
    await assert.rejects(publishHubProposalDirect(f.options), /clean local main/);
    await f.command(["add", "README.md"]);
    await f.command(["-c", "user.name=Fixture", "-c", "user.email=fixture@localhost", "commit", "-m", "Pending local draft"]);
    const pending = await f.command(["rev-parse", "HEAD"]);
    await assert.rejects(publishHubProposalDirect(f.options), /without pending local changes/);
    assert.equal(await f.command(["rev-parse", "HEAD"]), pending);
    assert.equal(await f.remoteHead(), f.base);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 0);
  } finally { f.close(); }
});

test("[AB-DIRECT-003][AB-DIRECT-006] changed remote base is preserved without direct push", async () => {
  const f = await fixture();
  try {
    const other = await f.advanceRemote();
    await assert.rejects(publishHubProposalDirect(f.options), /remote Hub changed/);
    assert.equal(await f.remoteHead(), other);
    assert.equal(await f.command(["rev-parse", "HEAD"]), f.base);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 0);
  } finally { f.close(); }
});

test("[AB-DIRECT-003][AB-DIRECT-006] concurrent remote writer wins and normal push cannot overwrite it", async () => {
  const f = await fixture();
  try {
    let other = "";
    await assert.rejects(publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (request.operation === "push direct publication") other = await f.advanceRemote();
      return f.git(request);
    } }), /not present on remote/);
    assert.equal(await f.remoteHead(), other);
    assert.equal(await f.command(["rev-parse", "HEAD"]), f.base);
  } finally { f.close(); }
});

test("[AB-DIRECT-004][AB-DIRECT-006] lost push acknowledgement remains unknown then retry recognizes exact remote commit", async () => {
  const f = await fixture();
  try {
    let pushed = false;
    const first = await publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (pushed && request.operation === "inspect direct publication remote") throw new Error("offline");
      const output = await f.git(request);
      if (request.operation === "push direct publication") { pushed = true; throw new Error("lost acknowledgement"); }
      return output;
    } });
    assert.equal(first.remote, "unknown");
    assert.equal(await f.remoteHead(), first.commit);
    assert.equal(await f.command(["rev-parse", "HEAD"]), f.base);
    const recovered = await publishHubProposalDirect(f.options);
    assert.equal(recovered.commit, first.commit);
    assert.equal(recovered.local, "recognized");
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
  } finally { f.close(); }
});

test("[AB-DIRECT-005][AB-DIRECT-006] remote success with failed local Published update recovers without another push", async () => {
  const f = await fixture();
  try {
    const first = await publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (request.operation === "advance direct Published boundary") throw new Error("disk failure");
      return f.git(request);
    } });
    assert.equal(first.remote, "published");
    assert.equal(first.local, "pending");
    assert.equal(await f.command(["rev-parse", "HEAD"]), first.commit);
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), f.base);
    const recovered = await publishHubProposalDirect(f.options);
    assert.equal(recovered.local, "recognized");
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), first.commit);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
  } finally { f.close(); }
});

test("[AB-DIRECT-001][AB-DIRECT-006] wrong Hub identity and tampered semantic inspection cannot publish", async () => {
  const f = await fixture();
  try {
    await assert.rejects(publishHubProposalDirect({ ...f.options, localHub: { ...f.options.localHub,
      hub: createHubIdentity("fixture/other", "release/knowledge") } }), /exact Hub/);
    const inspectionPath = path.join(f.options.proposalRoot, "inspection.json");
    const inspection = JSON.parse(fs.readFileSync(inspectionPath, "utf8"));
    inspection.semanticImpact.concepts.added = [];
    fs.writeFileSync(inspectionPath, JSON.stringify(inspection));
    await assert.rejects(publishHubProposalDirect(f.options), /changed after finalization/);
    assert.equal(await f.remoteHead(), f.base);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 0);
  } finally { f.close(); }
});

test("[AB-DIRECT-003][AB-DIRECT-004][AB-DIRECT-006] rejected push retains exact candidate for an authorized retry", async () => {
  const f = await fixture();
  try {
    let candidate = "";
    await assert.rejects(publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (request.operation === "push direct publication") {
        candidate = request.args[2]!.split(":")[0]!;
        throw new Error("branch policy rejected push");
      }
      return f.git(request);
    } }), /not present on remote/);
    assert.equal(await f.remoteHead(), f.base);
    assert.equal(await f.command(["rev-parse", "HEAD"]), f.base);
    const retried = await publishHubProposalDirect(f.options);
    assert.equal(retried.commit, candidate);
    assert.equal(retried.remote, "published");
  } finally { f.close(); }
});

test("[AB-DIRECT-004][AB-DIRECT-005][AB-DIRECT-006] retry recognizes publication followed by another remote writer and preserves dirty local work", async () => {
  const f = await fixture();
  try {
    const first = await publishHubProposalDirect({ ...f.options, git: async (request) => {
      const output = await f.git(request);
      if (request.operation === "push direct publication") write(f.checkout, "untracked.txt", "Owner work\n");
      return output;
    } });
    assert.equal(first.remote, "published");
    assert.equal(first.local, "pending");
    const tree = await f.command(["rev-parse", `${first.commit}^{tree}`]);
    const successor = await f.command(["-c", "user.name=Other", "-c", "user.email=other@localhost",
      "commit-tree", tree, "-p", first.commit, "-m", "Later writer"]);
    await f.command(["push", f.options.localHub.hub.canonicalHttpsUrl, `${successor}:refs/heads/release/knowledge`]);
    assert.equal((await publishHubProposalDirect(f.options)).local, "pending");
    assert.equal(fs.readFileSync(path.join(f.checkout, "untracked.txt"), "utf8"), "Owner work\n");
    fs.unlinkSync(path.join(f.checkout, "untracked.txt"));
    assert.equal((await publishHubProposalDirect(f.options)).local, "recognized");
    assert.equal(await f.remoteHead(), successor);
    assert.equal(await f.command(["rev-parse", HUB_PUBLISHED_REF]), first.commit);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 1);
  } finally { f.close(); }
});

test("[AB-DIRECT-002][AB-DIRECT-003][AB-DIRECT-006] Git filters cannot publish bytes different from the reviewed tree", async () => {
  const f = await fixture();
  try {
    await f.command(["config", "filter.fixture.clean", "tr A Z"]);
    write(f.checkout, ".git/info/attributes", "*.md filter=fixture\n");
    // Git status can also reject these attributes. Allow the known base through
    // that preflight to exercise the independent committed-blob guard itself.
    await assert.rejects(publishHubProposalDirect({ ...f.options, git: async (request) => {
      if (request.operation === "inspect direct publication checkout") return { stdout: "", stderr: "" };
      return f.git(request);
    } }), /Git bytes differ/);
    assert.equal(await f.remoteHead(), f.base);
    assert.equal(await f.command(["rev-parse", "HEAD"]), f.base);
    assert.equal(f.calls.filter((call) => call.operation === "push direct publication").length, 0);
  } finally { f.close(); }
});
