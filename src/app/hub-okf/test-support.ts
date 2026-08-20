import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createHubIdentity } from "../../core/hub/index.ts";
import type { GitRequest, GitHubPullRequest } from "../../providers/github-hub/index.ts";
import { prepareNewHubProposal } from "./authoring/prepare.ts";
import type { SubmissionGitHub, SubmitHubOptions } from "./publication/submit.ts";

const BASE = "a".repeat(40), COMMIT = "b".repeat(40), EVIDENCE = `sha256:${"c".repeat(64)}`;

export function createSubmissionFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-recovery-test-"));
  const base = path.join(root, "base"), authored = path.join(root, "authored"), proposalRoot = path.join(root, "proposal");
  const checkoutRoot = path.join(root, "checkout");
  fs.mkdirSync(base); fs.mkdirSync(path.join(authored, "repositories/acme"), { recursive: true });
  fs.mkdirSync(path.join(checkoutRoot, ".git"), { recursive: true });
  fs.writeFileSync(path.join(authored, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Acme](repositories/acme/) - repository\n");
  fs.writeFileSync(path.join(authored, "repositories/acme/index.md"), "# Acme\n\n* [Repository](repository.md) - identity\n");
  const concept = "---\ntype: Repository\ntitle: Acme\ndescription: Acme\nstatus: draft\n"
    + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
    + "sources:\n  - resource: repository://repository-acme-aaaaaaaaaaaa/README.md#L1-L2\n"
    + "---\n\n# Purpose\n\nAcme.\n";
  fs.writeFileSync(path.join(authored, "repositories/acme/repository.md"), concept);
  const prepared = prepareNewHubProposal({
    hub: createHubIdentity("agentbase/hub", "main"), baseCommit: BASE,
    sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
    hubBundleRoot: base, authoredBundleRoot: authored, proposalRoot,
    subjectDirectory: "repositories/acme", evidenceDigest: EVIDENCE,
    signals: ["repository"], createdAt: "2026-08-12T00:00:00Z",
  });
  const commands: GitRequest[] = [], branches = new Map<string, string>(), pulls: GitHubPullRequest[] = [];
  let failPull = false;
  const git = async (request: GitRequest) => {
    commands.push(request);
    if (request.args[0] === "push") branches.set(prepared.proposal.branch, COMMIT);
    const stdout = request.args[0] === "rev-parse" ? `${COMMIT}\n`
      : request.args[0] === "remote" && request.args[1] === "get-url" ? `${prepared.proposal.hub.canonicalHttpsUrl}\n`
      : "";
    return { stdout, stderr: "" };
  };
  const github: SubmissionGitHub = {
    async getRepository() { return { fullName: "agentbase/hub", defaultBranch: "main" }; },
    async getBranchRef(branch) {
      const commit = branch === "main" ? BASE : branches.get(branch);
      if (!commit) throw new Error("missing ref");
      return { branch, commit };
    },
    async findBranchRef(branch) { const commit = branches.get(branch); return commit ? { branch, commit } : undefined; },
    async listOpenPullRequests() { return pulls; },
    async createPullRequest(headBranch, headCommit) {
      if (failPull) throw new Error("simulated PR failure");
      const pull = { number: 9, url: "https://github.com/agentbase/hub/pull/9", headBranch, headCommit, headRepository: "agentbase/hub", baseBranch: "main" };
      pulls.push(pull); return pull;
    },
  };
  const options: SubmitHubOptions = {
    configuredHub: prepared.proposal.hub, proposalRoot, checkoutRoot, token: "canary",
    expectedDiffDigest: prepared.proposal.diffDigest, git, github,
  };
  return {
    root, prepared, options, commands, branches,
    setFailPull(value: boolean) { failPull = value; },
    pushCount() { return commands.filter((request) => request.args[0] === "push").length; },
    pullCount() { return pulls.length; },
    cleanup() { fs.rmSync(root, { recursive: true, force: true }); },
  };
}
