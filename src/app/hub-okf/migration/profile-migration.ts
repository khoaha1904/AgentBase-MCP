import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  createHubProposal,
  hubProfileId,
  type AdmittedLocalHubState,
  type AnyHubProposal,
} from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_PROFILE_PATH,
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  classifyAgentBaseHubProfile,
  conceptIdentityFromPath,
  computeOkfTreeDigest,
  loadOkfBundle,
  prepareBundleProposal,
} from "../../../core/knowledge/index.ts";
import { validateHubCi } from "../ci/validation.ts";
import {
  bindHubProposalInspection,
  inspectHubProposal,
  type HubChangeEntry,
  type HubProposalInspection,
} from "../review/inspect.ts";
import { writeHubProposalState } from "../review/proposal-state.ts";

const SESSION_FORMAT = 1 as const;
const MANIFEST_FORMAT = 1 as const;
const MAXIMUM_MOVES = 4096;

export type ProfileMigrationMove = Readonly<{ fromPath: string; toPath: string }>;

export type ProfileMigrationSession = Readonly<{
  formatVersion: typeof SESSION_FORMAT;
  id: string;
  profileId: string;
  checkoutRoot: string;
  root: string;
  baseRoot: string;
  bundleRoot: string;
  baseCommit: string;
  baseTreeDigest: string;
  createdAt: string;
}>;

export type ProfileMigrationManifest = Readonly<{
  formatVersion: typeof MANIFEST_FORMAT;
  sessionId: string;
  fromProfile: "legacy-unprofiled";
  toProfile: "profile-1.0";
  rollbackCommit: string;
  baseTreeDigest: string;
  proposedTreeDigest: string;
  moves: readonly ProfileMigrationMove[];
  addedPaths: readonly string[];
  updatedPaths: readonly string[];
  removedPaths: readonly string[];
}>;

export type RetainedProfileMigrationManifest = ProfileMigrationManifest & Readonly<{ digest: string }>;

export type PreparedProfileMigration = Readonly<{
  session_id: string;
  profile: "legacy-unprofiled";
  rollback_commit: string;
  base_tree_digest: string;
  bundle_root: string;
  files: readonly string[];
  concepts: readonly Readonly<{ identity: string; path: string; type: string }>[];
  authoring_constraints: readonly string[];
}>;

export type FinalizedProfileMigration = Readonly<{
  proposal: AnyHubProposal;
  inspection: HubProposalInspection;
  migration: RetainedProfileMigrationManifest;
}>;

function digest(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function profileId(localHub: AdmittedLocalHubState): string {
  return localHub.kind === "local-only" ? localHub.localHubId : hubProfileId(localHub.hub);
}

function privateDirectory(directory: string): void {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory() || (stat.mode & 0o777) !== 0o700) {
    throw new Error("Profile migration state directory is unsafe");
  }
}

function copyTree(source: string, target: string): void {
  privateDirectory(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name === ".git") continue;
    if (entry.isSymbolicLink()) throw new Error(`Profile migration cannot copy symlink: ${entry.name}`);
    const from = path.join(source, entry.name), to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
  }
}

function writeJson(target: string, value: unknown): void {
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "w" });
  fs.renameSync(temporary, target);
}

function normalizedPath(value: string, label: string): string {
  if (!value || value.length > 512 || value.startsWith("/") || value.includes("\\") || value.includes("\0")) {
    throw new Error(`${label} must be a normalized bundle-relative path`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === "." || normalized.startsWith("../") || value.split("/").some((part) => !part)) {
    throw new Error(`${label} must be a normalized bundle-relative path`);
  }
  return value;
}

function sessionPath(stateRoot: string, sessionId: string): string {
  if (!/^profile-migration-[a-f0-9]{24}$/.test(sessionId)) throw new Error("Profile migration session ID is invalid");
  return path.join(path.resolve(stateRoot), "profile-migrations", sessionId);
}

function readSession(stateRoot: string, sessionId: string, localHub: AdmittedLocalHubState): ProfileMigrationSession {
  const root = sessionPath(stateRoot, sessionId);
  const value = JSON.parse(fs.readFileSync(path.join(root, "session.json"), "utf8")) as ProfileMigrationSession;
  const expectedBase = path.join(root, "base"), expectedBundle = path.join(root, "bundle");
  if (value.formatVersion !== SESSION_FORMAT || value.id !== sessionId || value.root !== root
    || value.baseRoot !== expectedBase || value.bundleRoot !== expectedBundle
    || value.checkoutRoot !== path.resolve(localHub.root) || value.profileId !== profileId(localHub)
    || !/^[a-f0-9]{40}$/.test(value.baseCommit) || !/^sha256:[a-f0-9]{64}$/.test(value.baseTreeDigest)
    || !Number.isFinite(Date.parse(value.createdAt))) {
    throw new Error("Profile migration session state is invalid");
  }
  if (computeOkfTreeDigest(expectedBase) !== value.baseTreeDigest) {
    throw new Error("Profile migration base snapshot changed after Prepare");
  }
  const baseAdmission = classifyAgentBaseHubProfile(loadOkfBundle(expectedBase, { requireAgentBaseRootIndex: true }));
  if (baseAdmission.kind !== "legacy-unprofiled") throw new Error("Profile migration base is no longer legacy-unprofiled");
  return value;
}

function preparedResult(session: ProfileMigrationSession): PreparedProfileMigration {
  const base = loadOkfBundle(session.baseRoot, { requireAgentBaseRootIndex: true });
  return {
    session_id: session.id,
    profile: "legacy-unprofiled",
    rollback_commit: session.baseCommit,
    base_tree_digest: session.baseTreeDigest,
    bundle_root: session.bundleRoot,
    files: base.files,
    concepts: [...base.concepts.values()].map((concept) => ({
      identity: concept.conceptId, path: concept.path, type: concept.type,
    })),
    authoring_constraints: [
      "Assign every concept one explicit domains/<slug>/ or shared/ home; physical home does not imply Domain participation.",
      "Add the exact Profile 1.0 declaration and complete root/shared/capsule navigation.",
      "Rewrite exact Markdown links, relationship endpoints, Flow steps, Question subjects and owned references affected by identity moves.",
      "Do not delete knowledge; declare every moved file during Finalize.",
    ],
  };
}

function assertUncontendedBase(localHub: AdmittedLocalHubState): void {
  if (localHub.activeHead !== localHub.remoteBase) {
    throw new Error("Profile migration requires an exact Published head with no pending local proposal");
  }
}

export function prepareProfileMigration(options: Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  createdAt?: string;
}>): PreparedProfileMigration {
  assertUncontendedBase(options.localHub);
  const createdAt = options.createdAt ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(createdAt))) throw new Error("Profile migration creation time is invalid");
  const parent = path.join(path.resolve(options.stateRoot), "profile-migrations");
  privateDirectory(parent);
  const staging = fs.mkdtempSync(path.join(parent, ".prepare-"));
  try {
    fs.chmodSync(staging, 0o700);
    copyTree(options.localHub.root, path.join(staging, "base"));
    const base = loadOkfBundle(path.join(staging, "base"), { requireAgentBaseRootIndex: true });
    const admission = classifyAgentBaseHubProfile(base);
    if (admission.kind !== "legacy-unprofiled") {
      throw new Error(admission.kind === "profile-1.0" ? "Hub already uses AgentBase OKF Profile 1.0"
        : `Hub Profile is unsupported: ${admission.failures.join("; ")}`);
    }
    const id = `profile-migration-${createHash("sha256").update([
      profileId(options.localHub), options.localHub.activeHead, base.treeDigest,
    ].join("\0")).digest("hex").slice(0, 24)}`;
    const root = sessionPath(options.stateRoot, id);
    if (fs.existsSync(root)) {
      fs.rmSync(staging, { recursive: true, force: true });
      return preparedResult(readSession(options.stateRoot, id, options.localHub));
    }
    const session: ProfileMigrationSession = {
      formatVersion: SESSION_FORMAT,
      id,
      profileId: profileId(options.localHub),
      checkoutRoot: path.resolve(options.localHub.root),
      root,
      baseRoot: path.join(root, "base"),
      bundleRoot: path.join(root, "bundle"),
      baseCommit: options.localHub.activeHead,
      baseTreeDigest: base.treeDigest,
      createdAt,
    };
    copyTree(path.join(staging, "base"), path.join(staging, "bundle"));
    writeJson(path.join(staging, "session.json"), session);
    fs.renameSync(staging, root);
    return preparedResult(session);
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function normalizedMoves(values: readonly ProfileMigrationMove[]): readonly ProfileMigrationMove[] {
  if (values.length > MAXIMUM_MOVES) {
    throw new Error(`Profile migration accepts at most ${MAXIMUM_MOVES} exact file moves`);
  }
  const moves = values.map((move, index) => ({
    fromPath: normalizedPath(move.fromPath, `migration move ${index + 1} from_path`),
    toPath: normalizedPath(move.toPath, `migration move ${index + 1} to_path`),
  })).sort((left, right) => left.fromPath.localeCompare(right.fromPath));
  if (moves.some((move) => move.fromPath === move.toPath)
    || new Set(moves.map((move) => move.fromPath)).size !== moves.length
    || new Set(moves.map((move) => move.toPath)).size !== moves.length) {
    throw new Error("Profile migration moves must have unique, different sources and targets");
  }
  return moves;
}

function fileBytes(root: string, relative: string): Buffer {
  return fs.readFileSync(path.join(root, ...relative.split("/")));
}

function migrationChanges(
  baseRoot: string,
  proposedRoot: string,
  moves: readonly ProfileMigrationMove[],
): Readonly<{ entries: readonly HubChangeEntry[]; added: readonly string[]; updated: readonly string[]; removed: readonly string[] }> {
  const base = loadOkfBundle(baseRoot, { requireAgentBaseRootIndex: true });
  const proposed = loadOkfBundle(proposedRoot, { requireAgentBaseRootIndex: true });
  const baseFiles = new Set(base.files), proposedFiles = new Set(proposed.files);
  const bySource = new Map(moves.map((move) => [move.fromPath, move]));
  const targets = new Set(moves.map((move) => move.toPath));
  const removed = base.files.filter((relative) => !proposedFiles.has(relative));
  const added = proposed.files.filter((relative) => !baseFiles.has(relative));
  const updated = base.files.filter((relative) => proposedFiles.has(relative)
    && !fileBytes(baseRoot, relative).equals(fileBytes(proposedRoot, relative)));

  if (removed.some((relative) => !bySource.has(relative)) || moves.some((move) => !removed.includes(move.fromPath))) {
    throw new Error("every removed base file must have one exact migration move");
  }
  for (const move of moves) {
    if (!baseFiles.has(move.fromPath) || proposedFiles.has(move.fromPath)
      || baseFiles.has(move.toPath) || !proposedFiles.has(move.toPath)) {
      throw new Error(`migration move does not bind one removed source to one new target: ${move.fromPath} -> ${move.toPath}`);
    }
    const sourceConcept = base.concepts.get(move.fromPath.endsWith(".md") ? conceptIdentityFromPath(move.fromPath) : "");
    const targetConcept = proposed.concepts.get(move.toPath.endsWith(".md") ? conceptIdentityFromPath(move.toPath) : "");
    if (Boolean(sourceConcept) !== Boolean(targetConcept) || sourceConcept && targetConcept && sourceConcept.type !== targetConcept.type) {
      throw new Error(`migration move must preserve concept kind and type: ${move.fromPath} -> ${move.toPath}`);
    }
    if (!sourceConcept && !fileBytes(baseRoot, move.fromPath).equals(fileBytes(proposedRoot, move.toPath))) {
      throw new Error(`moved non-concept file must preserve exact bytes: ${move.fromPath}`);
    }
  }
  for (const relative of added.filter((item) => !targets.has(item))) {
    if (path.posix.basename(relative) === "index.md") continue;
    const concept = proposed.concepts.get(relative.endsWith(".md") ? conceptIdentityFromPath(relative) : "");
    if (relative === AGENTBASE_OKF_PROFILE_PATH || concept?.type === "Domain") continue;
    throw new Error(`migration contains an undeclared added file: ${relative}`);
  }

  const paths = [...new Set([...base.files, ...proposed.files])].sort();
  const entries: HubChangeEntry[] = paths.map((relative) => {
    if (!baseFiles.has(relative)) return { path: relative, change: "created", allowed: true };
    if (!proposedFiles.has(relative)) return { path: relative, change: "migration-move-source", allowed: true,
      reason: `moved to ${bySource.get(relative)!.toPath}` };
    if (fileBytes(baseRoot, relative).equals(fileBytes(proposedRoot, relative))) {
      return { path: relative, change: "preserved", allowed: true };
    }
    return { path: relative, change: "modified", allowed: true,
      reason: "reviewed Profile migration update" };
  });
  return { entries, added, updated, removed };
}

export async function finalizeProfileMigration(options: Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  sessionId: string;
  moves: readonly ProfileMigrationMove[];
}>): Promise<FinalizedProfileMigration> {
  assertUncontendedBase(options.localHub);
  const session = readSession(options.stateRoot, options.sessionId, options.localHub);
  if (session.baseCommit !== options.localHub.activeHead) {
    throw new Error("Hub authority changed after Profile migration Prepare");
  }
  const proposed = loadOkfBundle(session.bundleRoot, { requireAgentBaseRootIndex: true });
  const admission = classifyAgentBaseHubProfile(proposed);
  if (admission.kind !== "profile-1.0") {
    throw new Error(`Profile migration target is not admitted Profile 1.0: ${admission.kind === "unsupported"
      ? admission.failures.join("; ") : "Profile declaration is missing"}`);
  }
  const moves = normalizedMoves(options.moves);
  const changes = migrationChanges(session.baseRoot, session.bundleRoot, moves);
  const integrity = await validateHubCi(session.bundleRoot, () => new Date(0), { requireSupportCi: false });
  if (!integrity.passed) throw new Error(`Profile migration target failed Hub integrity: ${integrity.errors.join("; ")}`);

  const manifest: ProfileMigrationManifest = {
    formatVersion: MANIFEST_FORMAT,
    sessionId: session.id,
    fromProfile: "legacy-unprofiled",
    toProfile: "profile-1.0",
    rollbackCommit: session.baseCommit,
    baseTreeDigest: session.baseTreeDigest,
    proposedTreeDigest: proposed.treeDigest,
    moves,
    addedPaths: changes.added,
    updatedPaths: changes.updated,
    removedPaths: changes.removed,
  };
  const migrationDigest = digest(manifest), retained = { ...manifest, digest: migrationDigest };
  const staging = path.join(path.resolve(options.stateRoot), "proposals", `.staging-${session.id}`);
  if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
  try {
    prepareBundleProposal({ currentBundleRoot: session.baseRoot, proposalRoot: staging,
      proposalId: `proposal-${session.id.slice(-24)}`, evidenceDigest: migrationDigest, createdAt: session.createdAt });
    fs.rmSync(path.join(staging, "bundle"), { recursive: true, force: true });
    copyTree(session.bundleRoot, path.join(staging, "bundle"));
    const ordinaryInspection = inspectHubProposal(changes.entries,
      { baseRoot: session.baseRoot, proposedRoot: session.bundleRoot });
    const diffDigest = digest(ordinaryInspection.entries);
    const common = {
      mode: "migration" as const,
      subject: "shared/agentbase-profile",
      baseCommit: session.baseCommit,
      evidenceDigest: migrationDigest,
      migrationDigest,
      schemaVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
      selectedSchemas: [...new Set([...proposed.concepts.values()].map((concept) => concept.type))].sort(),
      treeDigest: proposed.treeDigest,
      diffDigest,
    };
    const proposal = options.localHub.kind === "local-only"
      ? createHubProposal({ ...common, localHubId: options.localHub.localHubId })
      : createHubProposal({ ...common, hub: options.localHub.hub });
    writeHubProposalState(staging, proposal);
    const inspection = bindHubProposalInspection(ordinaryInspection, {
      baseRoot: session.baseRoot, proposedRoot: session.bundleRoot, proposal,
    });
    copyTree(session.baseRoot, path.join(staging, "base"));
    writeJson(path.join(staging, "inspection.json"), inspection);
    writeJson(path.join(staging, "profile-migration.json"), retained);
    writeJson(path.join(staging, "runtime.json"), { checkoutRoot: options.localHub.root });
    const target = path.join(path.resolve(options.stateRoot), "proposals", proposal.id);
    if (fs.existsSync(target)) throw new Error("matching Profile migration proposal already exists");
    fs.renameSync(staging, target);
    fs.rmSync(session.root, { recursive: true, force: true });
    return { proposal, inspection, migration: retained };
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

export function profileMigrationDigest(manifest: ProfileMigrationManifest): string {
  return digest(manifest);
}

export function verifyRetainedProfileMigration(
  baseRoot: string,
  proposedRoot: string,
  retained: RetainedProfileMigrationManifest,
): void {
  const moves = normalizedMoves(retained.moves);
  const changes = migrationChanges(baseRoot, proposedRoot, moves);
  const expected: ProfileMigrationManifest = {
    formatVersion: MANIFEST_FORMAT,
    sessionId: retained.sessionId,
    fromProfile: "legacy-unprofiled",
    toProfile: "profile-1.0",
    rollbackCommit: retained.rollbackCommit,
    baseTreeDigest: computeOkfTreeDigest(baseRoot),
    proposedTreeDigest: computeOkfTreeDigest(proposedRoot),
    moves,
    addedPaths: changes.added,
    updatedPaths: changes.updated,
    removedPaths: changes.removed,
  };
  const { digest: retainedDigest, ...manifest } = retained;
  if (JSON.stringify(manifest) !== JSON.stringify(expected) || profileMigrationDigest(expected) !== retainedDigest) {
    throw new Error("retained Profile migration manifest does not match the reviewed trees");
  }
}
