import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubProposal, type AdmittedLocalHubState, type AnyHubProposal } from "../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  diffBundleProposal,
  prepareBundleProposal,
  renderConceptDocument,
  validateBundleProposal,
  type ConceptDocument,
  type OkfFrontmatter,
} from "../../core/knowledge/index.ts";
import { runGit, type GitOutput, type GitRequest } from "../../providers/github-hub/index.ts";
import { inspectHubProposal, type HubProposalInspection } from "./inspect.ts";
import { writeHubProposalState } from "./proposal-state.ts";
import type { GovernedQuestion } from "./questions.ts";

export type PrepareQuestionGuidanceOptions = Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  question: GovernedQuestion;
  answer: string;
  by: string;
  at: string;
  git?: (request: GitRequest) => Promise<GitOutput>;
}>;

function privateDirectory(directory: string): void {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 }); fs.chmodSync(directory, 0o700);
}

function copyHub(source: string, target: string): void {
  privateDirectory(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    if (entry.isSymbolicLink()) throw new Error("accepted Hub content cannot contain symlinks");
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true, errorOnExist: true, force: false,
    });
  }
}

export async function prepareQuestionGuidanceProposal(
  options: PrepareQuestionGuidanceOptions,
): Promise<Readonly<{ proposal: AnyHubProposal; inspection: HubProposalInspection }>> {
  const answer = options.answer.trim(), git = options.git ?? runGit;
  if (!answer || answer.length > 4096) throw new Error("question answer is invalid");
  if (!/^human:[A-Za-z0-9][A-Za-z0-9._@-]{0,127}$/.test(options.by)) throw new Error("maintainer must use an explicit human: identity");
  if (Number.isNaN(Date.parse(options.at))) throw new Error("question answer time is invalid");
  if (!options.question.sourceRepositoryId) throw new Error("question source repository is unavailable");
  const status = await git({
    args: ["status", "--porcelain=v1", "--untracked-files=all"],
    cwd: options.localHub.root,
    operation: "inspect Hub before guidance",
  });
  if (status.stdout) throw new Error("AgentBase-Hub local tree must be clean before guidance");
  const head = (await git({ args: ["rev-parse", "--verify", "refs/heads/main^{commit}"], cwd: options.localHub.root,
    operation: "resolve Hub before guidance" })).stdout.trim();
  if (head !== options.localHub.activeHead) throw new Error("local Hub advanced before guidance proposal creation");

  const revision = options.question.revision, key = `${options.question.id}-r${revision}`;
  const workRoot = path.join(path.resolve(options.stateRoot), "guidance-work", key);
  const baseRoot = path.join(workRoot, "base");
  const staging = path.join(path.resolve(options.stateRoot), "proposals", `.staging-guidance-${key}`);
  fs.rmSync(workRoot, { recursive: true, force: true });
  fs.rmSync(staging, { recursive: true, force: true });
  try {
    copyHub(options.localHub.root, baseRoot);
    const evidenceDigest = `sha256:${createHash("sha256").update(JSON.stringify({
      questionId: options.question.id, revision, answer, by: options.by, at: options.at,
    })).digest("hex")}`;
    prepareBundleProposal({ currentBundleRoot: baseRoot, proposalRoot: staging,
      proposalId: `proposal-guidance-${key}`, evidenceDigest, createdAt: options.at });
    const conceptId = `guidance/${key}`, conceptPath = `${conceptId}.md`;
    const frontmatter: OkfFrontmatter = {
      type: "Maintainer Guidance",
      title: `Guidance for ${options.question.subject} ${options.question.property}`,
      description: `Maintainer answer for governed question ${options.question.id}`,
      status: "stable",
      generated: { by: options.by, at: options.at },
      sources: [{ id: "maintainer-answer", resource: `agentbase://maintainer-answer/${options.question.id}/${revision}` }],
      agentbase: { question: { id: options.question.id, revision, claim_ids: options.question.claimIds } },
    };
    const concept: ConceptDocument = { conceptId, path: conceptPath, type: "Maintainer Guidance", status: "stable",
      frontmatter, verified: [], body: `# Guidance\n\n${answer}\n\n# Scope\n\n${options.question.subject} · ${options.question.property}.\n` };
    const target = path.join(staging, "bundle", ...conceptPath.split("/"));
    privateDirectory(path.dirname(target));
    fs.writeFileSync(target, renderConceptDocument(concept), { mode: 0o600 });
    const validated = validateBundleProposal(baseRoot, staging, {
      maintainerGuidance: { conceptId, by: options.by, at: options.at },
    });
    if (!validated.producerValidation?.passed) throw new Error(`guidance proposal failed validation: ${validated.producerValidation?.failures.join("; ")}`);
    const diff = diffBundleProposal(baseRoot, staging);
    const invalid = diff.entries.find((entry) => entry.change !== "preserved"
      && !(entry.change === "created" && entry.path === conceptPath));
    if (!diff.applicable || invalid) throw new Error(`guidance proposal contains an out-of-scope change${invalid ? `: ${invalid.path}` : ""}`);
    const inspection = inspectHubProposal(diff.entries, { baseRoot, proposedRoot: path.join(staging, "bundle") });
    const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(inspection.entries)).digest("hex")}`;
    const common = { mode: "refresh" as const, subject: options.question.subject, baseCommit: options.localHub.activeHead,
      sourceRepositoryId: options.question.sourceRepositoryId, evidenceDigest,
      schemaVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, selectedSchemas: ["Maintainer Guidance"],
      treeDigest: diff.proposedTreeDigest, diffDigest };
    const proposal = options.localHub.kind === "local-only"
      ? createHubProposal({ ...common, localHubId: options.localHub.localHubId })
      : createHubProposal({ ...common, hub: options.localHub.hub });
    writeHubProposalState(staging, proposal);
    fs.cpSync(baseRoot, path.join(staging, "base"), { recursive: true, errorOnExist: true, force: false });
    fs.writeFileSync(path.join(staging, "inspection.json"), `${JSON.stringify(inspection, null, 2)}\n`, { mode: 0o600 });
    fs.writeFileSync(path.join(staging, "runtime.json"), `${JSON.stringify({ checkoutRoot: options.localHub.root })}\n`, { mode: 0o600 });
    const proposalRoot = path.join(path.resolve(options.stateRoot), "proposals", proposal.id);
    if (fs.existsSync(proposalRoot)) throw new Error("matching guidance proposal already exists");
    fs.renameSync(staging, proposalRoot);
    return { proposal, inspection };
  } finally {
    fs.rmSync(workRoot, { recursive: true, force: true });
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
  }
}
