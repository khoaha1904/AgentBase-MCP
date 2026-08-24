import fs from "node:fs";
import path from "node:path";

import type { AnyHubProposal } from "../../../core/hub/index.ts";

export type HubMutationLock = Readonly<{ root: string; ownerId: string }>;

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
  catch (error) { return (error as NodeJS.ErrnoException).code === "EPERM"; }
}

export function acquireHubMutationLock(
  stateRoot: string,
  ownerId: string,
  options: Readonly<{ recoverStaleOwner?: boolean }> = {},
): HubMutationLock {
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(ownerId)) throw new Error("Hub mutation lock owner is invalid");
  const root = path.join(path.resolve(stateRoot), "mutation.lock");
  fs.mkdirSync(path.dirname(root), { recursive: true, mode: 0o700 });
  if (fs.existsSync(root) && options.recoverStaleOwner) {
    try {
      const prior = JSON.parse(fs.readFileSync(path.join(root, "owner.json"), "utf8")) as { ownerId?: unknown; pid?: unknown };
      if (prior.ownerId !== ownerId || (typeof prior.pid === "number" && processIsAlive(prior.pid))) {
        throw new Error("another AgentBase-Hub mutation owns the local lock");
      }
      fs.rmSync(root, { recursive: true, force: false });
    } catch (error) {
      if (fs.existsSync(root)) throw new Error("another AgentBase-Hub mutation owns the local lock", { cause: error });
    }
  }
  try {
    fs.mkdirSync(root, { mode: 0o700 });
    fs.writeFileSync(path.join(root, "owner.json"), `${JSON.stringify({ ownerId, pid: process.pid })}\n`, { mode: 0o600, flag: "wx" });
  } catch (error) {
    if (fs.existsSync(root)) throw new Error("another AgentBase-Hub mutation owns the local lock", { cause: error });
    throw error;
  }
  return { root, ownerId };
}

export function releaseHubMutationLock(lock: HubMutationLock): void {
  const value = JSON.parse(fs.readFileSync(path.join(lock.root, "owner.json"), "utf8")) as { ownerId?: unknown };
  if (value.ownerId !== lock.ownerId) throw new Error("AgentBase-Hub mutation lock ownership changed");
  fs.rmSync(lock.root, { recursive: true, force: false });
}

export function writeAtomicJson(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "w" });
  fs.renameSync(temporary, target);
}
