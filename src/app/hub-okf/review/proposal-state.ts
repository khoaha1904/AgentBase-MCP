import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { hubProfileId, type AdmittedLocalHubState, type AnyHubProposal } from "../../../core/hub/index.ts";

export type HubMutationLock = Readonly<{
  root: string;
  profileId: string;
  ownerId: string;
  pid: number;
  acquiredAt: string;
  nonce: string;
}>;

type LockRecord = Omit<HubMutationLock, "root"> & Readonly<{ schemaVersion: 1 }>;

const statePath = (proposalRoot: string) => path.join(proposalRoot, "hub-proposal.json");

export function writeHubProposalState(proposalRoot: string, proposal: AnyHubProposal): void {
  fs.mkdirSync(proposalRoot, { recursive: true, mode: 0o700 });
  const target = statePath(proposalRoot);
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(proposal, null, 2)}\n`, { mode: 0o600, flag: "w" });
  fs.renameSync(temporary, target);
}

export function readHubProposalState(proposalRoot: string): AnyHubProposal {
  const value = JSON.parse(fs.readFileSync(statePath(proposalRoot), "utf8")) as AnyHubProposal;
  if (!value.id || !value.branch || !["prepared", "committed", "pushed", "pr-opened"].includes(value.phase)) {
    throw new Error("Hub proposal state is invalid");
  }
  if (!/^[a-f0-9]{24}$/.test(value.id) || value.branch !== `agentbase/okf-${value.id}`
    || ("hub" in value && value.hub && value.branch === value.hub.targetBranch)
    || (!("hub" in value) && !/^[a-f0-9]{24}$/.test(value.localHubId))) {
    throw new Error("Hub proposal branch identity is invalid");
  }
  return value;
}

function processIsAlive(pid: number): boolean {
  try { process.kill(pid, 0); return true; }
  catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") return false;
    if (code === "EPERM") return true;
    throw new Error("Hub mutation lock process state is ambiguous", { cause: error });
  }
}

function owner(stat: fs.Stats): boolean {
  return typeof process.getuid !== "function" || stat.uid === process.getuid();
}

function admitLockParent(parent: string): void {
  if (fs.existsSync(parent)) {
    const current = fs.lstatSync(parent);
    if (current.isSymbolicLink() || !current.isDirectory() || !owner(current)) {
      throw new Error("Hub mutation lock parent is unsafe");
    }
  } else {
    fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  }
  fs.chmodSync(parent, 0o700);
  const admitted = fs.lstatSync(parent);
  if (admitted.isSymbolicLink() || !admitted.isDirectory() || !owner(admitted)
    || (admitted.mode & 0o777) !== 0o700) {
    throw new Error("Hub mutation lock parent is unsafe");
  }
}

function exactEntries(root: string, allowReclaim = false): void {
  const allowed = allowReclaim ? ["owner.json", "reclaim"] : ["owner.json"];
  const entries = fs.readdirSync(root).sort();
  if (entries.length !== allowed.length || entries.some((entry, index) => entry !== allowed[index])) {
    throw new Error("Hub mutation lock contains unknown state");
  }
}

function admitDirectory(root: string, allowReclaim = false): void {
  const stat = fs.lstatSync(root);
  if (stat.isSymbolicLink() || !stat.isDirectory() || !owner(stat) || (stat.mode & 0o777) !== 0o700) {
    throw new Error("Hub mutation lock directory is unsafe");
  }
  exactEntries(root, allowReclaim);
}

function readOwnerFile(root: string): unknown {
  const file = path.join(root, "owner.json"), stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile() || !owner(stat) || (stat.mode & 0o777) !== 0o600
    || stat.size < 2 || stat.size > 4096) {
    throw new Error("Hub mutation lock owner file is unsafe");
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
}

function parseCurrentRecord(value: unknown, profileId: string): LockRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Hub mutation lock metadata is invalid");
  const record = value as Record<string, unknown>;
  if (Object.keys(record).sort().join(",") !== "acquiredAt,nonce,ownerId,pid,profileId,schemaVersion"
    || record.schemaVersion !== 1 || record.profileId !== profileId
    || typeof record.ownerId !== "string" || !/^[A-Za-z0-9._:-]{8,128}$/.test(record.ownerId)
    || typeof record.pid !== "number" || !Number.isSafeInteger(record.pid) || record.pid <= 0
    || typeof record.acquiredAt !== "string" || !Number.isFinite(Date.parse(record.acquiredAt))
    || typeof record.nonce !== "string" || !/^[a-f0-9]{32}$/.test(record.nonce)) {
    throw new Error("Hub mutation lock metadata is invalid");
  }
  return record as LockRecord;
}

function parseLegacyRecord(value: unknown): Readonly<{ ownerId: string; pid: number }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("legacy Hub mutation lock metadata is invalid");
  const record = value as Record<string, unknown>;
  if (Object.keys(record).sort().join(",") !== "ownerId,pid"
    || typeof record.ownerId !== "string" || !/^[A-Za-z0-9._:-]{8,128}$/.test(record.ownerId)
    || typeof record.pid !== "number" || !Number.isSafeInteger(record.pid) || record.pid <= 0) {
    throw new Error("legacy Hub mutation lock metadata is invalid");
  }
  return record as { ownerId: string; pid: number };
}

function readCurrentLock(root: string, profileId: string, allowReclaim = false): LockRecord {
  admitDirectory(root, allowReclaim);
  return parseCurrentRecord(readOwnerFile(root), profileId);
}

function readLegacyLock(root: string, allowReclaim = false): Readonly<{ ownerId: string; pid: number }> {
  admitDirectory(root, allowReclaim);
  return parseLegacyRecord(readOwnerFile(root));
}

function sameRecord(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function reclaimStaleLock<T>(root: string, expected: T, read: (allowReclaim: boolean) => T): void {
  const claim = path.join(root, "reclaim");
  let descriptor: number | undefined;
  let ownsClaim = false;
  try {
    descriptor = fs.openSync(claim, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY, 0o600);
    ownsClaim = true;
    fs.writeFileSync(descriptor, `${process.pid}\n`);
    fs.fsyncSync(descriptor);
    if (!sameRecord(read(true), expected)) throw new Error("Hub mutation lock changed during stale recovery");
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.rmSync(root, { recursive: true, force: false });
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (ownsClaim && fs.existsSync(claim)) {
      try { fs.rmSync(claim, { force: false }); } catch { /* Preserve the winning reclaimer's state. */ }
    }
    throw new Error("another AgentBase-Hub mutation owns the local lock", { cause: error });
  }
}

function admitOrReclaimLegacyLock(stateRoot: string): void {
  const root = path.join(path.resolve(stateRoot), "mutation.lock");
  if (!fs.existsSync(root)) return;
  let record: ReturnType<typeof readLegacyLock>;
  try { record = readLegacyLock(root); }
  catch (error) { throw new Error("legacy AgentBase-Hub mutation lock requires owner repair", { cause: error }); }
  if (processIsAlive(record.pid)) throw new Error("another AgentBase-Hub mutation owns the legacy local lock");
  reclaimStaleLock(root, record, (allowReclaim) => readLegacyLock(root, allowReclaim));
}

export function hubMutationProfileId(localHub: AdmittedLocalHubState): string {
  return localHub.kind === "local-only" ? localHub.localHubId : hubProfileId(localHub.hub);
}

export function acquireHubMutationLock(
  stateRoot: string,
  profileId: string,
  ownerId: string,
): HubMutationLock {
  if (!/^[a-f0-9]{24}$/.test(profileId)) throw new Error("Hub mutation lock profile is invalid");
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(ownerId)) throw new Error("Hub mutation lock owner is invalid");
  admitOrReclaimLegacyLock(stateRoot);
  const parent = path.join(path.resolve(stateRoot), "mutation-locks");
  admitLockParent(parent);
  const root = path.join(parent, `${profileId}.lock`);
  if (fs.existsSync(root)) {
    let record: LockRecord;
    try { record = readCurrentLock(root, profileId); }
    catch (error) { throw new Error("AgentBase-Hub profile lock requires owner repair", { cause: error }); }
    if (processIsAlive(record.pid)) throw new Error("another AgentBase-Hub mutation owns the local profile lock");
    reclaimStaleLock(root, record, (allowReclaim) => readCurrentLock(root, profileId, allowReclaim));
  }
  const record: LockRecord = {
    schemaVersion: 1,
    profileId,
    ownerId,
    pid: process.pid,
    acquiredAt: new Date().toISOString(),
    nonce: randomBytes(16).toString("hex"),
  };
  const staging = `${root}.candidate-${process.pid}-${record.nonce}`;
  try {
    fs.mkdirSync(staging, { mode: 0o700 });
    const ownerFile = path.join(staging, "owner.json");
    fs.writeFileSync(ownerFile, `${JSON.stringify(record)}\n`, { mode: 0o600, flag: "wx" });
    const descriptor = fs.openSync(ownerFile, fs.constants.O_RDONLY);
    try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
    fs.renameSync(staging, root);
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    if (fs.existsSync(root)) throw new Error("another AgentBase-Hub mutation owns the local lock", { cause: error });
    throw error;
  }
  return { root, profileId, ownerId, pid: record.pid, acquiredAt: record.acquiredAt, nonce: record.nonce };
}

export function releaseHubMutationLock(lock: HubMutationLock): void {
  const current = readCurrentLock(lock.root, lock.profileId);
  const expected: LockRecord = { schemaVersion: 1, profileId: lock.profileId, ownerId: lock.ownerId,
    pid: lock.pid, acquiredAt: lock.acquiredAt, nonce: lock.nonce };
  if (!sameRecord(current, expected)) throw new Error("AgentBase-Hub mutation lock ownership changed");
  fs.rmSync(lock.root, { recursive: true, force: false });
}

export function writeAtomicJson(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "w" });
  fs.renameSync(temporary, target);
}
