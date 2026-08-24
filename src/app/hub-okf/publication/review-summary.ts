import fs from "node:fs";
import path from "node:path";

import {
  loadOkfBundle,
  readRepositoryIdentityRecord,
  readRepositoryObservedSource,
  type OkfValue,
} from "../../../core/knowledge/index.ts";
import type { PendingHubProposal } from "../review/pending.ts";

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
      || (proposal.mode === "enrichment" || proposal.mode === "batch-new"
        ? accepted.domainId !== proposal.domainId || JSON.stringify(accepted.sourceRepositoryIds) !== JSON.stringify(proposal.sourceRepositoryIds)
        : accepted.sourceRepositoryId !== proposal.sourceRepositoryId)
      || accepted.diffDigest !== proposal.diffDigest || accepted.acceptedCommit !== proposal.commit) return undefined;
    const inspection = record(JSON.parse(fs.readFileSync(path.join(root, "inspection.json"), "utf8")));
    const groups = record(inspection?.groups), uncertainty = record(groups?.questionsAndLimitations);
    const questions = Array.isArray(uncertainty?.questions) ? uncertainty.questions.flatMap((item) => {
      const question = record(item), subject = safeText(question?.subject, "question"), property = safeText(question?.property, "unknown property");
      return [`${subject} · ${property}`];
    }) : [];
    const limitations = Array.isArray(uncertainty?.limitations)
      ? uncertainty.limitations.map((item) => safeText(item)).filter(Boolean) : [];
    const batch = record(inspection?.batch);
    const batchMembers = Array.isArray(batch?.members) ? batch.members.flatMap((item) => {
      const member = record(item), repositoryId = safeText(member?.repositoryId, ""), paths = groupPaths(
        Array.isArray(member?.paths) ? member.paths.map((pathValue) => ({ path: pathValue })) : []);
      return repositoryId ? [`${repositoryId}: ${paths.length ? paths.join(", ") : "shared navigation only"}`] : [];
    }) : [];
    return {
      added: groupPaths(groups?.added),
      updated: groupPaths(groups?.updated),
      removed: groupPaths(groups?.removed),
      questions: bounded(questions),
      limitations: bounded(limitations),
      batchMembers: bounded(batchMembers),
      sharedPaths: groupPaths(Array.isArray(batch?.sharedPaths)
        ? batch.sharedPaths.map((pathValue) => ({ path: pathValue })) : []),
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
      : options.proposals[0]!.mode === "batch-new" ? "Batch Init" : "Enrichment"
    : "Publication";
  const title = `AgentBase Hub ${role}: ${safeText(options.proposals[0]!.mode === "enrichment" || options.proposals[0]!.mode === "batch-new"
    ? options.proposals[0]!.domainId : options.proposals[0]!.sourceRepositoryId)}`.slice(0, 120);
  const scope = details.slice(0, ITEM_LIMIT).flatMap(({ proposal, scope: repository, enrichment }) => {
    const multiRepository = proposal.mode === "enrichment" || proposal.mode === "batch-new";
    return [
      `Proposal \`${proposal.id}\` — mode: ${proposal.mode ?? "unknown"}; subject: \`${safeText(proposal.subject)}\``,
      ...(multiRepository
        ? [`Repositories: ${proposal.sourceRepositoryIds?.length ?? 0}.`,
          ...(proposal.sourceRepositoryIds ?? []).map((id) => `Repository: \`${safeText(id)}\``)]
        : [`Source: \`${safeText(proposal.sourceRepositoryId)}\``]),
      `Domain: ${repository.domains.length ? repository.domains.map((item) => `\`${safeText(item)}\``).join(", ") : "unavailable"}; source revision: ${repository.revision ? `\`${repository.revision}\`` : "unavailable"}`,
      ...(enrichment ? [`Provider scope: AWS account \`${safeText(enrichment.account)}\`; regions: ${enrichment.regions.map((region) => `\`${safeText(region)}\``).join(", ")}; profiles: ${enrichment.profiles.map((profile) => `\`${profile}\``).join(", ")}; candidates: ${enrichment.candidates}; Questions: ${enrichment.questions}`] : []),
    ];
  });
  if (details.length > ITEM_LIMIT) scope.push(`… ${details.length - ITEM_LIMIT} more proposal(s)`);
  const inspections = details.flatMap((item) => item.inspection ? [item.inspection] : []);
  const unavailable = inspections.length !== details.length;
  const changes = [
    ...(inspections.some((item) => item.batchMembers.length || item.sharedPaths.length)
      ? ["### Batch Attribution", bullets(bounded(inspections.flatMap((item) => item.batchMembers))),
        "### Shared Navigation", bullets(bounded(inspections.flatMap((item) => item.sharedPaths)))] : []),
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
