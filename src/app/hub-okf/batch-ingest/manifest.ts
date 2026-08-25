import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, TERRAFORM_FAMILY_DETECTOR_PROFILE,
  type ConfirmedDomain,
} from "../../../core/knowledge/index.ts";

export type BatchSourceState = Readonly<{ commit: string | null; dirty: boolean; dirtyDigest: string | null }>;
export type BatchMember = Readonly<{
  id: string;
  order: number;
  root: string;
  analysisRoot: string;
  repositoryId: string;
  displayName: string;
  source: BatchSourceState;
  sourceAuthority: Readonly<{
    remote: string;
    defaultBranch: string;
    commit: string;
    kind: "current-checkout" | "detached-worktree";
  }>;
  identityStatus: "new" | "existing" | "ambiguous";
  documentPaths: readonly string[];
  warnings: readonly string[];
  domainAssessment?: Readonly<{ decision: "match" | "override"; evidencePath: string }>;
}>;
export type BatchIngestManifest = Readonly<{
  formatVersion: 1;
  id: string;
  revision: number;
  confirmed: boolean;
  baseCommit: string;
  domain: ConfirmedDomain;
  members: readonly BatchMember[];
  catalogVersion: string;
  detectorVersions: Readonly<Record<string, string>>;
  createdAt: string;
  digest: string;
}>;

const COMMIT = /^[a-f0-9]{40}$/;
const REPOSITORY = /^repository-[a-z0-9-]+-[a-f0-9]{12}$/;
const MEMBER = /^batch-member-[a-f0-9]{24}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;

function digest(value: Omit<BatchIngestManifest, "digest">): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function validateMembers(members: readonly BatchMember[], confirmed: boolean): void {
  if (members.length < 2 || members.length > 32) throw new Error("Batch Initial Ingest requires 2-32 repositories");
  const roots = members.map((member) => path.resolve(member.root));
  if (new Set(roots).size !== roots.length || new Set(members.map((member) => member.repositoryId)).size !== members.length
    || new Set(members.map((member) => member.id)).size !== members.length) throw new Error("batch membership contains duplicates");
  for (const [index, member] of members.entries()) {
    if (!MEMBER.test(member.id) || member.order !== index || !path.isAbsolute(member.root)
      || !path.isAbsolute(member.analysisRoot)
      || !REPOSITORY.test(member.repositoryId) || !member.displayName.trim()
      || !COMMIT.test(member.source.commit ?? "") || member.source.dirty || member.source.dirtyDigest !== null
      || member.sourceAuthority.commit !== member.source.commit
      || !/^https:\/\/[A-Za-z0-9.-]+\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(member.sourceAuthority.remote)
      || !member.sourceAuthority.defaultBranch
      || !["current-checkout", "detached-worktree"].includes(member.sourceAuthority.kind)) {
      throw new Error(`batch member is invalid: ${member.id}`);
    }
    if (confirmed && (member.identityStatus !== "new" || !member.domainAssessment
      || !member.documentPaths.includes(member.domainAssessment.evidencePath))) {
      throw new Error(`batch member is not confirmable: ${member.id}`);
    }
    for (const other of roots) if (other !== roots[index]
      && (other.startsWith(`${roots[index]}${path.sep}`) || roots[index]!.startsWith(`${other}${path.sep}`))) {
      throw new Error("batch repository roots cannot be nested");
    }
  }
}

export function buildBatchManifest(input: Readonly<{
  baseCommit: string;
  domain: ConfirmedDomain;
  members: readonly BatchMember[];
  createdAt: string;
  confirmed?: boolean;
  prior?: BatchIngestManifest;
}>): BatchIngestManifest {
  if (!COMMIT.test(input.baseCommit) || !/^domains\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.domain.identity)
    || !Number.isFinite(Date.parse(input.createdAt))) throw new Error("batch manifest scope is invalid");
  if (input.prior && (input.prior.baseCommit !== input.baseCommit
    || input.prior.domain.identity !== input.domain.identity)) throw new Error("batch revision cannot change base or Domain");
  const members = input.members.map((member, order) => ({ ...member, order }));
  const confirmed = input.confirmed ?? false;
  validateMembers(members, confirmed);
  const revision = input.prior ? input.prior.revision + 1 : 1;
  const id = input.prior?.id ?? `batch-ingest-${createHash("sha256").update(JSON.stringify([
    input.baseCommit, input.domain.identity, input.createdAt, members.map((member) => member.repositoryId),
  ])).digest("hex").slice(0, 24)}`;
  const value: Omit<BatchIngestManifest, "digest"> = {
    formatVersion: 1, id, revision, confirmed, baseCommit: input.baseCommit,
    domain: input.domain, members, catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
    detectorVersions: { [TERRAFORM_FAMILY_DETECTOR_PROFILE.id]: TERRAFORM_FAMILY_DETECTOR_PROFILE.version },
    createdAt: input.createdAt,
  };
  return { ...value, digest: digest(value) };
}

export function writeBatchManifest(stateRoot: string, manifest: BatchIngestManifest): void {
  const root = path.join(path.resolve(stateRoot), "batch-ingests", manifest.id);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const target = path.join(root, `manifest-${manifest.revision}.json`), temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

export function readBatchManifest(stateRoot: string, id: string, revision: number): BatchIngestManifest {
  if (!/^batch-ingest-[a-f0-9]{24}$/.test(id) || !Number.isSafeInteger(revision) || revision < 1) {
    throw new Error("batch manifest identity is invalid");
  }
  const value = JSON.parse(fs.readFileSync(path.join(path.resolve(stateRoot), "batch-ingests", id,
    `manifest-${revision}.json`), "utf8")) as BatchIngestManifest;
  const { digest: stored, ...unsigned } = value;
  validateMembers(value.members, value.confirmed);
  if (value.formatVersion !== 1 || value.id !== id || value.revision !== revision || !DIGEST.test(stored)
    || value.catalogVersion !== AGENTBASE_OKF_SCHEMA_CATALOG_VERSION
    || value.detectorVersions?.[TERRAFORM_FAMILY_DETECTOR_PROFILE.id] !== TERRAFORM_FAMILY_DETECTOR_PROFILE.version
    || digest(unsigned) !== stored) throw new Error("batch manifest state is invalid");
  return value;
}

export function batchMemberId(repositoryId: string, root: string): string {
  return `batch-member-${createHash("sha256").update(`${repositoryId}\0${path.resolve(root)}`).digest("hex").slice(0, 24)}`;
}
