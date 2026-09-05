import fs from "node:fs";
import path from "node:path";

import {
  loadOkfBundle,
  readRepositoryIdentityRecord,
  readRepositoryObservedSource,
  type OkfValue,
} from "../../../core/knowledge/index.ts";
import type { PendingHubProposal } from "../review/pending.ts";
import { readVerifiedHubProposalInspection } from "../review/inspect.ts";
import { readHubProposalState } from "../review/proposal-state.ts";

const ITEM_LIMIT = 20;

export type PublicationReviewSummary = Readonly<{ title: string; body: string }>;
export type PublicationReviewOptions = Readonly<{
  stateRoot: string;
  proposals: readonly PendingHubProposal[];
  publicationMode: "batch" | "stack" | "independent";
  baseBranch: string;
}>;

type InspectionSummary = Readonly<{
  added: readonly string[];
  updated: readonly string[];
  removed: readonly string[];
  questions: readonly string[];
  limitations: readonly string[];
  batchMembers: readonly string[];
  sharedPaths: readonly string[];
  discovery: readonly string[];
  semantic: readonly string[];
  semanticAvailable: boolean;
}>;

type RepositoryScope = Readonly<{ domains: readonly string[]; revision?: string }>;
type EnrichmentScope = Readonly<{ account: string; regions: readonly string[]; profiles: readonly string[];
  candidates: number; questions: number }>;

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

function safeText(value: unknown, fallback = "unavailable"): string {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/[\r\n\t]+/g, " ").trim().slice(0, 240);
  if (!text || /(?:^|\s)(?:\/(?!\/)|[A-Za-z]:\\)|\b(?:ghp_|github_pat_|Bearer\s+|token\s*[=:])/i.test(text)) {
    return "[redacted unsafe local detail]";
  }
  return text.replace(/[<>`]/g, "");
}

function safePath(value: unknown): string | undefined {
  if (typeof value !== "string" || value.startsWith("/") || value.includes("\\") || value.includes("\0")) return undefined;
  const normalized = path.posix.normalize(value);
  return normalized === value && normalized !== "." && !normalized.startsWith("../") ? normalized : undefined;
}

function bounded(values: readonly string[]): readonly string[] {
  const unique = [...new Set(values)].slice(0, ITEM_LIMIT);
  return values.length > ITEM_LIMIT ? [...unique, `… ${values.length - ITEM_LIMIT} more`] : unique;
}

function groupPaths(value: unknown): readonly string[] {
  return bounded(Array.isArray(value) ? value.flatMap((item) => {
    const entry = record(item), relative = safePath(entry?.path);
    const reason = safeText(entry?.reason, "");
    const evidence = Array.isArray(entry?.evidenceResources)
      ? entry.evidenceResources.slice(0, 3).map((item) => safeText(item, "")).filter(Boolean) : [];
    return relative ? [`${relative}${reason ? ` — ${reason}` : ""}${evidence.length ? ` — evidence: ${evidence.join(", ")}` : ""}`] : [];
  }) : []);
}

function readInspection(stateRoot: string, proposal: PendingHubProposal): InspectionSummary | undefined {
  try {
    const root = path.join(path.resolve(stateRoot), "proposals", proposal.id);
    const accepted = record(JSON.parse(fs.readFileSync(path.join(root, "accepted.json"), "utf8")));
    if (accepted?.id !== proposal.id || accepted.mode !== proposal.mode
      || (proposal.mode === "migration"
        ? accepted.migrationDigest !== proposal.migrationDigest
        : proposal.mode === "enrichment" || proposal.mode === "batch-new"
        ? accepted.domainId !== proposal.domainId || JSON.stringify(accepted.sourceRepositoryIds) !== JSON.stringify(proposal.sourceRepositoryIds)
        : accepted.sourceRepositoryId !== proposal.sourceRepositoryId)
      || accepted.diffDigest !== proposal.diffDigest || accepted.acceptedCommit !== proposal.commit) return undefined;
    const rawInspection = record(JSON.parse(fs.readFileSync(path.join(root, "inspection.json"), "utf8")));
    const semanticAvailable = record(rawInspection?.semanticImpact)?.formatVersion === 1;
    const inspection = semanticAvailable
      ? record(readVerifiedHubProposalInspection(root, readHubProposalState(root)))
      : rawInspection;
    const groups = record(inspection?.groups), uncertainty = record(groups?.questionsAndLimitations);
    const discovery = record(inspection?.discovery);
    const questions = [...(Array.isArray(uncertainty?.questions) ? uncertainty.questions.flatMap((item) => {
      const question = record(item), subject = safeText(question?.subject, "question"), property = safeText(question?.property, "unknown property");
      return [`${subject} · ${property}`];
    }) : []), ...(Array.isArray(discovery?.questions)
      ? discovery.questions.map((item) => safeText(item)).filter(Boolean) : [])];
    const limitations = [...(Array.isArray(uncertainty?.limitations)
      ? uncertainty.limitations.map((item) => safeText(item)).filter(Boolean) : []),
    ...(Array.isArray(discovery?.limitations)
      ? discovery.limitations.map((item) => safeText(item)).filter(Boolean) : [])];
    const lanes = Array.isArray(discovery?.lanes) ? discovery.lanes.flatMap((item) => {
      const lane = record(item);
      return lane ? [`Lane ${safeText(lane.lane)}: ${safeText(lane.status)}${lane.limitation ? ` — ${safeText(lane.limitation)}` : ""}`] : [];
    }) : [];
    const ignored = record(discovery?.ignoredCounts);
    const discoverySummary = discovery ? bounded([
      `Source revision: ${safeText(discovery.sourceRevision)}`,
      ...lanes,
      ...Object.entries(ignored ?? {}).map(([reason, count]) => `Ignored ${safeText(reason)}: ${safeText(String(count))}`),
      ...(Array.isArray(discovery.embeddedGroups)
        ? discovery.embeddedGroups.map((item) => `Embedded: ${safeText(item)}`) : []),
      ...(Array.isArray(discovery.relationsAndFlows)
        ? discovery.relationsAndFlows.map((item) => `Relation/Flow: ${safeText(item)}`) : []),
    ]) : [];
    const batch = record(inspection?.batch);
    const batchMembers = Array.isArray(batch?.members) ? batch.members.flatMap((item) => {
      const member = record(item), repositoryId = safeText(member?.repositoryId, ""), paths = groupPaths(
        Array.isArray(member?.paths) ? member.paths.map((pathValue) => ({ path: pathValue })) : []);
      const memberDiscovery = record(member?.discovery), memberLanes = Array.isArray(memberDiscovery?.lanes)
        ? memberDiscovery.lanes.length : 0;
      const memberLimitations = Array.isArray(memberDiscovery?.limitations) ? memberDiscovery.limitations.length : 0;
      return repositoryId ? [`${repositoryId}: ${paths.length ? paths.join(", ") : "shared navigation only"}${memberDiscovery
        ? `; source ${safeText(memberDiscovery.sourceRevision)}; lanes ${memberLanes}; limitations ${memberLimitations}` : ""}`] : [];
    }) : [];
    const impact = record(inspection?.semanticImpact), affected = record(impact?.affected);
    const changeCounts = (value: unknown): string => {
      const group = record(value);
      return `+${Array.isArray(group?.added) ? group.added.length : 0} ~${Array.isArray(group?.updated) ? group.updated.length : 0} -${Array.isArray(group?.removed) ? group.removed.length : 0}`;
    };
    const domains = Array.isArray(affected?.domains) ? affected.domains.flatMap((item) => {
      const value = record(item); return typeof value?.identity === "string"
        ? [`Affected semantic Domain: ${safeText(value.identity)}`] : [];
    }) : [];
    const homes = Array.isArray(affected?.homes) ? affected.homes.flatMap((item) => {
      const value = record(item);
      if (value?.kind === "shared" && value.selector === "shared") return ["Physical home: shared"];
      return value?.kind === "domain" && typeof value.selector === "string" && typeof value.domainIdentity === "string"
        ? [`Physical home: ${safeText(value.selector)} (${safeText(value.domainIdentity)})`] : [];
    }) : [];
    const repositories = Array.isArray(affected?.repositories) ? affected.repositories.flatMap((item) => {
      const value = record(item); return typeof value?.repositoryId === "string"
        ? [`Affected Repository: ${safeText(value.repositoryId)} (${safeText(value.identity)})`] : [];
    }) : [];
    const dangling = Array.isArray(impact?.danglingReferences) ? impact.danglingReferences : [];
    const duplicates = Array.isArray(impact?.duplicateCandidates) ? impact.duplicateCandidates : [];
    const omissions = Array.isArray(impact?.omissions) ? impact.omissions.flatMap((item) => {
      const value = record(item);
      return value ? [`Omission: ${safeText(value.category)} — ${safeText(value.reason)} (${safeText(String(value.count))})`] : [];
    }) : [];
    const semantic = bounded([
      `Concepts ${changeCounts(impact?.concepts)}; relations ${changeCounts(impact?.relations)}; Flow steps ${changeCounts(impact?.flowSteps)}; Questions ${changeCounts(impact?.questions)}; navigation links ${changeCounts(record(impact?.navigation)?.links)}`,
      ...homes,
      ...domains,
      ...repositories,
      ...(dangling.length ? [`Dangling references: ${dangling.length}`] : []),
      ...(duplicates.length ? [`Strong-identity duplicate candidates: ${duplicates.length}`] : []),
      ...omissions,
    ]);
    return {
      added: groupPaths(groups?.added),
      updated: groupPaths(groups?.updated),
      removed: groupPaths(groups?.removed),
      questions: bounded(questions),
      limitations: bounded(limitations),
      batchMembers: bounded(batchMembers),
      sharedPaths: groupPaths(Array.isArray(batch?.sharedPaths)
        ? batch.sharedPaths.map((pathValue) => ({ path: pathValue })) : []),
      discovery: discoverySummary,
      semantic,
      semanticAvailable,
    };
  } catch {
    return undefined;
  }
}

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function readRepositoryScope(stateRoot: string, proposal: PendingHubProposal): RepositoryScope {
  if (proposal.mode === "migration") return { domains: [] };
  if (proposal.mode === "enrichment" || proposal.mode === "batch-new") return { domains: proposal.domainId ? [proposal.domainId] : [] };
  try {
    const bundle = loadOkfBundle(path.join(path.resolve(stateRoot), "proposals", proposal.id, "bundle"));
    const repository = [...bundle.concepts.values()].find((concept) =>
      readRepositoryIdentityRecord(concept)?.id === proposal.sourceRepositoryId);
    if (!repository) return { domains: [] };
    const relationships = Array.isArray(repository.frontmatter.relationships)
      ? repository.frontmatter.relationships : [];
    const domains = relationships.flatMap((item) => {
      const relation = mapping(item);
      return relation?.kind === "part-of" && typeof relation.target === "string" && relation.target.startsWith("domains/")
        ? [relation.target] : [];
    });
    const observed = readRepositoryObservedSource(repository);
    return { domains: bounded(domains), ...(observed?.commit ? { revision: observed.commit } : {}) };
  } catch {
    return { domains: [] };
  }
}

function readEnrichmentScope(stateRoot: string, proposal: PendingHubProposal): EnrichmentScope | undefined {
  if (proposal.mode !== "enrichment") return undefined;
  try {
    const value = record(JSON.parse(fs.readFileSync(path.join(path.resolve(stateRoot), "proposals", proposal.id,
      "enrichment-summary.json"), "utf8")));
    const provider = record(value?.providerScope), profiles = record(value?.profileVersions), candidates = value?.candidates;
    if (value?.manifestDigest !== proposal.manifestDigest || typeof provider?.accountId !== "string"
      || !Array.isArray(provider.regions) || !provider.regions.every((region) => typeof region === "string")
      || !profiles || !Array.isArray(candidates)) return undefined;
    return { account: provider.accountId, regions: provider.regions as string[],
      profiles: Object.entries(profiles).map(([family, version]) => `${safeText(family)}@${safeText(String(version))}`).sort(),
      candidates: candidates.length, questions: candidates.filter((candidate) => record(candidate)?.question !== undefined).length };
  } catch { return undefined; }
}

function bullets(values: readonly string[], empty = "None recorded."): string {
  return values.length ? values.map((value) => `- ${safeText(value)}`).join("\n") : `- ${empty}`;
}

export function renderPublicationReview(options: PublicationReviewOptions): PublicationReviewSummary {
  if (!options.proposals.length) throw new Error("publication review requires proposals");
  const details = options.proposals.map((proposal) => ({
    proposal,
    inspection: readInspection(options.stateRoot, proposal),
    scope: readRepositoryScope(options.stateRoot, proposal),
    enrichment: readEnrichmentScope(options.stateRoot, proposal),
  }));
  const role = options.publicationMode !== "batch" && options.proposals.length === 1
    ? options.proposals[0]!.mode === "new" ? "Init" : options.proposals[0]!.mode === "refresh" ? "Refresh"
      : options.proposals[0]!.mode === "batch-new" ? "Batch Init"
        : options.proposals[0]!.mode === "migration" ? "Profile Migration" : "Enrichment"
    : "Publication";
  const title = `AgentBase Hub ${role}: ${safeText(options.proposals[0]!.mode === "migration" ? "legacy to Profile 1.0"
    : options.proposals[0]!.mode === "enrichment" || options.proposals[0]!.mode === "batch-new"
      ? options.proposals[0]!.domainId : options.proposals[0]!.sourceRepositoryId)}`.slice(0, 120);
  const scope = details.slice(0, ITEM_LIMIT).flatMap(({ proposal, scope: repository, enrichment }) => {
    const multiRepository = proposal.mode === "enrichment" || proposal.mode === "batch-new";
    return [
      `Proposal \`${proposal.id}\` — mode: ${proposal.mode ?? "unknown"}; subject: \`${safeText(proposal.subject)}\``,
      ...(proposal.mode === "migration"
        ? [`Migration digest: \`${safeText(proposal.migrationDigest)}\`; rollback commit: \`${safeText(proposal.parentCommit)}\`.`]
        : multiRepository
        ? [`Repositories: ${proposal.sourceRepositoryIds?.length ?? 0}.`,
          ...(proposal.sourceRepositoryIds ?? []).map((id) => `Repository: \`${safeText(id)}\``)]
        : [`Source: \`${safeText(proposal.sourceRepositoryId)}\``]),
      `Domain: ${repository.domains.length ? repository.domains.map((item) => `\`${safeText(item)}\``).join(", ") : "unavailable"}; source revision: ${repository.revision ? `\`${repository.revision}\`` : "unavailable"}`,
      ...(enrichment ? [`Provider scope: AWS account \`${safeText(enrichment.account)}\`; regions: ${enrichment.regions.map((region) => `\`${safeText(region)}\``).join(", ")}; profiles: ${enrichment.profiles.map((profile) => `\`${profile}\``).join(", ")}; candidates: ${enrichment.candidates}; Questions: ${enrichment.questions}`] : []),
    ];
  });
  if (details.length > ITEM_LIMIT) scope.push(`… ${details.length - ITEM_LIMIT} more proposal(s)`);
  const inspections = details.flatMap((item) => item.inspection ? [item.inspection] : []);
  const unavailable = inspections.length !== details.length || inspections.some((item) => !item.semanticAvailable);
  const changes = [
    ...(inspections.some((item) => item.batchMembers.length || item.sharedPaths.length)
      ? ["### Batch Attribution", bullets(bounded(inspections.flatMap((item) => item.batchMembers))),
        "### Shared Navigation", bullets(bounded(inspections.flatMap((item) => item.sharedPaths)))] : []),
    ...(inspections.some((item) => item.discovery.length)
      ? ["### Discovery", bullets(bounded(inspections.flatMap((item) => item.discovery)))] : []),
    ...(inspections.some((item) => item.semantic.length)
      ? ["### Semantic Impact", bullets(bounded(inspections.flatMap((item) => item.semantic)))] : []),
    "### Added", bullets(bounded(inspections.flatMap((item) => item.added))),
    "### Updated", bullets(bounded(inspections.flatMap((item) => item.updated))),
    "### Removed", bullets(bounded(inspections.flatMap((item) => item.removed))),
    ...(unavailable ? ["", "- Detailed change grouping is unavailable for at least one retained proposal; inspect the exact Git diff."] : []),
  ].join("\n");
  const questions = bounded(inspections.flatMap((item) => item.questions));
  const limitations = bounded(inspections.flatMap((item) => item.limitations));
  const evidence = options.proposals.slice(0, ITEM_LIMIT).flatMap((proposal) => [
    `Proposal \`${proposal.id}\`: commit \`${proposal.commit}\`; evidence \`${proposal.evidenceDigest}\`; catalog \`${safeText(proposal.schemaVersion)}\``,
  ]);
  if (options.proposals.length > ITEM_LIMIT) evidence.push(`… ${options.proposals.length - ITEM_LIMIT} more proposal(s)`);
  const body = [
    "## Purpose",
    `Publish ${options.proposals.length} locally accepted OKF proposal(s) as ${options.publicationMode === "independent" ? "an" : "a"} ${options.publicationMode} review unit. This PR is based on \`${safeText(options.baseBranch)}\` and does not merge or verify remote runtime behavior.`,
    "",
    "## Scope",
    bullets(scope),
    "",
    "## Knowledge Changes",
    changes,
    "",
    "## Uncertainty",
    "### Questions",
    bullets(questions),
    "### Limitations",
    bullets(limitations, unavailable ? "Detailed retained inspection metadata unavailable." : "None recorded."),
    "",
    "## Evidence and Validation",
    bullets(evidence),
    "- MCP verified the configured Hub, exact base/head commits and accepted local proposal identity before publication.",
    "",
    "## Reviewer Action",
    "- Review the grouped knowledge changes and their source references.",
    "- Resolve or retain Questions/limitations explicitly; do not infer completeness from omitted detail.",
    "- Merge, close or request changes through normal maintainer review. AgentBase-MCP does not merge this PR.",
  ].join("\n");
  if (Buffer.byteLength(body) > 64 * 1024) throw new Error("publication review body exceeds its byte limit");
  return { title, body };
}
