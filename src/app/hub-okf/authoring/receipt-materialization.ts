import fs from "node:fs";
import path from "node:path";

import {
  createRepositorySourceResource, loadOkfBundle, readRepositoryIdentityRecord,
  renderConceptDocument, repositorySourceResources, type InventoryReceipt, type OkfValue,
} from "../../../core/knowledge/index.ts";
import type { HubProposalInspection } from "../review/inspect.ts";
import {
  renderEmbeddedKnowledgeEvidence, renderEmbeddedKnowledgeRow, type InitialIngestSkeleton,
} from "./initial-ingest-skeleton.ts";

type ReceiptMaterializationContext = Readonly<{
  mode: "new" | "refresh";
  discoveryReceipt?: InventoryReceipt;
  skeletons?: readonly InitialIngestSkeleton[];
  sourceRepositoryId: string;
  createdAt: string;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : {};
}

export function receiptCoverage(receipt: InventoryReceipt): Readonly<{ partial: boolean; limitations: readonly string[] }> {
  const limitations = [...new Set(receipt.coverage.limitations.map((item) => item.length > 512
    ? `${item.slice(0, 460)} [shortened; full detail retained in Receipt]` : item))].sort();
  return { partial: limitations.length > 0, limitations: limitations.length > 64
    ? [...limitations.slice(0, 63), `${limitations.length - 63} additional discovery limitations retained in Receipt`]
    : limitations };
}

function appendEmbeddedKnowledge(
  body: string,
  items: readonly Readonly<{ row: string; evidence: readonly string[] }>[],
): string {
  if (!items.length) return body;
  const heading = "# Embedded Knowledge";
  const header = "| Name | Role | Kind | Technology | Evidence |";
  const separator = "|---|---|---|---|---|";
  const rows = items.map((item) => item.row);
  let lines = body.trimEnd().split("\n");
  const headerIndex = lines.findIndex((line) => line.trim() === header);
  if (headerIndex >= 0 && lines[headerIndex + 1]?.trim() === separator) {
    let insertAt = headerIndex + 2;
    while (lines[insertAt]?.trimStart().startsWith("|")) insertAt += 1;
    lines.splice(insertAt, 0, ...rows);
  } else {
    const headingIndex = lines.findIndex((line) => line.trim() === heading);
    if (headingIndex >= 0) lines.splice(headingIndex + 1, 0, "", header, separator, ...rows);
    else lines.push("", heading, "", header, separator, ...rows);
  }
  const evidence = items.flatMap((item) => item.evidence)
    .filter((line) => !lines.some((existing) => existing.trim() === line));
  if (evidence.length) {
    const evidenceHeading = "## Exact Evidence";
    const evidenceIndex = lines.findIndex((line) => line.trim() === evidenceHeading);
    if (evidenceIndex < 0) lines.push("", evidenceHeading, "", ...evidence);
    else {
      let insertAt = evidenceIndex + 1;
      while (lines[insertAt] !== undefined
        && (!lines[insertAt]!.trim() || lines[insertAt]!.trimStart().startsWith("* "))) insertAt += 1;
      lines.splice(insertAt, 0, ...evidence);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function restoreReceiptEmbeddedKnowledge(session: ReceiptMaterializationContext, root: string): void {
  const receipt = session.discoveryReceipt;
  if (!receipt || !session.skeletons) return;
  const bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  const skeletons = new Map(session.skeletons.flatMap((skeleton) => skeleton.candidateId
    ? [[skeleton.candidateId, skeleton] as const] : []));
  const candidates = new Map(receipt.guidanceRequest.candidates.map((candidate) => [candidate.id, candidate]));
  const recommendations = new Map(receipt.guidance.recommendations.map((item) => [item.candidateId, item]));
  const observations = [...receipt.guidanceRequest.semanticObservations, ...receipt.guidanceRequest.resourceObservations];
  const itemsByOwner = new Map<string, {
    items: { row: string; evidence: readonly string[] }[];
    sources: Array<Readonly<{ id: string; resource: string; observed_revision: string }>>;
  }>();
  for (const output of receipt.inventory.items.flatMap((item) => item.outcome === "materialized" ? item.outputs : [])) {
    const candidate = candidates.get(output.candidateId), recommendation = recommendations.get(output.candidateId);
    if (candidate?.disposition !== "embedded" || recommendation?.status !== "embedded") continue;
    const parent = output.parentCandidateId ? skeletons.get(output.parentCandidateId) : undefined;
    const owner = parent ? bundle.concepts.get(parent.identity) : undefined;
    if (!parent || !owner || recommendation.parentCandidateId !== output.parentCandidateId) continue;
    const sources = candidate.evidenceIds.flatMap((id) => {
      const observation = observations.find((entry) => entry.id === id);
      return observation ? [{ id: observation.id.replaceAll(":", "-"), resource: createRepositorySourceResource(
        receipt.source.repositoryId, observation.source.path, observation.source.startLine, observation.source.endLine,
      ), observed_revision: receipt.source.commit }] : [];
    });
    if (!sources.length) continue;
    const row = renderEmbeddedKnowledgeRow(candidate, recommendation, sources);
    const retained = itemsByOwner.get(owner.conceptId) ?? { items: [], sources: [] };
    if (!owner.body.includes(row) && !retained.items.some((item) => item.row === row)) {
      retained.items.push({ row, evidence: renderEmbeddedKnowledgeEvidence(sources) });
    }
    for (const source of sources) {
      if (!retained.sources.some((existing) => existing.id === source.id)) retained.sources.push(source);
    }
    itemsByOwner.set(owner.conceptId, retained);
  }
  for (const [ownerId, retained] of itemsByOwner) {
    const owner = bundle.concepts.get(ownerId);
    if (!owner) continue;
    const existingSources = Array.isArray(owner.frontmatter.sources) ? [...owner.frontmatter.sources] : [];
    for (const source of retained.sources) {
      if (!existingSources.some((value) => mapping(value)?.id === source.id)) existingSources.push(source);
    }
    fs.writeFileSync(path.join(root, owner.path), renderConceptDocument({ ...owner,
      frontmatter: { ...owner.frontmatter, sources: existingSources },
      body: appendEmbeddedKnowledge(owner.body, retained.items) }), { mode: 0o600 });
  }
}

export function validateReceiptMaterialization(session: ReceiptMaterializationContext, root: string): void {
  const receipt = session.discoveryReceipt;
  if (!receipt || !session.skeletons) throw new Error("receipt-bound Initial Ingest materialization state is missing");
  const bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  const skeletons = new Map(session.skeletons.flatMap((skeleton) => skeleton.candidateId
    ? [[skeleton.candidateId, skeleton] as const] : []));
  const candidates = new Map(receipt.guidanceRequest.candidates.map((candidate) => [candidate.id, candidate]));
  const recommendations = new Map(receipt.guidance.recommendations.map((item) => [item.candidateId, item]));
  const observations = [...receipt.guidanceRequest.semanticObservations, ...receipt.guidanceRequest.resourceObservations];
  const failures: string[] = [];
  for (const item of receipt.inventory.items) for (const output of item.outputs) {
    const candidate = candidates.get(output.candidateId), recommendation = recommendations.get(output.candidateId);
    if (!candidate || !recommendation) { failures.push(`${item.id}: output candidate is unavailable`); continue; }
    if (candidate.disposition === "concept") {
      const skeleton = skeletons.get(output.candidateId), concept = skeleton ? bundle.concepts.get(skeleton.identity) : undefined;
      if (!skeleton || !concept || !["exact", "suggested"].includes(recommendation.status)
        || concept.type !== recommendation.schema?.type) {
        failures.push(`${item.id}: concept output ${output.candidateId} did not materialize`);
        continue;
      }
      const sources = new Set(repositorySourceResources(concept));
      const expected = candidate.evidenceIds.flatMap((id) => {
        const observation = observations.find((entry) => entry.id === id);
        return observation ? [createRepositorySourceResource(receipt.source.repositoryId, observation.source.path,
          observation.source.startLine, observation.source.endLine)] : [];
      });
      if (!expected.some((resource) => sources.has(resource))) {
        failures.push(`${item.id}: concept output ${output.candidateId} lost Receipt evidence`);
      }
    } else if (candidate.disposition === "embedded") {
      const parent = output.parentCandidateId ? skeletons.get(output.parentCandidateId) : undefined;
      const owner = parent ? bundle.concepts.get(parent.identity) : undefined;
      const expected = candidate.evidenceIds.flatMap((id) => {
        const observation = observations.find((entry) => entry.id === id);
        return observation ? [createRepositorySourceResource(receipt.source.repositoryId, observation.source.path,
          observation.source.startLine, observation.source.endLine)] : [];
      });
      if (!parent || !owner || recommendation.status !== "embedded"
        || recommendation.parentCandidateId !== output.parentCandidateId
        || !expected.some((resource) => owner.body.includes(`\`${resource}\``))) {
        failures.push(`${item.id}: embedded output ${output.candidateId} did not retain candidate evidence in its parent`);
      }
    }
  }
  if (failures.length) throw new Error(`Receipt materialization failed: ${failures.join("; ")}`);
}

export function receiptInspectionContext(
  session: ReceiptMaterializationContext,
  root: string,
  questionIds: readonly string[],
): NonNullable<HubProposalInspection["discovery"]> {
  const receipt = session.discoveryReceipt!;
  const candidates = new Map(receipt.guidanceRequest.candidates.map((candidate) => [candidate.id, candidate]));
  const embeddedGroups = [...new Set(receipt.inventory.items.filter((item) => item.outcome === "materialized")
    .flatMap((item) => item.outputs.filter((output) => candidates.get(output.candidateId)?.disposition === "embedded")
      .map((output) => candidates.get(output.candidateId)?.identityHint ?? output.candidateId)))]
    .slice(0, 64);
  const bundle = loadOkfBundle(root);
  const relationsAndFlows = [...bundle.concepts.values()].filter((concept) => concept.type === "Flow"
    || Array.isArray(concept.frontmatter.relationships) && concept.frontmatter.relationships.length > 0)
    .map((concept) => concept.conceptId).sort().slice(0, 64);
  return {
    sourceRevision: receipt.source.commit,
    lanes: receipt.coverage.lanes,
    embeddedGroups,
    relationsAndFlows,
    questions: [...questionIds].slice(0, 64),
    ignoredCounts: receipt.coverage.ignoredCounts,
    ignoredReasons: Object.keys(receipt.coverage.ignoredCounts).sort(),
    limitations: receipt.coverage.limitations,
  };
}

export function retainInitialDiscoveryDebt(session: ReceiptMaterializationContext, root: string): void {
  if (session.mode !== "new" || !session.discoveryReceipt) return;
  const coverage = receiptCoverage(session.discoveryReceipt);
  if (!coverage.partial) return;
  const repository = [...loadOkfBundle(root).concepts.values()].find((concept) =>
    readRepositoryIdentityRecord(concept)?.id === session.sourceRepositoryId);
  if (!repository) throw new Error("Initial Ingest coverage debt requires its canonical Repository");
  const agentbase = mapping(repository.frontmatter.agentbase);
  fs.writeFileSync(path.join(root, repository.path), renderConceptDocument({ ...repository,
    frontmatter: { ...repository.frontmatter, agentbase: { ...agentbase,
      repository: { ...mapping(agentbase.repository), refresh_coverage: {
        status: "partial", omitted_changed_paths: 0, coverage_passes: 0,
        limitations: coverage.limitations, observed_at: session.createdAt,
      } },
    } },
  }), { mode: 0o600 });
}
