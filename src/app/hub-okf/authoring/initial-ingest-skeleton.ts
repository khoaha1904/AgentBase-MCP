import fs from "node:fs";
import path from "node:path";

import {
  createRepositorySourceResource,
  loadOkfBundle,
  renderConceptDocument,
  validateConceptAgainstSchema,
  validateOkfRelationships,
  validatePublishableAgentBaseDraft,
  type ConfirmedDomain,
  type ConceptCandidate,
  type ConceptDocument,
  type OkfAuthoringGuidance,
  type OkfAuthoringGuidanceRequest,
  type OkfFrontmatter,
  type OkfValue,
  type RepositoryIdentityRecord,
} from "../../../core/knowledge/index.ts";

export type InitialIngestSkeleton = Readonly<{
  candidateId?: string;
  identity: string;
  path: string;
  type: string;
}>;

export type WriteInitialIngestSkeletonsOptions = Readonly<{
  bundleRoot: string;
  subjectDirectory: string;
  sourceRepositoryId: string;
  repository: RepositoryIdentityRecord;
  confirmedDomain?: ConfirmedDomain;
  request: OkfAuthoringGuidanceRequest;
  guidance: OkfAuthoringGuidance;
  createdAt: string;
  sourceState: Readonly<{ commit: string | null; dirty: boolean; dirtyDigest: string | null }>;
}>;

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "concept";
}

function title(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `${trimmed[0]!.toUpperCase()}${trimmed.slice(1)}` : "Concept";
}

function sourceMap(options: WriteInitialIngestSkeletonsOptions): ReadonlyMap<string, Readonly<{ id: string; resource: string }>> {
  const entries = [...options.request.semanticObservations, ...options.request.resourceObservations].map((observation) => [
    observation.id, { id: observation.id.replaceAll(":", "-"), resource: createRepositorySourceResource(
      options.sourceRepositoryId, observation.source.path, observation.source.startLine, observation.source.endLine,
    ) },
  ] as const);
  const ids = entries.map(([, source]) => source.id);
  if (new Set(ids).size !== ids.length) throw new Error("observation IDs must remain unique as OKF source IDs");
  return new Map(entries);
}

function candidateSources(
  candidate: ConceptCandidate,
  sources: ReadonlyMap<string, Readonly<{ id: string; resource: string }>>,
): readonly Readonly<{ id: string; resource: string }>[] {
  return candidate.evidenceIds.map((id) => sources.get(id)).filter((item): item is { id: string; resource: string } => Boolean(item));
}

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\r", " ").replaceAll("\n", " ").trim();
}

function embeddedKnowledge(
  parentCandidateId: string,
  recommendations: OkfAuthoringGuidance["recommendations"],
  candidates: ReadonlyMap<string, ConceptCandidate>,
  sources: ReadonlyMap<string, Readonly<{ id: string; resource: string }>>,
): string {
  const rows = recommendations.filter((item) => item.status === "embedded" && item.parentCandidateId === parentCandidateId)
    .map((recommendation) => {
      const candidate = candidates.get(recommendation.candidateId);
      if (!candidate) throw new Error(`embedded recommendation has unknown candidate: ${recommendation.candidateId}`);
      const exactSources = candidateSources(candidate, sources);
      if (!exactSources.length) throw new Error(`embedded recommendation requires exact sources: ${candidate.id}`);
      const technology = [
        [recommendation.technology.provider, recommendation.technology.product].filter(Boolean).join(" / "),
        [recommendation.technology.sourceTool, recommendation.technology.resourceType].filter(Boolean).join(":"),
      ].filter(Boolean).join("; ") || "not identified";
      return `| ${tableCell(candidate.identityHint)} | ${tableCell(candidate.queryValue)} | ${tableCell(recommendation.technology.kind ?? "resource")} | ${tableCell(technology)} | ${exactSources.map((source) => `${tableCell(source.id)}: \`${tableCell(source.resource)}\``).join("<br>")} |`;
    });
  return rows.length ? [
    "# Embedded Knowledge", "",
    "| Name | Role | Kind | Technology | Exact sources |",
    "|---|---|---|---|---|", ...rows,
  ].join("\n") : "";
}

function document(relative: string, type: string, frontmatter: OkfFrontmatter, body: string): string {
  const concept: ConceptDocument = {
    conceptId: relative.slice(0, -3), path: relative, type, status: "draft",
    frontmatter, verified: [], body: `${body.trim()}\n`,
  };
  return renderConceptDocument(concept);
}

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function appendIndex(root: string, relative: string, heading: string, line: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : `# ${heading}\n`;
  if (current.split(/\r?\n/).includes(line)) return;
  fs.writeFileSync(target, `${current.trimEnd()}\n\n${line}\n`);
}

function availablePath(root: string, hint: string, candidateId: string, used: Set<string>): string {
  const first = hint.replace("<slug>", slug(candidateId));
  if (!used.has(first) && !fs.existsSync(path.join(root, ...first.split("/")))) return first;
  const extension = path.posix.extname(first);
  const base = first.slice(0, -extension.length);
  let sequence = 2;
  let next = `${base}-${sequence}${extension}`;
  while (used.has(next) || fs.existsSync(path.join(root, ...next.split("/")))) next = `${base}-${++sequence}${extension}`;
  return next;
}

function repositoryMetadata(
  repository: RepositoryIdentityRecord,
  sourceState: WriteInitialIngestSkeletonsOptions["sourceState"],
  observedAt: string,
): OkfValue {
  return {
    repository: {
      id: repository.id,
      display_name: repository.displayName,
      aliases: { remotes: repository.remotes, root_commits: repository.rootCommits },
      ...(repository.forgeId ? { forge_id: repository.forgeId } : {}),
      observed_source: {
        commit: sourceState.commit,
        dirty: sourceState.dirty,
        dirty_digest: sourceState.dirtyDigest,
        observed_at: observedAt,
      },
    },
  };
}

export function writeInitialIngestSkeletons(options: WriteInitialIngestSkeletonsOptions): readonly InitialIngestSkeleton[] {
  if (!/^repositories\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.subjectDirectory)) {
    throw new Error("new Initial Ingest subject_directory must be repositories/<slug>");
  }
  const sourceById = sourceMap(options);
  const candidates = new Map(options.request.candidates.map((candidate) => [candidate.id, candidate]));
  const selected = options.guidance.recommendations.filter((item) => ["exact", "suggested"].includes(item.status) && item.schema);
  const embedded = options.guidance.recommendations.filter((item) => item.status === "embedded");
  const repositoryRecommendation = selected.find((item) => item.schema?.type === "Repository");
  const repositoryEvidenceCandidate = repositoryRecommendation
    ? candidates.get(repositoryRecommendation.candidateId) : options.request.candidates[0];
  if (!repositoryEvidenceCandidate) throw new Error("Initial Ingest requires one evidence-bearing candidate");
  const repositorySources = candidateSources(repositoryEvidenceCandidate, sourceById);
  if (!repositorySources.length) throw new Error("Initial Ingest Repository skeleton requires exact repository evidence");
  const repositoryPurpose = repositoryRecommendation
    ? repositoryEvidenceCandidate.queryValue : `Source repository ${options.repository.displayName}`;
  const renderedCandidateIds = new Set([
    repositoryEvidenceCandidate.id,
    ...selected.filter((item) => item.schema?.type !== "Domain").map((item) => item.candidateId),
  ]);
  for (const recommendation of embedded) {
    if (!recommendation.parentCandidateId || !renderedCandidateIds.has(recommendation.parentCandidateId)) {
      throw new Error(`embedded recommendation parent is not a promoted skeleton: ${recommendation.candidateId}`);
    }
  }

  const generated = { by: "agentbase/0.0.0", at: options.createdAt } as const;
  const ownerSource = options.confirmedDomain
    ? { id: "owner-domain", resource: options.confirmedDomain.evidenceResource } : undefined;
  const skeletons: InitialIngestSkeleton[] = [];
  const used = new Set<string>();
  const repositoryPath = `${options.subjectDirectory}.md`;
  if (fs.existsSync(path.join(options.bundleRoot, ...repositoryPath.split("/")))) {
    throw new Error("new Initial Ingest Repository subject already exists; use Refresh");
  }

  const conceptEntries: Array<Readonly<{ path: string; type: string; title: string }>> = [];
  for (const recommendation of selected) {
    if (!recommendation.schema || recommendation.schema.type === "Repository" || recommendation.schema.type === "Domain") continue;
    const candidate = candidates.get(recommendation.candidateId);
    if (!candidate) continue;
    const relative = availablePath(options.bundleRoot, recommendation.schema.directoryHint, candidate.identityHint, used);
    used.add(relative);
    const sources = candidateSources(candidate, sourceById);
    const systemDomainSource = recommendation.schema.type === "System" && ownerSource ? ownerSource : undefined;
    const frontmatter: OkfFrontmatter = {
      type: recommendation.schema.type,
      title: title(candidate.identityHint),
      description: candidate.queryValue,
      status: "draft",
      generated,
      sources: [...sources, ...(systemDomainSource ? [systemDomainSource] : [])],
      ...(recommendation.schema.type === "Flow" ? { flow_steps: [] } : {}),
      ...(systemDomainSource && options.confirmedDomain ? {
        relationships: [{ kind: "part-of", target: options.confirmedDomain.identity, evidence: [systemDomainSource.id] }],
      } : {}),
      ...(Object.keys(recommendation.technology).length ? { agentbase: { technology: recommendation.technology } } : {}),
    };
    const section = recommendation.schema.recommendedSections[0] ?? "# Overview";
    const domainLink = systemDomainSource && options.confirmedDomain
      ? `\n\nPrimary Domain: [${options.confirmedDomain.title}](${path.posix.relative(path.posix.dirname(relative), `${options.confirmedDomain.identity}.md`)}).`
      : "";
    const suggestionLimitation = recommendation.status === "suggested"
      ? `\n\n# Limitations\n\nSuggested type \`${recommendation.schema.type}\` is evidence-bound agent intent and requires proposal review.` : "";
    const embeddedBody = embeddedKnowledge(candidate.id, embedded, candidates, sourceById);
    write(options.bundleRoot, relative, document(relative, recommendation.schema.type, frontmatter,
      `${section}\n\n${candidate.queryValue}${domainLink}${suggestionLimitation}${embeddedBody ? `\n\n${embeddedBody}` : ""}`));
    const identity = relative.slice(0, -3);
    skeletons.push({ candidateId: candidate.id, identity, path: relative, type: recommendation.schema.type });
    conceptEntries.push({ path: relative, type: recommendation.schema.type, title: title(candidate.identityHint) });
  }

  const repositoryFrontmatter: OkfFrontmatter = {
    type: "Repository",
    title: options.repository.displayName,
    description: repositoryPurpose,
    status: "draft",
    generated,
    sources: [...repositorySources, ...(ownerSource ? [ownerSource] : [])],
    ...(options.confirmedDomain ? {
      relationships: [{ kind: "part-of", target: options.confirmedDomain.identity, evidence: [ownerSource!.id] }],
    } : {}),
    agentbase: repositoryMetadata(options.repository, options.sourceState, options.createdAt),
  };
  const links = conceptEntries.map((item) => {
    const target = path.posix.relative(path.posix.dirname(repositoryPath), item.path);
    return `* [${item.title}](${target}) - ${item.type}`;
  });
  const repositoryEmbedded = embeddedKnowledge(repositoryEvidenceCandidate.id, embedded, candidates, sourceById);
  write(options.bundleRoot, repositoryPath, document(repositoryPath, "Repository", repositoryFrontmatter, [
    "# Purpose", "", repositoryPurpose,
    ...(options.confirmedDomain ? ["", `Primary Domain: [${options.confirmedDomain.title}](../${options.confirmedDomain.identity}.md).`] : []),
    ...(links.length ? ["", "# Canonical Knowledge", "", ...links] : []),
    ...(repositoryEmbedded ? ["", repositoryEmbedded] : []),
  ].join("\n")));
  skeletons.unshift({ ...(repositoryRecommendation ? { candidateId: repositoryEvidenceCandidate.id } : {}),
    identity: options.subjectDirectory, path: repositoryPath, type: "Repository" });

  if (options.confirmedDomain) {
    const domainPath = `${options.confirmedDomain.identity}.md`;
    if (!fs.existsSync(path.join(options.bundleRoot, ...domainPath.split("/")))) {
      const frontmatter: OkfFrontmatter = {
        type: "Domain", title: options.confirmedDomain.title,
        description: `${options.confirmedDomain.title} business domain`, status: "draft", generated,
        sources: [ownerSource!, repositorySources[0]!],
      };
      const repositoryLink = path.posix.relative(path.posix.dirname(domainPath), repositoryPath);
      const systemLinks = conceptEntries.filter((item) => item.type === "System").map((item) =>
        `* [${item.title}](${path.posix.relative(path.posix.dirname(domainPath), item.path)}) - System`);
      write(options.bundleRoot, domainPath, document(domainPath, "Domain", frontmatter,
        ["# Purpose", "", `Owner-confirmed business boundary for [${options.repository.displayName}](${repositoryLink}).`,
          ...(systemLinks.length ? ["", "# Systems", "", ...systemLinks] : [])].join("\n")));
      skeletons.push({ identity: options.confirmedDomain.identity, path: domainPath, type: "Domain" });
      conceptEntries.push({ path: domainPath, type: "Domain", title: options.confirmedDomain.title });
    }
  }

  for (const entry of [{ path: repositoryPath, type: "Repository", title: options.repository.displayName }, ...conceptEntries]) {
    const directory = path.posix.dirname(entry.path);
    const indexPath = `${directory}/index.md`;
    appendIndex(options.bundleRoot, indexPath, title(directory.split("/").at(-1) ?? directory),
      `* [${entry.title}](${path.posix.basename(entry.path)}) - ${entry.type}`);
  }
  appendIndex(options.bundleRoot, "index.md", "AgentBase-Hub", "* [Repositories](repositories/index.md) - source repositories");
  if (options.confirmedDomain) appendIndex(options.bundleRoot, "index.md", "AgentBase-Hub", "* [Domains](domains/index.md) - business domains");
  if (conceptEntries.some((item) => path.posix.dirname(item.path) === "systems")) {
    appendIndex(options.bundleRoot, "index.md", "AgentBase-Hub", "* [Systems](systems/index.md) - systems");
  }
  const bundle = loadOkfBundle(options.bundleRoot, { requireAgentBaseRootIndex: true });
  for (const skeleton of skeletons) {
    const concept = bundle.concepts.get(skeleton.identity);
    if (!concept) throw new Error(`generated OKF skeleton is missing: ${skeleton.path}`);
    const failures = [...validatePublishableAgentBaseDraft(concept), ...validateConceptAgainstSchema(concept)];
    if (failures.length) throw new Error(`generated OKF skeleton is invalid: ${failures.join("; ")}`);
  }
  const relationships = validateOkfRelationships(
    [...bundle.concepts].map(([identity, concept]) => ({ identity, concept })),
    { sourceIdentities: new Set(skeletons.filter((item) => item.type !== "Flow").map((item) => item.identity)),
      strictSourceIdentities: new Set(skeletons.filter((item) => item.type !== "Flow").map((item) => item.identity)) },
  );
  if (relationships.failures.length) {
    throw new Error(`generated OKF skeleton relationships are invalid: ${relationships.failures.join("; ")}`);
  }
  return skeletons;
}
