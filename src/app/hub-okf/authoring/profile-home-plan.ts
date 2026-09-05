import {
  agentBaseProfileConceptPath,
  conceptIdentityFromPath,
  getOkfConceptSchema,
  legacyConfirmedDomainHomePlan,
  validateAgentBaseInitialIngestHomePlan,
  type AgentBaseConceptHome,
  type AgentBaseHomeSelection,
  type AgentBaseInitialIngestHomePlan,
  type ConfirmedDomain,
  type HubConceptSummary,
  type OkfAuthoringGuidance,
  type OkfAuthoringGuidanceRequest,
} from "../../../core/knowledge/index.ts";

export type ResolvedProfileInitialIngestPlan = Readonly<{
  plan: AgentBaseInitialIngestHomePlan;
  repositoryCandidateId: string;
  subjectDirectory: string;
}>;

export function resolveProfileRefreshSubject(
  requested: string,
  resolved: HubConceptSummary | undefined,
): string {
  if (!resolved || resolved.type !== "Repository") {
    throw new Error("Profile Refresh could not resolve the existing Repository concept path");
  }
  if (requested === resolved.identity) return resolved.identity;
  const legacy = /^repositories\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(requested);
  if (legacy?.[1] === resolved.identity.split("/").at(-1)) return resolved.identity;
  throw new Error(`Profile Refresh subject must match the resolved Repository ${resolved.identity}`);
}

function conceptHome(home: AgentBaseHomeSelection): AgentBaseConceptHome {
  return home.kind === "shared" ? { kind: "shared" } : { kind: "domain", selector: home.identity };
}

function repositorySlug(subjectDirectory: string): string {
  const match = /^repositories\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(subjectDirectory);
  if (!match?.[1]) throw new Error("new Initial Ingest subject_directory must be repositories/<slug>");
  return match[1];
}

export function resolveProfileInitialIngestPlan(input: Readonly<{
  subjectDirectory: string;
  homePlan?: AgentBaseInitialIngestHomePlan;
  confirmedDomain?: ConfirmedDomain;
  request: OkfAuthoringGuidanceRequest;
  guidance: OkfAuthoringGuidance;
}>): ResolvedProfileInitialIngestPlan {
  if (Boolean(input.homePlan) === Boolean(input.confirmedDomain)) {
    throw new Error("Profile Initial Ingest requires exactly one home_plan or confirmed_domain");
  }
  const selected = input.guidance.recommendations.filter((item) =>
    ["exact", "suggested"].includes(item.status) && item.schema && item.schema.type !== "Domain");
  const repositoryCandidateId = selected.find((item) => item.schema?.type === "Repository")?.candidateId
    ?? input.request.candidates[0]?.id;
  if (!repositoryCandidateId) throw new Error("Profile Initial Ingest requires one Repository candidate");
  const selectedByCandidate = new Map(selected.map((item) => [item.candidateId, item]));
  const repositoryRecommendation = selected.find((item) => item.schema?.type === "Repository");
  if (!repositoryRecommendation) {
    const repositorySchema = getOkfConceptSchema("Repository");
    if (!repositorySchema) throw new Error("Repository schema is unavailable");
    selectedByCandidate.set(repositoryCandidateId, {
      candidateId: repositoryCandidateId, disposition: "concept", status: "exact",
      schema: repositorySchema, matchedEvidence: [], missingEvidence: [], technology: {}, limitations: [],
    });
  }
  const plan = input.homePlan
    ? validateAgentBaseInitialIngestHomePlan(input.homePlan)
    : legacyConfirmedDomainHomePlan(input.confirmedDomain!, [repositoryCandidateId,
      ...selected.filter((item) => item.schema?.type === "System").map((item) => item.candidateId)]);
  for (const exception of plan.exceptions) {
    if (exception.candidateId === repositoryCandidateId) {
      throw new Error("Profile Initial Ingest Repository must use default_home");
    }
    if (!selectedByCandidate.has(exception.candidateId)) {
      throw new Error(`home plan exception does not resolve to a materialized concept candidate: ${exception.candidateId}`);
    }
  }
  for (const participation of plan.participations) {
    const recommendation = selectedByCandidate.get(participation.candidateId);
    if (!recommendation) {
      throw new Error(`home plan participation does not resolve to a materialized concept candidate: ${participation.candidateId}`);
    }
    if (!recommendation.schema?.relationshipGuidance.some((relation) =>
      relation.kind === "part-of" && relation.targetTypes.includes("Domain"))) {
      throw new Error(`home plan participation is not admitted by the candidate schema: ${participation.candidateId}`);
    }
  }
  const repositoryPath = agentBaseProfileConceptPath(conceptHome(plan.defaultHome), "Repository",
    repositorySlug(input.subjectDirectory));
  return { plan, repositoryCandidateId, subjectDirectory: conceptIdentityFromPath(repositoryPath) };
}
