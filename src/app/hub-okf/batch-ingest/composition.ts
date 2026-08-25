import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createHubProposal, type AdmittedLocalHubState, type AnyHubProposal } from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, conceptReferencesRepository, diffBundleProposal, loadOkfBundle,
  parseConceptDocument, parseQuestionDocument, prepareBundleProposal, renderConceptDocument,
  repositorySourceResources, validateBundleProposal,
} from "../../../core/knowledge/index.ts";
import { attachHubInspectionContext, inspectHubProposal, type HubProposalInspection } from "../review/inspect.ts";
import { readHubProposalState, writeHubProposalState } from "../review/proposal-state.ts";
import type { BatchIngestManifest } from "./manifest.ts";

function copyTree(source: string, target: string): void {
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.isSymbolicLink()) continue;
    fs.cpSync(path.join(source, entry.name), path.join(target, entry.name), {
      recursive: true, errorOnExist: true, force: false,
    });
  }
}

function changedPaths(baseRoot: string, proposedRoot: string): readonly string[] {
  const base = loadOkfBundle(baseRoot), proposed = loadOkfBundle(proposedRoot, { requireAgentBaseRootIndex: true });
  const paths = [...new Set([...base.files, ...proposed.files])].sort();
  for (const relative of paths) if (base.files.includes(relative) && !proposed.files.includes(relative)) {
    throw new Error(`batch member cannot delete Hub content: ${relative}`);
  }
  return paths.filter((relative) => !base.files.includes(relative)
    || !fs.readFileSync(path.join(baseRoot, relative)).equals(fs.readFileSync(path.join(proposedRoot, relative))));
}

function mergeIndex(baseRoot: string, proposedRoot: string, targetRoot: string, relative: string): void {
  const base = fs.existsSync(path.join(baseRoot, relative)) ? fs.readFileSync(path.join(baseRoot, relative), "utf8") : "";
  const proposed = fs.readFileSync(path.join(proposedRoot, relative), "utf8");
  const target = fs.existsSync(path.join(targetRoot, relative)) ? fs.readFileSync(path.join(targetRoot, relative), "utf8") : base;
  const additions = proposed.split(/\r?\n/).filter((line) => line.trim() && !base.split(/\r?\n/).includes(line));
  let next = target.trimEnd();
  for (const line of additions) if (!next.split(/\r?\n/).includes(line)) next += `${next ? "\n\n" : ""}${line}`;
  fs.mkdirSync(path.dirname(path.join(targetRoot, relative)), { recursive: true });
  fs.writeFileSync(path.join(targetRoot, relative), `${next}\n`);
}

function mergeNewDomain(targetRoot: string, proposedRoot: string, relative: string, repositoryPath: string): void {
  const target = path.join(targetRoot, relative), proposed = path.join(proposedRoot, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target)) fs.copyFileSync(proposed, target);
  const current = parseConceptDocument(relative, fs.readFileSync(target, "utf8"));
  const candidate = parseConceptDocument(relative, fs.readFileSync(proposed, "utf8"));
  if (current.type !== "Domain" || candidate.type !== "Domain" || current.frontmatter.title !== candidate.frontmatter.title) {
    throw new Error("confirmed Domain members authored incompatible Domain concepts");
  }
  const priorLinks = (current.body.match(/\n+# Batch Navigation\n+([\s\S]*)$/)?.[1] ?? "").split(/\r?\n/)
    .filter((line) => /^\* \[[^\]]+\]\([^)]+\) - (?:System|Repository)$/.test(line));
  const memberBundle = loadOkfBundle(proposedRoot), repository = memberBundle.concepts.get(repositoryPath.slice(0, -3));
  if (!repository) throw new Error("batch member Repository concept is missing during Domain navigation");
  const repositoryMetadata = repository.frontmatter.agentbase as Record<string, unknown> | undefined;
  const repositoryIdentity = repositoryMetadata?.repository as Record<string, unknown> | undefined;
  if (typeof repositoryIdentity?.id !== "string") throw new Error("batch member Repository identity is missing during Domain navigation");
  const memberConcepts = [repository, ...[...memberBundle.concepts.values()].filter((concept) => {
    const relationships = concept.frontmatter.relationships;
    return concept.type === "System" && conceptReferencesRepository(concept, repositoryIdentity.id as string)
      && Array.isArray(relationships) && relationships.some((relationship) => relationship !== null
        && typeof relationship === "object" && !Array.isArray(relationship)
        && relationship.kind === "part-of" && relationship.target === relative.slice(0, -3));
  })];
  const memberLinks = memberConcepts.map((concept) =>
    `* [${String(concept.frontmatter.title)}](${path.posix.relative(path.posix.dirname(relative), concept.path)}) - ${concept.type}`);
  const baseBody = current.body.replace(/\n+# Batch Navigation[\s\S]*$/, "").trimEnd();
  const body = `${baseBody}\n\n# Batch Navigation\n\n${[...new Set([...priorLinks, ...memberLinks])].join("\n")}\n`;
  fs.writeFileSync(target, renderConceptDocument({ ...current, body }));
}

export function composeBatchProposal(options: Readonly<{
  stateRoot: string;
  localHub: AdmittedLocalHubState;
  manifest: BatchIngestManifest;
  memberProposalRoots: ReadonlyMap<string, string>;
}>): Readonly<{ proposal: AnyHubProposal; inspection: HubProposalInspection }> {
  if (!options.manifest.confirmed || options.localHub.activeHead !== options.manifest.baseCommit) {
    throw new Error("batch Hub base changed or membership is not confirmed");
  }
  const work = path.join(path.resolve(options.stateRoot), "batch-ingests", options.manifest.id,
    `.compose-${options.manifest.revision}`), baseRoot = path.join(work, "base"), targetRoot = path.join(work, "target");
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true, mode: 0o700 });
  copyTree(options.localHub.root, baseRoot); copyTree(baseRoot, targetRoot);
  const owners = new Map<string, string>(), sharedPaths = new Set<string>();
  const memberPaths = new Map(options.manifest.members.map((member) => [member.id, new Set<string>()]));
  const proposalDigests: string[] = [], limitations: string[] = [];
  const memberDiscoveries = new Map<string, HubProposalInspection["discovery"]>();
  const domainPath = `${options.manifest.domain.identity}.md`;
  try {
    for (const member of options.manifest.members) {
      const proposalRoot = options.memberProposalRoots.get(member.id);
      if (!proposalRoot) throw new Error(`batch member is incomplete: ${member.id}`);
      const proposal = readHubProposalState(proposalRoot);
      if (proposal.mode !== "new" || proposal.baseCommit !== options.manifest.baseCommit
        || proposal.sourceRepositoryId !== member.repositoryId) throw new Error(`batch member checkpoint is stale: ${member.id}`);
      proposalDigests.push(proposal.diffDigest);
      const baseRoot = path.join(proposalRoot, "base"), proposedRoot = path.join(proposalRoot, "bundle");
      const repository = [...loadOkfBundle(proposedRoot).concepts.values()].find((concept) => {
        const metadata = concept.frontmatter.agentbase as Record<string, unknown> | undefined;
        const identity = metadata?.repository as Record<string, unknown> | undefined;
        return identity?.id === member.repositoryId;
      });
      if (!repository) throw new Error(`batch member Repository concept is missing: ${member.id}`);
      for (const relative of changedPaths(baseRoot, proposedRoot)) {
        if (path.posix.basename(relative) === "index.md") {
          mergeIndex(baseRoot, proposedRoot, targetRoot, relative); sharedPaths.add(relative); continue;
        }
        if (relative === domainPath && !fs.existsSync(path.join(baseRoot, relative))) {
          mergeNewDomain(targetRoot, proposedRoot, relative, repository.path); sharedPaths.add(relative); continue;
        }
        const previousOwner = owners.get(relative);
        if (previousOwner) throw new Error(`batch members overlap authored path ${relative}: ${previousOwner}, ${member.id}`);
        if (relative.endsWith(".md") && path.posix.basename(relative) !== "log.md") {
          const concept = loadOkfBundle(proposedRoot).concepts.get(relative.slice(0, -3));
          if (concept?.type === "Question") {
            const crossMember = parseQuestionDocument(concept).references.some((reference) =>
              reference.referenceKind === "candidate-evidence"
              && !reference.sourceResource.startsWith(`repository://${member.repositoryId}/`));
            if (crossMember) throw new Error(`batch member Question contains cross-member evidence: ${relative}`);
          } else if (concept && repositorySourceResources(concept).some((resource) =>
            !resource.startsWith(`repository://${member.repositoryId}/`))) {
            throw new Error(`batch member concept contains cross-member evidence: ${relative}`);
          }
        }
        const bytes = fs.readFileSync(path.join(proposedRoot, relative), "utf8");
        const referencedRepositoryIds = [...bytes.matchAll(/repository:\/\/(repository-[a-z0-9-]+-[a-f0-9]{12})\//g)]
          .map((match) => match[1]);
        if (referencedRepositoryIds.some((id) => id !== member.repositoryId)) {
          throw new Error(`batch member output contains cross-member repository evidence: ${relative}`);
        }
        owners.set(relative, member.id);
        memberPaths.get(member.id)!.add(relative);
        const target = path.join(targetRoot, relative);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(path.join(proposedRoot, relative), target);
      }
      const inspection = JSON.parse(fs.readFileSync(path.join(proposalRoot, "inspection.json"), "utf8")) as HubProposalInspection;
      if (inspection.discovery?.sourceRevision !== undefined && inspection.discovery.sourceRevision !== member.source.commit) {
        throw new Error(`batch member discovery revision is stale: ${member.id}`);
      }
      if (inspection.discovery) memberDiscoveries.set(member.id, inspection.discovery);
      limitations.push(...(inspection.coverage?.limitations ?? []).map((value) => `${member.repositoryId}: ${value}`));
    }
    const evidenceDigest = `sha256:${createHash("sha256").update(JSON.stringify({
      manifest: options.manifest.digest, proposalDigests,
    })).digest("hex")}`;
    const staging = path.join(path.resolve(options.stateRoot), "proposals", `.staging-${options.manifest.id}-r${options.manifest.revision}`);
    fs.rmSync(staging, { recursive: true, force: true });
    prepareBundleProposal({ currentBundleRoot: baseRoot, proposalRoot: staging,
      proposalId: `proposal-${options.manifest.id.slice(-24)}`, evidenceDigest, createdAt: options.manifest.createdAt });
    fs.rmSync(path.join(staging, "bundle"), { recursive: true, force: true }); copyTree(targetRoot, path.join(staging, "bundle"));
    const validated = validateBundleProposal(baseRoot, staging);
    if (!validated.producerValidation?.passed) throw new Error(`batch proposal failed validation: ${validated.producerValidation?.failures.join("; ")}`);
    const diff = diffBundleProposal(baseRoot, staging);
    if (!diff.applicable) throw new Error("batch proposal contains an inapplicable change");
    const ordinaryInspection = attachHubInspectionContext(inspectHubProposal(diff.entries,
      { baseRoot, proposedRoot: path.join(staging, "bundle") }), [], {
      partial: limitations.length > 0, limitations,
    });
    const inspection: HubProposalInspection = { ...ordinaryInspection, batch: {
      members: options.manifest.members.map((member) => ({ repositoryId: member.repositoryId,
        paths: [...memberPaths.get(member.id)!].sort(),
        ...(memberDiscoveries.get(member.id) ? { discovery: memberDiscoveries.get(member.id) } : {}) })),
      sharedPaths: [...sharedPaths].sort(),
    } };
    const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(inspection.entries)).digest("hex")}`;
    const common = { mode: "batch-new" as const, subject: options.manifest.domain.identity,
      baseCommit: options.manifest.baseCommit, domainId: options.manifest.domain.identity,
      sourceRepositoryIds: options.manifest.members.map((member) => member.repositoryId),
      manifestDigest: options.manifest.digest, evidenceDigest,
      schemaVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
      selectedSchemas: [...new Set([...loadOkfBundle(path.join(staging, "bundle")).concepts.values()].map((concept) => concept.type))],
      treeDigest: diff.proposedTreeDigest, diffDigest };
    const proposal = options.localHub.kind === "local-only"
      ? createHubProposal({ ...common, localHubId: options.localHub.localHubId })
      : createHubProposal({ ...common, hub: options.localHub.hub });
    writeHubProposalState(staging, proposal);
    copyTree(baseRoot, path.join(staging, "base"));
    fs.writeFileSync(path.join(staging, "inspection.json"), `${JSON.stringify(inspection, null, 2)}\n`, { mode: 0o600 });
    fs.writeFileSync(path.join(staging, "runtime.json"), `${JSON.stringify({ checkoutRoot: options.localHub.root })}\n`, { mode: 0o600 });
    const finalRoot = path.join(path.resolve(options.stateRoot), "proposals", proposal.id);
    if (fs.existsSync(finalRoot)) throw new Error("matching batch proposal already exists");
    fs.renameSync(staging, finalRoot);
    return { proposal, inspection };
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
}
