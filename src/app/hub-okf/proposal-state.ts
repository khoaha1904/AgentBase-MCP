import fs from "node:fs";
import path from "node:path";

import type { HubProposal } from "../../core/hub/index.ts";

export type HubMutationLock = Readonly<{ root: string; ownerId: string }>;

const statePath = (proposalRoot: string) => path.join(proposalRoot, "hub-proposal.json");

export function writeHubProposalState(proposalRoot: string, proposal: HubProposal): void {
  fs.mkdirSync(proposalRoot, { recursive: true, mode: 0o700 });
  const target = statePath(proposalRoot);
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(proposal, null, 2)}\n`, { mode: 0o600, flag: "w" });
  fs.renameSync(temporary, target);
}

export function readHubProposalState(proposalRoot: string): HubProposal {
  const value = JSON.parse(fs.readFileSync(statePath(proposalRoot), "utf8")) as HubProposal;
  if (!value.id || !value.branch || !["prepared", "committed", "pushed", "pr-opened"].includes(value.phase)) {
    throw new Error("Hub proposal state is invalid");
  }
  if (!/^[a-f0-9]{24}$/.test(value.id) || value.branch !== `agentbase/okf-${value.id}` || value.branch === value.hub.targetBranch) {
    throw new Error("Hub proposal branch identity is invalid");
  }
  return value;
}

export function acquireHubMutationLock(stateRoot: string, ownerId: string): HubMutationLock {
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(ownerId)) throw new Error("Hub mutation lock owner is invalid");
  const root = path.join(path.resolve(stateRoot), "mutation.lock");
  fs.mkdirSync(path.dirname(root), { recursive: true, mode: 0o700 });
  try {
    fs.mkdirSync(root, { mode: 0o700 });
    fs.writeFileSync(path.join(root, "owner.json"), `${JSON.stringify({ ownerId })}\n`, { mode: 0o600, flag: "wx" });
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
