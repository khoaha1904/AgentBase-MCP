import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { AnyHubProposal, HubIdentity } from "../../core/hub/index.ts";
import { normalizeConfirmedDomain, type ConfirmedDomain } from "../../core/knowledge/index.ts";
import { inspectHubProposal, type HubLifecycleEntry, type HubProposalInspection } from "./inspect.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { prepareRefreshHubProposal, type HubSupersession } from "./refresh.ts";

export type HubAuthoringSession = Readonly<{
  formatVersion: 1;
  id: string;
  mode: "new" | "refresh";
  hub?: HubIdentity;
  localHubId?: string;
  baseCommit: string;
  sourceRepositoryId: string;
  evidenceDigest: string;
  subjectDirectory: string;
  confirmedDomain?: ConfirmedDomain;
  signals: readonly string[];
  selectedSchemas: readonly string[];
  root: string;
  bundleRoot: string;
  baseRoot: string;
  checkoutRoot: string;
  createdAt: string;
  supersessions: readonly HubSupersession[];
}>;

export type BeginHubAuthoringOptions = Readonly<{
  stateRoot: string;
  mode: "new" | "refresh";
  hub?: HubIdentity;
  localHubId?: string;
  baseCommit: string;
  checkoutRoot: string;
  sourceRepositoryId: string;
  evidenceDigest: string;
  subjectDirectory: string;
  confirmedDomain?: ConfirmedDomain;
  signals: readonly string[];
  selectedSchemas: readonly string[];
  createdAt: string;
  supersessions?: readonly HubSupersession[];
}>;

function privateDirectory(directory: string): void {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error("Hub state cannot cross a symlink");
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
}

function copyCheckout(source: string, target: string): void {
  privateDirectory(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    if (entry.isSymbolicLink()) throw new Error("Hub checkout content cannot contain symlinks");
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  }
}

export function beginHubAuthoringSession(options: BeginHubAuthoringOptions): HubAuthoringSession {
  const authority = options.hub?.repository ?? options.localHubId;
  if (!authority || (!options.hub && !/^[a-f0-9]{24}$/.test(options.localHubId ?? ""))) throw new Error("Hub authoring authority is invalid");
  const seed = [options.mode, authority, options.baseCommit, options.sourceRepositoryId,
    options.evidenceDigest, options.subjectDirectory, options.confirmedDomain?.identity ?? "",
    options.confirmedDomain?.title ?? ""].join("\0");
  const id = `hub-session-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
  const root = path.join(path.resolve(options.stateRoot), "sessions", id);
  if (fs.existsSync(root)) throw new Error("matching Hub authoring session already exists");
  const baseRoot = path.join(root, "base"), bundleRoot = path.join(root, "bundle");
  privateDirectory(path.dirname(root)); privateDirectory(root);
  copyCheckout(options.checkoutRoot, baseRoot);
  copyCheckout(options.checkoutRoot, bundleRoot);
  const session: HubAuthoringSession = {
    formatVersion: 1,
    id,
    mode: options.mode,
    ...(options.hub ? { hub: options.hub } : { localHubId: options.localHubId! }),
    baseCommit: options.baseCommit,
    sourceRepositoryId: options.sourceRepositoryId,
    evidenceDigest: options.evidenceDigest,
    subjectDirectory: options.subjectDirectory,
    ...(options.confirmedDomain ? { confirmedDomain: options.confirmedDomain } : {}),
    signals: [...options.signals],
    selectedSchemas: [...options.selectedSchemas],
    root,
    bundleRoot,
    baseRoot,
    checkoutRoot: options.checkoutRoot,
    createdAt: options.createdAt,
    supersessions: [...(options.supersessions ?? [])],
  };
  fs.writeFileSync(path.join(root, "session.json"), `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600 });
  return session;
}

export function readHubAuthoringSession(
  stateRoot: string,
  sessionId: string,
  expectedCheckoutRoot: string,
): HubAuthoringSession {
  if (!/^hub-session-[a-f0-9]{24}$/.test(sessionId)) throw new Error("Hub authoring session ID is invalid");
  const root = path.join(path.resolve(stateRoot), "sessions", sessionId);
  const value = JSON.parse(fs.readFileSync(path.join(root, "session.json"), "utf8")) as HubAuthoringSession;
  const checkoutRoot = path.resolve(value.checkoutRoot);
  const expected = path.resolve(expectedCheckoutRoot);
  const confirmedDomain = value.confirmedDomain
    ? normalizeConfirmedDomain({ identity: value.confirmedDomain.identity, title: value.confirmedDomain.title }) : undefined;
  if (value.formatVersion !== 1 || value.id !== sessionId || path.resolve(value.root) !== root
    || path.resolve(value.baseRoot) !== path.join(root, "base")
    || path.resolve(value.bundleRoot) !== path.join(root, "bundle")
    || !path.isAbsolute(value.checkoutRoot) || checkoutRoot !== expected
    || !fs.existsSync(checkoutRoot) || fs.lstatSync(checkoutRoot).isSymbolicLink()
    || !fs.statSync(checkoutRoot).isDirectory()
    || (confirmedDomain && confirmedDomain.evidenceResource !== value.confirmedDomain?.evidenceResource)
    || (!value.hub && !/^[a-f0-9]{24}$/.test(value.localHubId ?? ""))) {
    throw new Error("Hub authoring session state is invalid");
  }
  return value;
}

export function finalizeHubAuthoringSession(
  stateRoot: string,
  sessionId: string,
  expectedCheckoutRoot: string,
): Readonly<{ proposal: AnyHubProposal; inspection: HubProposalInspection }> {
  const session = readHubAuthoringSession(stateRoot, sessionId, expectedCheckoutRoot);
  const staging = path.join(path.resolve(stateRoot), "proposals", `.staging-${session.id}`);
  privateDirectory(path.dirname(staging));
  if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
  const common = {
    baseCommit: session.baseCommit,
    sourceRepositoryId: session.sourceRepositoryId,
    hubBundleRoot: session.baseRoot,
    authoredBundleRoot: session.bundleRoot,
    proposalRoot: staging,
    subjectDirectory: session.subjectDirectory,
    evidenceDigest: session.evidenceDigest,
    signals: session.signals,
    ...(session.confirmedDomain ? { confirmedDomain: session.confirmedDomain } : {}),
    createdAt: session.createdAt,
  };
  let finalized: Readonly<{
    proposal: AnyHubProposal;
    bundleRoot: string;
    inspection?: HubProposalInspection;
    diff?: Readonly<{ entries: readonly HubLifecycleEntry[] }>;
  }>;
  try {
    if (session.hub) {
      finalized = session.mode === "new"
        ? prepareNewHubProposal({ ...common, hub: session.hub })
        : prepareRefreshHubProposal({ ...common, hub: session.hub, supersessions: session.supersessions });
    } else {
      const localHubId = session.localHubId!;
      finalized = session.mode === "new"
        ? prepareNewHubProposal({ ...common, localHubId })
        : prepareRefreshHubProposal({ ...common, localHubId, supersessions: session.supersessions });
    }
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
  const inspection = finalized.inspection
    ?? inspectHubProposal(finalized.diff!.entries, { baseRoot: session.baseRoot, proposedRoot: finalized.bundleRoot });
  fs.cpSync(session.baseRoot, path.join(staging, "base"), { recursive: true, errorOnExist: true, force: false });
  fs.writeFileSync(path.join(staging, "inspection.json"), `${JSON.stringify(inspection, null, 2)}\n`, { mode: 0o600 });
  fs.writeFileSync(path.join(staging, "runtime.json"), `${JSON.stringify({ checkoutRoot: session.checkoutRoot })}\n`, { mode: 0o600 });
  const proposalRoot = path.join(path.resolve(stateRoot), "proposals", finalized.proposal.id);
  if (fs.existsSync(proposalRoot)) throw new Error("finalized Hub proposal already exists");
  fs.renameSync(staging, proposalRoot);
  return { proposal: finalized.proposal, inspection };
}
