import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubProposal, createLocalOnlyHubState } from "../../../core/hub/index.ts";
import {
  computeOkfTreeDigest,
  prepareBundleProposal,
  renderAgentBaseOkfProfileDocument,
} from "../../../core/knowledge/index.ts";
import { acceptHubProposal } from "../review/accept.ts";
import { bindHubProposalInspection, inspectHubProposal } from "../review/inspect.ts";
import { admitHubKnowledgeMutation } from "../review/mutation-admission.ts";
import { writeHubProposalState } from "../review/proposal-state.ts";
import { finalizeProfileMigration, prepareProfileMigration } from "./profile-migration.ts";

const LOCAL_ID = "c".repeat(24);
const REPOSITORY_ID = "repository-migration-aaaaaaaaaaaa";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function legacy(root: string): void {
  write(root, "index.md", "---\nokf_version: '0.2'\n---\n\n# Legacy Hub\n");
  write(root, "notes/legacy.md", "---\ntype: Legacy Note\ntitle: Retained note\ndescription: Must survive migration.\n---\n\n# Retained note\n");
}

function authorProfile(bundleRoot: string): void {
  fs.rmSync(path.join(bundleRoot, "notes/legacy.md"));
  fs.rmdirSync(path.join(bundleRoot, "notes"));
  write(bundleRoot, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Profile](shared/agentbase-profile.md)\n* [Shared](shared/index.md)\n");
  write(bundleRoot, "shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md)\n* [Retained note](knowledge/legacy.md)\n");
  write(bundleRoot, "shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument());
  write(bundleRoot, "shared/knowledge/legacy.md", "---\ntype: Legacy Note\ntitle: Retained note\ndescription: Must survive migration.\n---\n\n# Retained note\n");
}

function git(root: string, args: readonly string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8",
    env: { ...process.env, GIT_AUTHOR_NAME: "Test", GIT_AUTHOR_EMAIL: "test@localhost",
      GIT_COMMITTER_NAME: "Test", GIT_COMMITTER_EMAIL: "test@localhost" } }).trim();
}

test("[AB-PROFILE-MIGRATE-001..010][AB-PROFILE-MIGRATE-012] migration is report-first, explicit, loss-aware and retained", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-migration-test-"));
  const hubRoot = path.join(root, "hub"), stateRoot = path.join(root, "state"), commit = "a".repeat(40);
  try {
    legacy(hubRoot);
    const localHub = createLocalOnlyHubState({ kind: "local-only", root: hubRoot, localHubId: LOCAL_ID,
      baseCommit: commit, remoteBase: commit, activeHead: commit, catalogVersion: "7.0.0" });
    const prepared = prepareProfileMigration({ stateRoot, localHub, createdAt: "2026-09-04T00:00:00.000Z" });
    assert.equal(prepared.profile, "legacy-unprofiled");
    assert.equal(prepared.rollback_commit, commit);
    assert.deepEqual(prepared.concepts, [{ identity: "notes/legacy", path: "notes/legacy.md", type: "Legacy Note" }]);
    assert.equal(fs.existsSync(path.join(hubRoot, "shared")), false);

    authorProfile(prepared.bundle_root);
    await assert.rejects(finalizeProfileMigration({ stateRoot, localHub, sessionId: prepared.session_id, moves: [] }),
      /every removed base file/);
    const finalized = await finalizeProfileMigration({ stateRoot, localHub, sessionId: prepared.session_id,
      moves: [{ fromPath: "notes/legacy.md", toPath: "shared/knowledge/legacy.md" }] });
    assert.equal(finalized.proposal.mode, "migration");
    assert.equal(finalized.migration.rollbackCommit, commit);
    assert.equal(finalized.migration.digest, finalized.proposal.migrationDigest);
    assert.equal(finalized.inspection.groups.removed[0]?.change, "migration-move-source");
    const proposalRoot = path.join(stateRoot, "proposals", finalized.proposal.id);
    await assert.doesNotReject(admitHubKnowledgeMutation(proposalRoot, finalized.proposal));

    const retainedPath = path.join(proposalRoot, "profile-migration.json");
    const retained = JSON.parse(fs.readFileSync(retainedPath, "utf8")) as Record<string, unknown>;
    fs.writeFileSync(retainedPath, `${JSON.stringify({ ...retained, rollbackCommit: "b".repeat(40) }, null, 2)}\n`);
    await assert.rejects(admitHubKnowledgeMutation(proposalRoot, finalized.proposal), /does not match/);

    const legacyProposalRoot = path.join(root, "legacy-proposal");
    fs.cpSync(hubRoot, path.join(legacyProposalRoot, "base"), { recursive: true });
    fs.cpSync(hubRoot, path.join(legacyProposalRoot, "bundle"), { recursive: true });
    const treeDigest = computeOkfTreeDigest(hubRoot);
    const ordinary = createHubProposal({ mode: "new", subject: "repositories/example", baseCommit: commit,
      sourceRepositoryId: REPOSITORY_ID, evidenceDigest: `sha256:${"b".repeat(64)}`, schemaVersion: "7.0.0",
      selectedSchemas: ["Repository"], treeDigest, diffDigest: `sha256:${"d".repeat(64)}`, localHubId: LOCAL_ID });
    await assert.rejects(admitHubKnowledgeMutation(legacyProposalRoot, ordinary), /requires admitted Profile 1.0/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-PROFILE-MIGRATE-009..011] Accept serializes migration and blocks later mutation until synchronization", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-migration-accept-test-"));
  const hubRoot = path.join(root, "hub"), stateRoot = path.join(root, "state");
  try {
    fs.mkdirSync(hubRoot);
    git(hubRoot, ["init", "-b", "main"]);
    legacy(hubRoot);
    git(hubRoot, ["add", "--all"]); git(hubRoot, ["commit", "-m", "legacy base"]);
    const baseCommit = git(hubRoot, ["rev-parse", "HEAD"]);
    git(hubRoot, ["update-ref", "refs/agentbase/published", baseCommit]);
    const baseHub = createLocalOnlyHubState({ kind: "local-only", root: hubRoot, localHubId: LOCAL_ID,
      baseCommit, remoteBase: baseCommit, activeHead: baseCommit, catalogVersion: "7.0.0" });
    const prepared = prepareProfileMigration({ stateRoot, localHub: baseHub, createdAt: "2026-09-04T00:00:00.000Z" });
    authorProfile(prepared.bundle_root);
    const migration = await finalizeProfileMigration({ stateRoot, localHub: baseHub, sessionId: prepared.session_id,
      moves: [{ fromPath: "notes/legacy.md", toPath: "shared/knowledge/legacy.md" }] });
    await acceptHubProposal({ stateRoot, localHub: baseHub,
      proposalRoot: path.join(stateRoot, "proposals", migration.proposal.id),
      expectedDiffDigest: migration.proposal.diffDigest });
    const migrationCommit = git(hubRoot, ["rev-parse", "HEAD"]);

    const normalRoot = path.join(stateRoot, "proposals", "normal-candidate");
    const normalBase = path.join(root, "normal-base");
    fs.cpSync(hubRoot, normalBase, { recursive: true, filter: (source) => path.basename(source) !== ".git" });
    prepareBundleProposal({ currentBundleRoot: normalBase, proposalRoot: normalRoot,
      proposalId: "proposal-normal-candidate", evidenceDigest: `sha256:${"e".repeat(64)}`,
      createdAt: "2026-09-04T00:01:00.000Z" });
    write(path.join(normalRoot, "bundle"), "shared/knowledge/extra.md",
      "---\ntype: Legacy Note\ntitle: Extra\ndescription: Extra.\n---\n\n# Extra\n");
    fs.appendFileSync(path.join(normalRoot, "bundle", "shared", "index.md"), "\n* [Extra](knowledge/extra.md)\n");
    const entries = [
      { path: "shared/index.md", change: "modified" as const, allowed: true },
      { path: "shared/knowledge/extra.md", change: "created" as const, allowed: true },
    ];
    const ordinaryInspection = inspectHubProposal(entries,
      { baseRoot: normalBase, proposedRoot: path.join(normalRoot, "bundle") });
    const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(ordinaryInspection.entries)).digest("hex")}`;
    const normal = createHubProposal({ mode: "new", subject: "shared/knowledge/extra", baseCommit: migrationCommit,
      sourceRepositoryId: REPOSITORY_ID, evidenceDigest: `sha256:${"e".repeat(64)}`, schemaVersion: "7.0.0",
      selectedSchemas: ["Legacy Note"], treeDigest: computeOkfTreeDigest(path.join(normalRoot, "bundle")),
      diffDigest, localHubId: LOCAL_ID });
    writeHubProposalState(normalRoot, normal);
    const inspection = bindHubProposalInspection(ordinaryInspection,
      { baseRoot: normalBase, proposedRoot: path.join(normalRoot, "bundle"), proposal: normal });
    fs.cpSync(normalBase, path.join(normalRoot, "base"), { recursive: true });
    fs.writeFileSync(path.join(normalRoot, "inspection.json"), `${JSON.stringify(inspection, null, 2)}\n`);
    const advancedHub = createLocalOnlyHubState({ kind: "local-only", root: hubRoot, localHubId: LOCAL_ID,
      baseCommit, remoteBase: baseCommit, activeHead: migrationCommit, catalogVersion: "7.0.0" });
    await assert.rejects(acceptHubProposal({ stateRoot, localHub: advancedHub, proposalRoot: normalRoot,
      expectedDiffDigest: normal.diffDigest }), /blocked until the accepted Profile migration is published and synchronized/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
