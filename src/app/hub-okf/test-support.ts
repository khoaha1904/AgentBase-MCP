import { createHash } from "node:crypto";

import {
  createInventoryItemId, createInventoryReceipt, createQuestionPlanId,
  createRepositorySourceResource, DISCOVERY_LANES, getOkfAuthoringGuidance,
  type DiscoveryGroup, type DiscoverySourceIdentity, type InventoryReceipt,
  type OkfAuthoringGuidanceRequest, type QuestionPlan,
} from "../../core/knowledge/index.ts";

function fixtureHex(label: string, length: number): string {
  return createHash("sha256").update(label).digest("hex").slice(0, length);
}

export function createTestInventoryReceipt(input: Readonly<{
  label: string;
  source: DiscoverySourceIdentity;
  hubProfileId: string;
  publishedBase: string;
  request: OkfAuthoringGuidanceRequest;
  limitations?: readonly string[];
  questions?: readonly Readonly<{
    kind: QuestionPlan["kind"];
    targetCandidateId: string;
    property: string;
    scopeKey: string;
    missingEvidence: readonly string[];
  }>[];
}>): InventoryReceipt {
  const observations = new Map([...input.request.semanticObservations, ...input.request.resourceObservations]
    .map((observation) => [observation.id, observation]));
  const candidateGroups: DiscoveryGroup[] = input.request.candidates.map((candidate, index) => {
    const sources = [...new Map(candidate.evidenceIds.map((id) => observations.get(id)?.source)
      .filter((source) => source !== undefined).map((source) => [JSON.stringify(source), source])).values()];
    if (!sources.length) throw new Error(`test Receipt candidate has no evidence: ${candidate.id}`);
    return {
      id: `discovery-group-${fixtureHex(`${input.label}:candidate:${index}:${candidate.id}`, 24)}`,
      lane: "identity-product",
      kind: "test-candidate",
      priority: "p0",
      title: candidate.identityHint,
      count: candidate.evidenceIds.length,
      sources,
      hints: [candidate.identityBasis],
      limitations: [],
    };
  });
  const questionGroups: DiscoveryGroup[] = (input.questions ?? []).map((question, index) => {
    const candidate = input.request.candidates.find((entry) => entry.id === question.targetCandidateId);
    const sources = candidate ? [...new Map(candidate.evidenceIds.map((id) => observations.get(id)?.source)
      .filter((source) => source !== undefined).map((source) => [JSON.stringify(source), source])).values()] : [];
    if (!candidate || !sources.length) throw new Error(`test Receipt Question target has no evidence: ${question.targetCandidateId}`);
    return {
      id: `discovery-group-${fixtureHex(`${input.label}:question:${index}:${question.scopeKey}`, 24)}`,
      lane: "identity-product",
      kind: "test-question",
      priority: "p0",
      title: `${candidate.identityHint} question`,
      count: sources.length,
      sources,
      hints: [question.property],
      limitations: [],
    };
  });
  const groups = [...candidateGroups, ...questionGroups];
  const seedId = `discovery-seed-${fixtureHex(`${input.label}:seed`, 24)}`;
  const seed = {
    id: seedId,
    digest: `sha256:${fixtureHex(`${input.label}:seed-digest`, 64)}`,
    source: input.source,
    engine: { id: "test-codebase-memory", version: "0.10.8", profile: "agentbase-mvp-12-v1" },
    lanes: DISCOVERY_LANES.map((lane) => ({ lane,
      status: lane === "identity-product" ? "covered" as const : "absent-after-check" as const })),
    groups,
    capture: { nodeCount: groups.length, edgeCount: 0, coverageTerminal: true, truncated: false,
      p1P2Overflow: 0, limitations: [] },
    state: "ready" as const,
  };
  const items = input.request.candidates.map((candidate, index) => ({
    id: createInventoryItemId(seedId, candidateGroups[index]!.id),
    originGroupId: candidateGroups[index]!.id,
    outcome: "materialized" as const,
    outputs: [{ candidateId: candidate.id,
      ...(candidate.disposition === "embedded" ? { parentCandidateId: candidate.parentCandidateId! } : {}) }],
  }));
  const questionPlans = (input.questions ?? []).map((question, index) => {
    const candidate = input.request.candidates.find((entry) => entry.id === question.targetCandidateId)!;
    const evidenceIds = question.kind === "conflict" ? candidate.evidenceIds.slice(0, 2) : candidate.evidenceIds.slice(0, 1);
    if (!evidenceIds.length || question.kind === "conflict" && evidenceIds.length < 2) {
      throw new Error(`test Receipt Question lacks exact evidence: ${question.scopeKey}`);
    }
    return {
      id: createQuestionPlanId(seedId, questionGroups[index]!.id),
      kind: question.kind,
      originGroupId: questionGroups[index]!.id,
      targetCandidateId: question.targetCandidateId,
      property: question.property,
      scopeKey: question.scopeKey,
      candidateEvidence: evidenceIds.map((evidenceId) => {
        const observation = observations.get(evidenceId)!;
        return { candidateKey: candidate.id,
          sourceResource: createRepositorySourceResource(input.source.repositoryId, observation.source.path,
            observation.source.startLine, observation.source.endLine),
          observedRevision: input.source.commit };
      }),
      missingEvidence: question.missingEvidence,
      limitations: [],
    };
  });
  const inventory = { seedId, items: [...items, ...questionPlans.map((plan) => ({
    id: createInventoryItemId(seedId, plan.originGroupId),
    originGroupId: plan.originGroupId,
    outcome: "question" as const,
    outputs: [],
    questionPlanId: plan.id,
  }))], questionPlans, limitations: input.limitations ?? [] };
  const guidance = getOkfAuthoringGuidance(input.request);
  return createInventoryReceipt({ seed, inventory, guidanceRequest: input.request, guidance,
    hubProfileId: input.hubProfileId, publishedBase: input.publishedBase,
    createdAt: "2026-08-25T00:00:00.000Z" });
}
