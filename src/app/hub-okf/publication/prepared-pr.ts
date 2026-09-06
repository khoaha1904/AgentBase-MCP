import type { HubIdentity } from "../../../core/hub/index.ts";
import type { GitHubHubApi, GitHubPullRequest, GitRequest, GitOutput } from "../../../providers/github-hub/index.ts";
import type { HubProposalInspection } from "../review/inspect.ts";

export type PreparedPrApi = Pick<GitHubHubApi, "getBranchRef" | "findBranchRef" | "listPullRequestsForHead" | "createPullRequest">;

export async function publishPreparedPullRequest(input: Readonly<{
  hub: HubIdentity; proposalId: string; baseCommit: string; diffDigest: string;
  commit: string; root: string; token: string; inspection: HubProposalInspection;
  github: PreparedPrApi; git: (request: GitRequest) => Promise<GitOutput>;
}>): Promise<Readonly<{ remote: "in-review" | "unknown"; pullRequest?: GitHubPullRequest }>> {
  const { github, hub, commit } = input;
  const branch = `agentbase/publish-${input.proposalId}`;
  const valid = (pr: GitHubPullRequest) => pr.headBranch === branch && pr.headCommit === commit
    && pr.headRepository === hub.repository && pr.baseBranch === hub.targetBranch;
  const inspect = async () => {
    const target = await github.getBranchRef(hub.targetBranch);
    const ref = await github.findBranchRef(branch);
    const open = await github.listPullRequestsForHead(branch, "open");
    const all = await github.listPullRequestsForHead(branch, "all");
    if (ref && ref.commit !== commit) throw new Error("publication branch contains different content; review again");
    if (open.length > 1 || open.some((pr) => !valid(pr)) || all.some((pr) => !valid(pr))) {
      throw new Error("publication PR identity or content differs; manual review required");
    }
    if (!open.length && all.length) throw new Error("publication PR was closed; do not recreate it automatically");
    if (open.length && !ref) throw new Error("publication PR branch is missing");
    if (open[0]) return { ref, pr: open[0] };
    if (target.commit !== input.baseCommit) throw new Error("remote Hub changed; prepare and review again before PR publication");
    return { ref, pr: undefined };
  };
  const current = await inspect();
  if (current.pr) return { remote: "in-review", pullRequest: current.pr };
  if (!current.ref) {
    try {
      await input.git({ args: ["push", hub.canonicalHttpsUrl, `${commit}:refs/heads/${branch}`],
        cwd: input.root, token: input.token, operation: "push reviewed PR candidate" });
    } catch { return { remote: "unknown" }; }
  }
  const rechecked = await inspect();
  if (rechecked.pr) return { remote: "in-review", pullRequest: rechecked.pr };
  if (!rechecked.ref) return { remote: "unknown" };
  const impact = input.inspection.semanticImpact;
  const summary = JSON.stringify({ counts: input.inspection.counts, affected: impact?.affected,
    questions: impact?.questions, omissions: impact?.omissions }, null, 2);
  const body = [
    "## Reviewed AgentBase knowledge change", "",
    `Proposal: ${input.proposalId}`, `Base: ${input.baseCommit}`, `Reviewed diff: ${input.diffDigest}`,
    "", "Scope and changes (bounded verified inspection):", "```json",
    summary.slice(0, 24000), "```",
    ...(summary.length > 24000 ? ["Summary truncated at 24,000 characters; inspect the full proposal and Files changed."] : []),
    "", "Inspect the complete Files changed diff for all additions and removals.",
    "Approval authorizes sharing, not completeness or current runtime truth. Questions and source limitations remain in the documents.",
  ].join("\n");
  try {
    const pr = await github.createPullRequest(branch, commit, `AgentBase knowledge ${input.proposalId}`, body, hub.targetBranch);
    if (!valid(pr)) throw new Error("created PR identity mismatch");
    return { remote: "in-review", pullRequest: pr };
  } catch { return { remote: "unknown" }; }
}
