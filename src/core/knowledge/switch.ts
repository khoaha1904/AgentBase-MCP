import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { computeOkfTreeDigest, loadOkfBundle } from "./okf-bundle.ts";
import { diffBundleProposal, readProposalMetadata } from "./proposal.ts";

export type SwitchPhase = "prepared" | "current-moved" | "next-active" | "finalized" | "recovery-required";

export type SwitchManifest = Readonly<{
  formatVersion: 1;
  operationId: string;
  phase: SwitchPhase;
  currentPath: string;
  nextPath: string;
  backupPath: string | null;
  currentTreeDigest: string;
  nextTreeDigest: string;
  backupTreeDigest: string | null;
  recoveryAction: "discard-next" | "restore-previous" | "finish-next" | "finalize-next";
}>;

export type ApplyBundleOptions = Readonly<{
  repositoryRoot: string;
  proposalRoot: string;
  owner: string;
  operationId?: string;
  interruptAfter?: Exclude<SwitchPhase, "recovery-required">;
}>;

export type RecoveryResult = Readonly<{
  action: SwitchManifest["recoveryAction"] | "none";
  activeTreeDigest: string;
}>;

const lockName = "okf.lock";
const manifestName = "okf-switch.json";

function paths(repositoryRoot: string) {
  const root = fs.realpathSync(repositoryRoot);
  const state = path.join(root, ".agentbase");
  fs.mkdirSync(state, { recursive: true, mode: 0o700 });
  fs.chmodSync(state, 0o700);
  return { root, state, current: path.join(root, "okf"), lock: path.join(state, lockName), manifest: path.join(state, manifestName) };
}

function acquireLock(lockPath: string, owner: string): () => void {
  if (!owner.trim()) throw new Error("lock owner must be non-empty");
  try {
    fs.mkdirSync(lockPath, { mode: 0o700 });
    fs.writeFileSync(path.join(lockPath, "owner.json"), `${JSON.stringify({ owner, pid: process.pid, acquiredAt: new Date().toISOString() })}\n`, {
      flag: "wx",
      mode: 0o600,
    });
  } catch (cause) {
    let heldBy = "unknown owner";
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(lockPath, "owner.json"), "utf8")) as { owner?: unknown };
      if (typeof parsed.owner === "string") heldBy = parsed.owner;
    } catch {
      // Keep the safe fallback; malformed lock state remains exclusive.
    }
    throw new Error(`OKF state is locked by ${heldBy}`, { cause });
  }
  return () => fs.rmSync(lockPath, { recursive: true, force: true });
}

function copyTree(source: string, target: string): void {
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isSymbolicLink()) throw new Error(`bundle symlink cannot be staged: ${entry.name}`);
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
  }
}

function writeManifest(file: string, manifest: SwitchManifest): void {
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  fs.renameSync(temporary, file);
}

function readManifest(file: string): SwitchManifest {
  const value = JSON.parse(fs.readFileSync(file, "utf8")) as SwitchManifest;
  if (value.formatVersion !== 1 || !["prepared", "current-moved", "next-active", "finalized", "recovery-required"].includes(value.phase)) {
    throw new Error("OKF recovery manifest is invalid");
  }
  return value;
}

function validateOwnedPath(root: string, candidate: string, prefix: string): void {
  const parent = path.dirname(candidate);
  if (parent !== root || !path.basename(candidate).startsWith(prefix)) throw new Error("recovery manifest contains an unowned path");
}

function persistPhase(file: string, manifest: SwitchManifest, phase: SwitchPhase): SwitchManifest {
  const recoveryAction: SwitchManifest["recoveryAction"] = phase === "prepared"
    ? "discard-next"
    : phase === "current-moved"
      ? manifest.backupPath ? "restore-previous" : "finish-next"
      : "finalize-next";
  const next = { ...manifest, phase, recoveryAction };
  writeManifest(file, next);
  return next;
}

function interrupt(options: ApplyBundleOptions, phase: SwitchPhase): void {
  if (options.interruptAfter === phase) throw new Error(`injected interruption after ${phase}`);
}

export function applyBundleProposal(options: ApplyBundleOptions): SwitchManifest {
  const currentPaths = paths(options.repositoryRoot);
  const release = acquireLock(currentPaths.lock, options.owner);
  try {
    if (fs.existsSync(currentPaths.manifest)) throw new Error("incomplete OKF switch requires recovery before apply");
    const metadata = readProposalMetadata(options.proposalRoot);
    const diff = diffBundleProposal(currentPaths.current, options.proposalRoot);
    if (!diff.applicable) throw new Error("proposal diff contains prohibited changes");
    const operationId = options.operationId ?? `switch-${randomUUID().replaceAll("-", "")}`;
    if (!/^switch-[a-z0-9-]{8,100}$/.test(operationId)) throw new Error("operationId is invalid");
    const nextPath = path.join(currentPaths.root, `.agentbase-okf-next-${operationId}`);
    const hadCurrent = fs.existsSync(currentPaths.current);
    const backupPath = hadCurrent ? path.join(currentPaths.root, `.agentbase-okf-backup-${operationId}`) : null;
    if (fs.existsSync(nextPath) || (backupPath && fs.existsSync(backupPath))) throw new Error("owned switch path already exists");
    copyTree(path.join(options.proposalRoot, "bundle"), nextPath);
    const nextTreeDigest = computeOkfTreeDigest(nextPath);
    if (nextTreeDigest !== metadata.generatedTreeDigest) throw new Error("staged next bundle does not match validated proposal");
    let manifest: SwitchManifest = {
      formatVersion: 1,
      operationId,
      phase: "prepared",
      currentPath: currentPaths.current,
      nextPath,
      backupPath,
      currentTreeDigest: metadata.baseTreeDigest,
      nextTreeDigest,
      backupTreeDigest: hadCurrent ? metadata.baseTreeDigest : null,
      recoveryAction: "discard-next",
    };
    writeManifest(currentPaths.manifest, manifest);
    interrupt(options, "prepared");
    if (backupPath) fs.renameSync(currentPaths.current, backupPath);
    manifest = persistPhase(currentPaths.manifest, manifest, "current-moved");
    interrupt(options, "current-moved");
    fs.renameSync(nextPath, currentPaths.current);
    manifest = persistPhase(currentPaths.manifest, manifest, "next-active");
    interrupt(options, "next-active");
    loadOkfBundle(currentPaths.current, { requireAgentBaseRootIndex: true });
    if (computeOkfTreeDigest(currentPaths.current) !== nextTreeDigest) throw new Error("active OKF digest does not match intended next bundle");
    manifest = persistPhase(currentPaths.manifest, manifest, "finalized");
    interrupt(options, "finalized");
    if (backupPath) fs.rmSync(backupPath, { recursive: true, force: true });
    fs.rmSync(currentPaths.manifest, { force: true });
    return manifest;
  } finally {
    release();
  }
}

export function recoverBundleSwitch(repositoryRoot: string, owner: string): RecoveryResult {
  const currentPaths = paths(repositoryRoot);
  const release = acquireLock(currentPaths.lock, owner);
  try {
    if (!fs.existsSync(currentPaths.manifest)) {
      return { action: "none", activeTreeDigest: computeOkfTreeDigest(currentPaths.current) };
    }
    const manifest = readManifest(currentPaths.manifest);
    if (manifest.currentPath !== currentPaths.current) throw new Error("recovery manifest current path is not this repository's OKF path");
    validateOwnedPath(currentPaths.root, manifest.nextPath, ".agentbase-okf-next-");
    if (manifest.backupPath) validateOwnedPath(currentPaths.root, manifest.backupPath, ".agentbase-okf-backup-");
    const action = manifest.recoveryAction;
    if (action === "discard-next") {
      if (fs.existsSync(manifest.nextPath)) fs.rmSync(manifest.nextPath, { recursive: true, force: true });
    } else if (action === "restore-previous") {
      if (!manifest.backupPath || !fs.existsSync(manifest.backupPath)) throw new Error("recovery backup is missing");
      if (fs.existsSync(manifest.nextPath)) fs.rmSync(manifest.nextPath, { recursive: true, force: true });
      if (fs.existsSync(currentPaths.current)) fs.rmSync(currentPaths.current, { recursive: true, force: true });
      fs.renameSync(manifest.backupPath, currentPaths.current);
      if (computeOkfTreeDigest(currentPaths.current) !== manifest.currentTreeDigest) throw new Error("restored OKF digest is invalid");
    } else if (action === "finish-next") {
      if (!fs.existsSync(currentPaths.current)) fs.renameSync(manifest.nextPath, currentPaths.current);
      if (computeOkfTreeDigest(currentPaths.current) !== manifest.nextTreeDigest) throw new Error("finished OKF digest is invalid");
    } else {
      if (!fs.existsSync(currentPaths.current) || computeOkfTreeDigest(currentPaths.current) !== manifest.nextTreeDigest) {
        throw new Error("active next bundle is missing or invalid");
      }
      if (fs.existsSync(manifest.nextPath)) fs.rmSync(manifest.nextPath, { recursive: true, force: true });
      if (manifest.backupPath && fs.existsSync(manifest.backupPath)) fs.rmSync(manifest.backupPath, { recursive: true, force: true });
    }
    fs.rmSync(currentPaths.manifest, { force: true });
    return { action, activeTreeDigest: computeOkfTreeDigest(currentPaths.current) };
  } finally {
    release();
  }
}
