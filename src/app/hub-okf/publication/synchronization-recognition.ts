import { createHash } from "node:crypto";

import { HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import type { GitOutput, GitRequest } from "../../../providers/github-hub/index.ts";
import type { PendingHubProposal } from "../review/pending.ts";

type RecognitionGit = (request: GitRequest) => Promise<GitOutput>;

export function recognizePublishedProposals(
  pending: readonly PendingHubProposal[],
  remoteCommits: ReadonlySet<string>,
  remoteMessages: string,
  patchIdentities: ReadonlyMap<string, string> = new Map(),
  remotePatchIdentities: ReadonlySet<string> = new Set(),
): Readonly<{ recognized: readonly PendingHubProposal[]; remaining: readonly PendingHubProposal[] }> {
  const recognized: PendingHubProposal[] = [];
  const remaining: PendingHubProposal[] = [];
  for (const proposal of pending) {
    const idPattern = new RegExp(`${HUB_PROPOSAL_TRAILERS.id}:\\s*${proposal.id}(?:\\s|$)`);
    const digestPattern = new RegExp(
      `${HUB_PROPOSAL_TRAILERS.diffDigest}:\\s*${proposal.diffDigest}(?:\\s|$)`,
    );
    const patchIdentity = patchIdentities.get(proposal.commit);
    if (remoteCommits.has(proposal.commit)
      || idPattern.test(remoteMessages)
      || digestPattern.test(remoteMessages)
      || Boolean(patchIdentity && remotePatchIdentities.has(patchIdentity))) {
      recognized.push(proposal);
    } else {
      remaining.push(proposal);
    }
  }
  return { recognized, remaining };
}

export function stablePatchIdentity(patch: string): string {
  const normalized = patch
    .replace(/^index [a-f0-9]+\.\.[a-f0-9]+(?: \d+)?$/gm, "index <normalized>")
    .replace(/\r\n/g, "\n")
    .trimEnd();
  return createHash("sha256").update(normalized).digest("hex");
}

export async function computeProposalPatchIdentity(
  git: RecognitionGit,
  root: string,
  commit: string,
): Promise<string> {
  const output = await git({
    args: ["show", "--format=", "--binary", "--find-renames", commit],
    cwd: root,
    operation: "compute proposal patch identity",
    maximumOutputBytes: 4 * 1024 * 1024,
  });
  return stablePatchIdentity(output.stdout);
}
