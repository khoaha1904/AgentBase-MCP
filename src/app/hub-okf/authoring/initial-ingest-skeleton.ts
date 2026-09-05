import fs from "node:fs";
import path from "node:path";

import { AGENTBASE_PRODUCER } from "../../../product-version.ts";
import {
  agentBaseCandidateHome,
  agentBaseDomainConceptIdentity,
  agentBaseDomainConceptPath,
  agentBaseProfileConceptPath,
  classifyAgentBaseHubProfile,
  conceptIdentityFromPath,
  createRepositorySourceResource,
  loadOkfBundle,
  renderConceptDocument,
  validateConceptAgainstSchema,
  validateOkfRelationships,
  validatePublishableAgentBaseDraft,
  type AgentBaseConceptHome,
  type AgentBaseHomeSelection,
  type AgentBaseInitialIngestHomePlan,
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
  homePlan?: AgentBaseInitialIngestHomePlan;
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

function sourceMap(options: WriteInitialIngestSkeletonsOptions): ReadonlyMap<string, Readonly<{ id: string; resource: string; observed_revision?: string }>> {
  const entries = [...options.request.semanticObservations, ...options.request.resourceObservations].map((observation) => [
    observation.id, { id: observation.id.replaceAll(":", "-"), resource: createRepositorySourceResource(
      options.sourceRepositoryId, observation.source.path, observation.source.startLine, observation.source.endLine,
    ), ...(typeof options.sourceState.commit === "string" && /^[a-f0-9]{40}$/.test(options.sourceState.commit)
      ? { observed_revision: options.sourceState.commit } : {}) },
  ] as const);
  const ids = entries.map(([, source]) => source.id);
  if (new Set(ids).size !== ids.length) throw new Error("observation IDs must remain unique as OKF source IDs");
  return new Map(entries);
}

function candidateSources(
  candidate: ConceptCandidate,
  sources: ReadonlyMap<string, Readonly<{ id: string; resource: string; observed_revision?: string }>>,
): readonly Readonly<{ id: string; resource: string; observed_revision?: string }>[] {
  return candidate.evidenceIds.map((id) => sources.get(id)).filter((item): item is { id: string; resource: string } => Boolean(item));
}

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\r", " ").replaceAll("\n", " ").trim();
}

export function renderEmbeddedKnowledgeRow(
  candidate: ConceptCandidate,
  recommendation: OkfAuthoringGuidance["recommendations"][number],
  exactSources: readonly Readonly<{ id: string; resource: string }>[],
): string {
  const technology = [
    [recommendation.technology.provider, recommendation.technology.product].filter(Boolean).join(" / "),
    [recommendation.technology.sourceTool, recommendation.technology.resourceType].filter(Boolean).join(":"),
  ].filter(Boolean).join("; ") || "not identified";
  return `| ${tableCell(candidate.identityHint)} | ${tableCell(candidate.queryValue)} | ${tableCell(recommendation.technology.kind ?? "resource")} | ${tableCell(technology)} | ${exactSources.map((source) => `\`${tableCell(source.id)}\``).join("<br>")} |`;
}

export function renderEmbeddedKnowledgeEvidence(
  exactSources: readonly Readonly<{ id: string; resource: string }>[],
): readonly string[] {
  return exactSources.map((source) => `* \`${tableCell(source.id)}\` - \`${tableCell(source.resource)}\``);
}

function embeddedKnowledge(
  parentCandidateId: string,
  recommendations: OkfAuthoringGuidance["recommendations"],
  candidates: ReadonlyMap<string, ConceptCandidate>,
  sources: ReadonlyMap<string, Readonly<{ id: string; resource: string; observed_revision?: string }>>,
): string {
  const items = recommendations.filter((item) => item.status === "embedded" && item.parentCandidateId === parentCandidateId)
    .map((recommendation) => {
      const candidate = candidates.get(recommendation.candidateId);
      if (!candidate) throw new Error(`embedded recommendation has unknown candidate: ${recommendation.candidateId}`);
      const exactSources = candidateSources(candidate, sources);
      if (!exactSources.length) throw new Error(`embedded recommendation requires exact sources: ${candidate.id}`);
      return {
        row: renderEmbeddedKnowledgeRow(candidate, recommendation, exactSources),
        evidence: renderEmbeddedKnowledgeEvidence(exactSources),
      };
    });
  return items.length ? [
    "# Embedded Knowledge", "",
    "| Name | Role | Kind | Technology | Evidence |",
    "|---|---|---|---|---|", ...items.map((item) => item.row),
    "", "## Exact Evidence", "", ...items.flatMap((item) => item.evidence),
  ].join("\n") : "";
}

function embeddedSources(
  parentCandidateId: string,
  recommendations: OkfAuthoringGuidance["recommendations"],
  candidates: ReadonlyMap<string, ConceptCandidate>,
  sources: ReadonlyMap<string, Readonly<{ id: string; resource: string; observed_revision?: string }>>,
): readonly Readonly<{ id: string; resource: string; observed_revision?: string }>[] {
  const exact = recommendations.filter((item) => item.status === "embedded" && item.parentCandidateId === parentCandidateId)
    .flatMap((recommendation) => {
      const candidate = candidates.get(recommendation.candidateId);
      return candidate ? candidateSources(candidate, sources) : [];
    });
  return [...new Map(exact.map((source) => [source.id, source])).values()];
}

function document(relative: string, type: string, frontmatter: OkfFrontmatter, body: string): string {
  const concept: ConceptDocument = {
    conceptId: conceptIdentityFromPath(relative), path: relative, type, status: "draft",
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
  const lines = current.split(/\r?\n/);
  if (lines.includes(line)) return;
  const linkTarget = /\]\(([^)]+)\)/.exec(line)?.[1];
  if (linkTarget && lines.some((existing) => existing.includes(`](${linkTarget})`))) return;
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

function conceptHome(home: AgentBaseHomeSelection): AgentBaseConceptHome {
  return home.kind === "shared" ? { kind: "shared" } : { kind: "domain", selector: home.identity };
}

function profileDomains(plan: AgentBaseInitialIngestHomePlan): readonly Extract<AgentBaseHomeSelection, { kind: "domain" }>[] {
  const values = [plan.defaultHome, ...plan.exceptions.map((entry) => entry.home),
    ...plan.participations.map((entry) => ({ kind: "domain" as const, ...entry.domain }))]
    .filter((home): home is Extract<AgentBaseHomeSelection, { kind: "domain" }> => home.kind === "domain");
  return [...new Map(values.map((home) => [home.identity, home])).values()]
    .sort((left, right) => left.identity.localeCompare(right.identity));
}

function participationSources(plan: AgentBaseInitialIngestHomePlan, candidateId: string) {
  return plan.participations.filter((entry) => entry.candidateId === candidateId).map((entry) => ({
    domain: entry.domain,
    source: { id: `owner-domain-${entry.domain.identity.slice("domains/".length)}`,
      resource: entry.domain.evidenceResource },
  }));
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
  const initialBundle = loadOkfBundle(options.bundleRoot, { requireAgentBaseRootIndex: true });
  const admission = classifyAgentBaseHubProfile(initialBundle);
  if (admission.kind === "unsupported") throw new Error(`Hub Profile is unsupported: ${admission.failures.join("; ")}`);
  const profile = admission.kind === "profile-1.0";
  if (profile !== Boolean(options.homePlan)) {
    throw new Error(profile ? "Profile Initial Ingest requires a grouped home plan"
      : "grouped home plan requires an AgentBase OKF Profile 1.0 Hub");
  }
  if (!profile && !/^repositories\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.subjectDirectory)) {
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
  if (profile) {
    const materialized = new Set([repositoryEvidenceCandidate.id,
      ...selected.filter((item) => item.schema?.type !== "Domain").map((item) => item.candidateId)]);
    for (const exception of options.homePlan!.exceptions) {
      if (exception.candidateId === repositoryEvidenceCandidate.id || !materialized.has(exception.candidateId)) {
        throw new Error(`home plan exception is not a non-Repository materialized candidate: ${exception.candidateId}`);
      }
    }
    for (const participation of options.homePlan!.participations) if (!materialized.has(participation.candidateId)) {
      throw new Error(`home plan participation is not a materialized candidate: ${participation.candidateId}`);
    }
  }
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

  const generated = { by: AGENTBASE_PRODUCER, at: options.createdAt } as const;
  const ownerSource = !profile && options.confirmedDomain
    ? { id: "owner-domain", resource: options.confirmedDomain.evidenceResource } : undefined;
  const skeletons: InitialIngestSkeleton[] = [];
  const used = new Set<string>();
  const repositoryPath = `${options.subjectDirectory}.md`;
  if (profile) {
    const subjectSlug = path.posix.basename(options.subjectDirectory);
    const expected = agentBaseProfileConceptPath(conceptHome(options.homePlan!.defaultHome), "Repository", subjectSlug);
    if (repositoryPath !== expected) throw new Error("Profile Repository subject does not match default_home");
  }
  if (fs.existsSync(path.join(options.bundleRoot, ...repositoryPath.split("/")))) {
    throw new Error("new Initial Ingest Repository subject already exists; use Refresh");
  }

  const conceptEntries: Array<Readonly<{ path: string; type: string; title: string }>> = [];
  for (const recommendation of selected) {
    if (!recommendation.schema || recommendation.schema.type === "Repository" || recommendation.schema.type === "Domain") continue;
    const candidate = candidates.get(recommendation.candidateId);
    if (!candidate) continue;
    const hint = profile
      ? agentBaseProfileConceptPath(conceptHome(agentBaseCandidateHome(options.homePlan!, candidate.id)),
        recommendation.schema.type, slug(candidate.identityHint))
      : recommendation.schema.directoryHint;
    const relative = availablePath(options.bundleRoot, hint, candidate.identityHint, used);
    used.add(relative);
    const sources = candidateSources(candidate, sourceById);
    const retainedEmbeddedSources = embeddedSources(candidate.id, embedded, candidates, sourceById);
    const systemDomainSource = !profile && recommendation.schema.type === "System" && ownerSource ? ownerSource : undefined;
    const participations = profile ? participationSources(options.homePlan!, candidate.id) : [];
    const frontmatter: OkfFrontmatter = {
      type: recommendation.schema.type,
      title: title(candidate.identityHint),
      description: candidate.queryValue,
      status: "draft",
      generated,
      sources: [...new Map([...sources, ...retainedEmbeddedSources, ...(systemDomainSource ? [systemDomainSource] : []),
        ...participations.map((item) => item.source)]
        .map((source) => [source.id, source])).values()],
      ...(recommendation.schema.type === "Flow" ? { flow_steps: [] } : {}),
      ...(systemDomainSource && options.confirmedDomain ? {
        relationships: [{ kind: "part-of", target: options.confirmedDomain.identity, evidence: [systemDomainSource.id] }],
      } : {}),
      ...(participations.length ? { relationships: participations.map((item) => ({
        kind: "part-of", target: agentBaseDomainConceptIdentity(item.domain.identity), evidence: [item.source.id],
      })) } : {}),
      ...(Object.keys(recommendation.technology).length ? { agentbase: { technology: recommendation.technology } } : {}),
    };
    const section = recommendation.schema.recommendedSections[0] ?? "# Overview";
    const domainLink = systemDomainSource && options.confirmedDomain
      ? `\n\nPrimary Domain: [${options.confirmedDomain.title}](${path.posix.relative(path.posix.dirname(relative), `${options.confirmedDomain.identity}.md`)}).`
      : participations.length ? `\n\nDomains: ${participations.map((item) =>
        `[${item.domain.title}](${path.posix.relative(path.posix.dirname(relative), agentBaseDomainConceptPath(item.domain.identity))})`).join(", ")}.` : "";
    const suggestionLimitation = recommendation.status === "suggested"
      ? `\n\n# Limitations\n\nSuggested type \`${recommendation.schema.type}\` is evidence-bound agent intent and requires proposal review.` : "";
    const embeddedBody = embeddedKnowledge(candidate.id, embedded, candidates, sourceById);
    write(options.bundleRoot, relative, document(relative, recommendation.schema.type, frontmatter,
      `${section}\n\n${candidate.queryValue}${domainLink}${suggestionLimitation}${embeddedBody ? `\n\n${embeddedBody}` : ""}`));
    const identity = conceptIdentityFromPath(relative);
    skeletons.push({ candidateId: candidate.id, identity, path: relative, type: recommendation.schema.type });
    conceptEntries.push({ path: relative, type: recommendation.schema.type, title: title(candidate.identityHint) });
  }

  const repositoryFrontmatter: OkfFrontmatter = {
    type: "Repository",
    title: options.repository.displayName,
    description: repositoryPurpose,
    status: "draft",
    generated,
    sources: [...new Map([...repositorySources,
      ...embeddedSources(repositoryEvidenceCandidate.id, embedded, candidates, sourceById),
      ...(ownerSource ? [ownerSource] : []),
      ...(profile ? participationSources(options.homePlan!, repositoryEvidenceCandidate.id).map((item) => item.source) : [])]
      .map((source) => [source.id, source])).values()],
    ...(!profile && options.confirmedDomain ? {
      relationships: [{ kind: "part-of", target: options.confirmedDomain.identity, evidence: [ownerSource!.id] }],
    } : {}),
    ...(profile && participationSources(options.homePlan!, repositoryEvidenceCandidate.id).length ? {
      relationships: participationSources(options.homePlan!, repositoryEvidenceCandidate.id).map((item) => ({
        kind: "part-of", target: agentBaseDomainConceptIdentity(item.domain.identity), evidence: [item.source.id],
      })),
    } : {}),
    agentbase: repositoryMetadata(options.repository, options.sourceState, options.createdAt),
  };
  const links = conceptEntries.map((item) => {
    const target = path.posix.relative(path.posix.dirname(repositoryPath), item.path);
    return `* [${item.title}](${target}) - ${item.type}`;
  });
  const repositoryEmbedded = embeddedKnowledge(repositoryEvidenceCandidate.id, embedded, candidates, sourceById);
  write(options.bundleRoot, repositoryPath, document(repositoryPath, "Repository", repositoryFrontmatter, [
    "# Purpose and boundaries", "", repositoryPurpose,
    ...(!profile && options.confirmedDomain
      ? ["", `Primary Domain: [${options.confirmedDomain.title}](../${options.confirmedDomain.identity}.md).`] : []),
    ...(profile && participationSources(options.homePlan!, repositoryEvidenceCandidate.id).length
      ? ["", `Domains: ${participationSources(options.homePlan!, repositoryEvidenceCandidate.id).map((item) =>
        `[${item.domain.title}](${path.posix.relative(path.posix.dirname(repositoryPath), agentBaseDomainConceptPath(item.domain.identity))})`).join(", ")}.`] : []),
    ...(links.length ? ["", "# Independently promoted knowledge", "", ...links] : []),
    ...(repositoryEmbedded ? ["", repositoryEmbedded] : []),
  ].join("\n")));
  skeletons.unshift({ ...(profile || repositoryRecommendation ? { candidateId: repositoryEvidenceCandidate.id } : {}),
    identity: options.subjectDirectory, path: repositoryPath, type: "Repository" });

  if (!profile && options.confirmedDomain) {
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

  if (profile) {
    for (const domain of profileDomains(options.homePlan!)) {
      const identity = agentBaseDomainConceptIdentity(domain.identity), domainPath = agentBaseDomainConceptPath(domain.identity);
      const existing = loadOkfBundle(options.bundleRoot).concepts.get(identity);
      if (existing && (existing.type !== "Domain" || existing.frontmatter.title !== domain.title)) {
        throw new Error(`home plan Domain ${domain.identity} does not match the current Profile Hub`);
      }
      const domainSource = { id: `owner-domain-${domain.identity.slice("domains/".length)}`,
        resource: domain.evidenceResource };
      if (!existing) {
        const frontmatter: OkfFrontmatter = {
          type: "Domain", title: domain.title, description: `${domain.title} business domain`, status: "draft", generated,
          sources: [domainSource, repositorySources[0]!],
        };
        const repositoryLink = path.posix.relative(path.posix.dirname(domainPath), repositoryPath);
        write(options.bundleRoot, domainPath, document(domainPath, "Domain", frontmatter,
          `# Purpose\n\nOwner-confirmed business boundary related to [${options.repository.displayName}](${repositoryLink}).`));
        skeletons.push({ identity, path: domainPath, type: "Domain" });
      }
      appendIndex(options.bundleRoot, "index.md", "AgentBase-Hub",
        `* [${domain.title}](${domain.identity}/) - Domain Capsule`);
    }
    for (const skeleton of skeletons.filter((item) => item.type !== "Domain")) {
      const domain = /^domains\/([a-z0-9]+(?:-[a-z0-9]+)*)\//.exec(skeleton.path)?.[1];
      const indexPath = domain ? `domains/${domain}/index.md` : "shared/index.md";
      const label = candidates.get(skeleton.candidateId ?? "")?.identityHint ?? options.repository.displayName;
      appendIndex(options.bundleRoot, indexPath, domain ? title(domain) : "Shared",
        `* [${title(label)}](${path.posix.relative(path.posix.dirname(indexPath), skeleton.path)}) - ${skeleton.type}`);
    }
  } else {
    const entrypoint = options.confirmedDomain
      ? { title: options.confirmedDomain.title, target: `${options.confirmedDomain.identity}.md`, type: "Domain" }
      : { title: options.repository.displayName, target: repositoryPath, type: "Repository" };
    appendIndex(options.bundleRoot, "index.md", "AgentBase-Hub",
      `* [${entrypoint.title}](${entrypoint.target}) - ${entrypoint.type}`);
  }
  const bundle = loadOkfBundle(options.bundleRoot, { requireAgentBaseRootIndex: true });
  if (profile) {
    const profileAdmission = classifyAgentBaseHubProfile(bundle);
    if (profileAdmission.kind !== "profile-1.0") {
      throw new Error(`generated Profile Initial Ingest layout is invalid: ${profileAdmission.kind === "unsupported"
        ? profileAdmission.failures.join("; ") : "Profile declaration disappeared"}`);
    }
  }
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
