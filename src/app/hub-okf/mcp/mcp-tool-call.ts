import type { CallToolResult } from "@modelcontextprotocol/server";

import {
  normalizeAgentBaseInitialIngestHomePlan, normalizeConfirmedDomain,
  type CanonicalRelationshipKind, type OkfAuthoringGuidanceRequest,
} from "../../../core/knowledge/index.ts";
import type { HubToolActions } from "./mcp-tool-actions.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";
import type { HubRemovalDeclaration } from "../../../core/knowledge/index.ts";
import type { EnrichmentAnswer, EnrichmentCandidateInput } from "../enrichment/index.ts";
import { REFRESH_CHANGE_OUTCOME_KINDS, type RefreshChangeOutcome } from "../authoring/refresh-change-accounting.ts";

function result(value: unknown, isError = false): CallToolResult {
  const structuredContent = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
    ...(structuredContent === undefined ? {} : { structuredContent }),
    ...(isError ? { isError: true } : {}),
  };
}

function required(args: Readonly<Record<string, unknown>>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || !value) throw new Error(`${key} is required`);
  return value;
}

function optionalStringList(args: Readonly<Record<string, unknown>>, key: string): readonly string[] | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.length || !value.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`${key} must be a non-empty string list`);
  }
  return value as string[];
}

function exactRecord(value: unknown, name: string, requiredKeys: readonly string[], optionalKeys: readonly string[] = []): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be an object`);
  const record = value as Record<string, unknown>, keys = Object.keys(record);
  if (requiredKeys.some((key) => !(key in record)) || keys.some((key) => !requiredKeys.includes(key) && !optionalKeys.includes(key))) {
    throw new Error(`${name} contains unknown or missing fields`);
  }
  return record;
}

function stringList(value: unknown, name: string, allowEmpty: boolean): readonly string[] {
  if (!Array.isArray(value) || (!allowEmpty && !value.length) || !value.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`${name} must be ${allowEmpty ? "a" : "a non-empty"} string list`);
  }
  return value as string[];
}

function enrichmentCandidates(value: unknown): readonly EnrichmentCandidateInput[] {
  if (!Array.isArray(value) || !value.length || value.length > 64) throw new Error("candidates must contain 1-64 entries");
  return value.map((item, index) => {
    const entry = exactRecord(item, `candidate ${index + 1}`,
      ["id", "kind", "source_concept_id", "queue", "identity_evidence_ids", "interaction_evidence_ids"],
      ["target_concept_id", "predicate", "expected_arn", "question"]);
    const queue = exactRecord(entry.queue, `candidate ${index + 1} queue`, ["name", "account_id", "region"]);
    const question = entry.question === undefined ? undefined
      : exactRecord(entry.question, `candidate ${index + 1} question`, ["id", "revision"]);
    if (typeof entry.id !== "string" || !["identity", "relation", "question"].includes(String(entry.kind))
      || typeof entry.source_concept_id !== "string" || typeof queue.name !== "string"
      || typeof queue.account_id !== "string" || typeof queue.region !== "string"
      || (entry.target_concept_id !== undefined && typeof entry.target_concept_id !== "string")
      || (entry.predicate !== undefined && typeof entry.predicate !== "string")
      || (entry.expected_arn !== undefined && typeof entry.expected_arn !== "string")
      || (question && (typeof question.id !== "string" || !Number.isInteger(question.revision)))) {
      throw new Error(`candidate ${index + 1} is invalid`);
    }
    return {
      id: entry.id, kind: entry.kind as EnrichmentCandidateInput["kind"], sourceConceptId: entry.source_concept_id,
      ...(typeof entry.target_concept_id === "string" ? { targetConceptId: entry.target_concept_id } : {}),
      ...(typeof entry.predicate === "string" ? { predicate: entry.predicate as CanonicalRelationshipKind } : {}),
      ...(typeof entry.expected_arn === "string" ? { expectedArn: entry.expected_arn } : {}),
      queue: { name: queue.name, accountId: queue.account_id, region: queue.region },
      identityEvidenceIds: stringList(entry.identity_evidence_ids, "identity_evidence_ids", false),
      interactionEvidenceIds: stringList(entry.interaction_evidence_ids, "interaction_evidence_ids", true),
      ...(question ? { question: { id: question.id as string, revision: question.revision as number } } : {}),
    };
  });
}

function enrichmentRevision(args: Readonly<Record<string, unknown>>): number {
  if (!Number.isInteger(args.manifest_revision) || Number(args.manifest_revision) < 1) {
    throw new Error("manifest_revision must be a positive integer");
  }
  return args.manifest_revision as number;
}

function enrichmentAnswers(value: unknown): readonly EnrichmentAnswer[] {
  if (!Array.isArray(value) || value.length > 64) throw new Error("answers must be a list of at most 64 entries");
  return value.map((item, index) => {
    const entry = exactRecord(item, `answer ${index + 1}`, ["candidate_id", "question_id", "question_revision", "action"], ["answer", "maintainer"]);
    if (typeof entry.candidate_id !== "string" || !["answer", "defer"].includes(String(entry.action))
      || typeof entry.question_id !== "string" || !Number.isInteger(entry.question_revision) || Number(entry.question_revision) < 1
      || (entry.answer !== undefined && typeof entry.answer !== "string")
      || (entry.maintainer !== undefined && typeof entry.maintainer !== "string")) throw new Error(`answer ${index + 1} is invalid`);
    return { candidateId: entry.candidate_id, questionId: entry.question_id,
      questionRevision: entry.question_revision as number, action: entry.action as EnrichmentAnswer["action"],
      ...(typeof entry.answer === "string" ? { answer: entry.answer } : {}),
      ...(typeof entry.maintainer === "string" ? { maintainer: entry.maintainer } : {}) };
  });
}

function guidanceRequest(value: unknown): OkfAuthoringGuidanceRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("guidance_request must be an object");
  const input = value as Record<string, unknown>;
  if (Object.keys(input).sort().join("\0") !== ["candidates", "semantic_observations", "resource_observations"].sort().join("\0")) {
    throw new Error("guidance_request contains unknown or missing fields");
  }
  const list = (item: unknown, name: string): readonly unknown[] => {
    if (!Array.isArray(item)) throw new Error(`${name} must be a list`);
    return item;
  };
  const record = (item: unknown, name: string, expected: readonly string[]): Record<string, unknown> => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${name} must be an object`);
    const current = item as Record<string, unknown>;
    if (Object.keys(current).sort().join("\0") !== [...expected].sort().join("\0")) throw new Error(`${name} contains unknown or missing fields`);
    return current;
  };
  const source = (item: unknown) => {
    const current = record(item, "observation source", ["path", "start_line", "end_line"]);
    return { path: current.path as string, startLine: current.start_line as number, endLine: current.end_line as number };
  };
  return {
    candidates: list(input.candidates, "candidates").map((item) => {
      const raw = item as Record<string, unknown>;
      const current = record(item, "candidate", ["id", "identity_hint", "identity_basis", "query_value", "evidence_ids", "disposition",
        ...(raw?.parent_candidate_id === undefined ? [] : ["parent_candidate_id"]),
        ...(raw?.suggested_type === undefined ? [] : ["suggested_type"]),
        ...(raw?.promotion === undefined ? [] : ["promotion"])]);
      const promotion = current.promotion === undefined ? undefined
        : record(current.promotion, "candidate promotion", ["basis", "evidence_ids"]);
      return { id: current.id as string, identityHint: current.identity_hint as string,
        identityBasis: current.identity_basis as string, queryValue: current.query_value as string,
        evidenceIds: list(current.evidence_ids, "evidence_ids") as string[],
        disposition: current.disposition as "concept" | "embedded",
        ...(current.parent_candidate_id === undefined ? {} : { parentCandidateId: current.parent_candidate_id as string }),
        ...(current.suggested_type === undefined ? {} : { suggestedType: current.suggested_type as string }),
        ...(promotion === undefined ? {} : { promotion: {
          basis: promotion.basis as "shared-contract" | "cross-boundary" | "ownership" | "lifecycle" | "failure" | "security" | "operational",
          evidenceIds: list(promotion.evidence_ids, "promotion evidence_ids") as string[],
        } }) };
    }),
    semanticObservations: list(input.semantic_observations, "semantic_observations").map((item) => {
      const current = record(item, "semantic observation", ["id", "candidate_id", "role", "signal", "source"]);
      return { id: current.id as string, candidateId: current.candidate_id as string,
        role: current.role as "documentation" | "implementation" | "configuration",
        signal: current.signal as string, source: source(current.source) };
    }),
    resourceObservations: list(input.resource_observations, "resource_observations").map((item) => {
      const current = record(item, "resource observation", ["id", "candidate_id", "source_tool", "resource_type", "address", "source"]);
      return { id: current.id as string, candidateId: current.candidate_id as string,
        sourceTool: current.source_tool as "terraform" | "terragrunt", resourceType: current.resource_type as string,
        address: current.address as string, source: source(current.source) };
    }),
  };
}

function questionDeclarations(value: unknown): readonly QuestionDeclaration[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 64) throw new Error("questions must be a list of at most 64 entries");
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("each question must be an object");
    const entry = item as Record<string, unknown>;
    const refs = entry.observation_refs;
    if (typeof entry.subject !== "string" || typeof entry.property !== "string"
      || !Array.isArray(refs) || !refs.length || !refs.every((ref) => {
        if (!ref || typeof ref !== "object" || Array.isArray(ref)) return false;
        const current = ref as Record<string, unknown>;
        return Object.keys(current).sort().join("\0") === "role\0source_id"
          && ["documentation", "implementation", "configuration", "provider"].includes(String(current.role))
          && typeof current.source_id === "string" && current.source_id.length > 0;
      })
      || (entry.missing_evidence !== undefined && (!Array.isArray(entry.missing_evidence)
        || !entry.missing_evidence.every((item) => typeof item === "string")))) {
      throw new Error("question declaration is invalid");
    }
    return { subject: entry.subject, property: entry.property,
      observationRefs: (refs as Array<Record<string, unknown>>).map((ref) => ({
        role: ref.role as "documentation" | "implementation" | "configuration" | "provider",
        sourceId: ref.source_id as string,
      })),
      missingEvidence: (entry.missing_evidence ?? []) as string[] };
  });
}

function removalDeclarations(value: unknown): readonly HubRemovalDeclaration[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 64) throw new Error("removals must be a list of at most 64 entries");
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("each removal must be an object");
    const entry = item as Record<string, unknown>;
    const kind = entry.kind;
    if (!["concept", "repository-contribution"].includes(String(kind))
      || typeof entry.concept_id !== "string" || typeof entry.reason !== "string"
      || !Array.isArray(entry.evidence_resources) || !entry.evidence_resources.every((resource) => typeof resource === "string")) {
      throw new Error("removal declaration is invalid");
    }
    return { kind: kind as HubRemovalDeclaration["kind"], conceptId: entry.concept_id,
      reason: entry.reason, evidenceResources: entry.evidence_resources as string[] };
  });
}

function refreshChangeOutcomes(value: unknown): readonly RefreshChangeOutcome[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 128) {
    throw new Error("change_accounting must be a list of at most 128 entries");
  }
  return value.map((item, index) => {
    const entry = exactRecord(item, `change accounting ${index + 1}`, ["path", "outcome", "reason"]);
    if (typeof entry.path !== "string" || entry.path.length < 1 || entry.path.length > 512
      || !REFRESH_CHANGE_OUTCOME_KINDS.includes(entry.outcome as RefreshChangeOutcome["outcome"])
      || typeof entry.reason !== "string" || entry.reason.length < 1 || entry.reason.length > 512) {
      throw new Error(`change accounting ${index + 1} is invalid`);
    }
    return { path: entry.path, outcome: entry.outcome as RefreshChangeOutcome["outcome"], reason: entry.reason };
  });
}

export async function callHubOkfTool(
  name: string,
  args: Readonly<Record<string, unknown>>,
  actions?: HubToolActions,
): Promise<CallToolResult> {
  try {
    if (!actions) throw new Error("AgentBase Hub runtime is not configured");
    if (name === "get_hub_status") return result(await actions.status());
    if (name === "configure_hub") {
      return result(await actions.configure({ repositoryUrl: required(args, "repository_url"),
        targetBranch: required(args, "target_branch") }));
    }
    if (name === "preview_hub_bootstrap" || name === "bootstrap_hub") {
      const repositoryUrl = required(args, "repository_url");
      const targetBranch = required(args, "target_branch");
      return result(name === "preview_hub_bootstrap"
        ? await actions.previewBootstrap(repositoryUrl, targetBranch)
        : await actions.bootstrap(repositoryUrl, targetBranch));
    }
    if (name === "preflight_hub_ingest") {
      return result(await actions.preflight(required(args, "source_repository")));
    }
    if (name === "scan_workspace_repositories") {
      return result(await actions.scan(required(args, "workspace_root")));
    }
    if (name === "prepare_hub_profile_migration") return result(await actions.prepareMigration());
    if (name === "finalize_hub_profile_migration_proposal") {
      if (!Array.isArray(args.moves) || args.moves.length > 4096) {
        throw new Error("moves must be a list of at most 4096 exact file moves");
      }
      const moves = args.moves.map((value, index) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          throw new Error(`migration move ${index + 1} must be an object`);
        }
        const move = value as Record<string, unknown>;
        if (Object.keys(move).sort().join("\0") !== "from_path\0to_path") {
          throw new Error(`migration move ${index + 1} contains unknown or missing fields`);
        }
        return { fromPath: required(move, "from_path"), toPath: required(move, "to_path") };
      });
      return result(await actions.finalizeMigration({ sessionId: required(args, "session_id"), moves }));
    }
    if (name === "prepare_hub_okf") {
      const mode = required(args, "mode");
      if (mode !== "new" && mode !== "refresh") throw new Error("mode must be new or refresh");
      const refreshScope = args.refresh_scope;
      if (refreshScope !== undefined && refreshScope !== "delta" && refreshScope !== "coverage") {
        throw new Error("refresh_scope must be delta or coverage");
      }
      if (mode === "new" && refreshScope !== undefined) throw new Error("Initial Ingest does not accept refresh_scope");
      if (mode === "new" && args.evidence_digest !== undefined) {
        throw new Error("new Initial Ingest derives evidence_digest; callers must not supply it");
      }
      if (mode === "refresh" && args.evidence_digest !== undefined) {
        throw new Error("refresh derives evidence_digest; callers must not supply it");
      }
      if (mode === "new" && (args.guidance_request !== undefined || args.coverage !== undefined || args.signals !== undefined)) {
        throw new Error("new Initial Ingest accepts discovery_receipt_id instead of mutable guidance, coverage or signals");
      }
      if (mode === "new" && typeof args.discovery_receipt_id !== "string") {
        throw new Error("new Initial Ingest requires discovery_receipt_id");
      }
      if (mode === "refresh" && args.discovery_receipt_id !== undefined) {
        throw new Error("Refresh does not accept discovery_receipt_id");
      }
      if (mode === "refresh" && args.home_plan !== undefined) {
        throw new Error("Refresh does not accept home_plan");
      }
      if (args.home_plan !== undefined && args.confirmed_domain !== undefined) {
        throw new Error("Initial Ingest accepts home_plan or confirmed_domain, never both");
      }
      const confirmedDomain = args.confirmed_domain === undefined
        ? undefined : normalizeConfirmedDomain(args.confirmed_domain);
      const homePlan = args.home_plan === undefined
        ? undefined : normalizeAgentBaseInitialIngestHomePlan(args.home_plan);
      const coverage = args.coverage;
      if (coverage !== undefined && (!coverage || typeof coverage !== "object" || Array.isArray(coverage)
        || typeof (coverage as Record<string, unknown>).partial !== "boolean"
        || !Array.isArray((coverage as Record<string, unknown>).limitations)
        || !(coverage as Record<string, unknown>).limitations || !((coverage as Record<string, unknown>).limitations as unknown[])
          .every((item) => typeof item === "string" && item.length > 0 && item.length <= 512))) {
        throw new Error("coverage must contain partial and bounded limitations");
      }
      if (mode === "refresh" && refreshScope === "coverage" && coverage === undefined) {
        throw new Error("Coverage Refresh requires coverage");
      }
      return result(await actions.prepare({
        mode,
        ...(mode === "refresh" && refreshScope !== undefined
          ? { refreshScope: refreshScope as "delta" | "coverage" } : {}),
        sourceRepository: required(args, "source_repository"),
        subjectDirectory: required(args, "subject_directory"),
        ...(confirmedDomain ? { confirmedDomain } : {}),
        ...(homePlan ? { homePlan } : {}),
        ...(args.signals === undefined ? {} : { signals: Array.isArray(args.signals)
          && args.signals.every((signal) => typeof signal === "string")
          ? args.signals as string[] : (() => { throw new Error("signals must be a string list"); })() }),
        ...(args.guidance_request === undefined ? {} : { guidanceRequest: guidanceRequest(args.guidance_request) }),
        ...(coverage === undefined ? {} : { coverage: coverage as { partial: boolean; limitations: string[] } }),
        ...(typeof args.discovery_receipt_id === "string" ? { discoveryReceiptId: args.discovery_receipt_id } : {}),
      }));
    }
    if (name === "finalize_hub_okf_proposal") {
      return result(await actions.finalize(required(args, "session_id"), questionDeclarations(args.questions),
        removalDeclarations(args.removals), refreshChangeOutcomes(args.change_accounting)));
    }
    if (name === "prepare_batch_hub_ingest") {
      return result(await actions.prepareBatch({
        sourceRepositories: stringList(args.source_repositories, "source_repositories", false),
        proposedDomain: normalizeConfirmedDomain(args.proposed_domain),
      }));
    }
    if (name === "confirm_batch_hub_ingest") {
      if (!Array.isArray(args.assessments) || !args.assessments.length) throw new Error("assessments must be a non-empty list");
      const assessments = args.assessments.map((value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("batch assessment must be an object");
        const item = value as Record<string, unknown>, decision = item.decision;
        if (decision !== "match" && decision !== "override") throw new Error("batch assessment decision must be match or override");
        return { memberId: required(item, "member_id"), decision: decision as "match" | "override",
          evidencePath: required(item, "evidence_path") };
      });
      const revision = args.manifest_revision;
      if (!Number.isInteger(revision) || Number(revision) < 1) throw new Error("manifest_revision must be positive");
      return result(await actions.confirmBatch({ manifestId: required(args, "manifest_id"),
        manifestRevision: revision as number, assessments }));
    }
    if (name === "record_batch_hub_ingest_member") {
      const revision = args.manifest_revision;
      if (!Number.isInteger(revision) || Number(revision) < 1) throw new Error("manifest_revision must be positive");
      return result(await actions.recordBatchMember({ manifestId: required(args, "manifest_id"),
        manifestRevision: revision as number, memberId: required(args, "member_id"),
        sessionId: required(args, "session_id") }));
    }
    if (name === "retry_batch_hub_ingest_member" || name === "finalize_batch_hub_ingest_proposal") {
      const revision = args.manifest_revision;
      if (!Number.isInteger(revision) || Number(revision) < 1) throw new Error("manifest_revision must be positive");
      const input = { manifestId: required(args, "manifest_id"), manifestRevision: revision as number };
      return result(await (name === "retry_batch_hub_ingest_member"
        ? actions.retryBatchMember({ ...input, memberId: required(args, "member_id") })
        : actions.finalizeBatch(input)));
    }
    if (name === "revise_batch_hub_ingest_membership") {
      const revision = args.manifest_revision;
      if (!Number.isInteger(revision) || Number(revision) < 1) throw new Error("manifest_revision must be positive");
      return result(await actions.reviseBatch({ manifestId: required(args, "manifest_id"),
        manifestRevision: revision as number, memberIds: stringList(args.member_ids, "member_ids", false) }));
    }
    if (name === "prepare_domain_enrichment") {
      return result(await actions.prepareEnrichment({
        domainId: required(args, "domain_id"),
        repositoryIds: stringList(args.repository_ids, "repository_ids", false),
        candidates: enrichmentCandidates(args.candidates), accountId: required(args, "account_id"),
        regions: stringList(args.regions, "regions", false),
      }));
    }
    if (name === "revise_domain_enrichment_membership") {
      return result(await actions.reviseEnrichment({
        manifestId: required(args, "manifest_id"), manifestRevision: enrichmentRevision(args),
        repositoryIds: stringList(args.repository_ids, "repository_ids", false),
        candidates: enrichmentCandidates(args.candidates),
      }));
    }
    if (name === "run_domain_enrichment") {
      if (args.provider_session_confirmed !== true) throw new Error("provider_session_confirmed must be true");
      return result(await actions.runEnrichment({
        manifestId: required(args, "manifest_id"), manifestRevision: enrichmentRevision(args),
        providerSessionConfirmed: true,
        ...(args.retry_candidate_ids === undefined ? {} : {
          retryCandidateIds: stringList(args.retry_candidate_ids, "retry_candidate_ids", false),
        }),
      }));
    }
    if (name === "finalize_domain_enrichment_proposal") {
      return result(await actions.finalizeEnrichment({
        manifestId: required(args, "manifest_id"), manifestRevision: enrichmentRevision(args),
        answers: enrichmentAnswers(args.answers),
      }));
    }
    if (name === "search_hub_okf") {
      const limit = args.limit;
      if (limit !== undefined && (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 100)) {
        throw new Error("limit must be an integer from 1 to 100");
      }
      if (args.global !== undefined && typeof args.global !== "boolean") throw new Error("global must be a boolean");
      const types = optionalStringList(args, "types");
      return result(await actions.search(required(args, "query"), {
        ...(typeof args.domain === "string" ? { domain: args.domain } : {}),
        ...(types ? { types } : {}),
        ...(typeof args.global === "boolean" ? { global: args.global } : {}),
        ...(limit === undefined ? {} : { limit: limit as number }),
      }));
    }
    if (name === "read_hub_okf_concept") return result(await actions.read(required(args, "path")));
    if (name === "prepare_hub_visualization") {
      if (args.mode === "domain-site") {
        if (args.diagram_type !== undefined || args.concept_ids !== undefined) {
          throw new Error("domain-site mode does not accept diagram selection fields");
        }
        if (args.visibility_acknowledged !== true) throw new Error("visibility_acknowledged must be true for domain-site mode");
        return result(await actions.visualize({
          mode: "domain-site",
          domain: required(args, "domain"),
          outputDirectory: required(args, "output_directory"),
          visibilityAcknowledged: true,
        }));
      }
      if (args.mode !== "diagram") throw new Error("visualization mode must be diagram or domain-site");
      if (args.output_directory !== undefined || args.visibility_acknowledged !== undefined) {
        throw new Error("diagram mode does not accept Domain-site output fields");
      }
      if (args.diagram_type !== "architecture" && args.diagram_type !== "dependency" && args.diagram_type !== "sequence") {
        throw new Error("diagram_type must be architecture, dependency or sequence");
      }
      const conceptIds = stringList(args.concept_ids, "concept_ids", false);
      if (conceptIds.length > 64 || new Set(conceptIds).size !== conceptIds.length) {
        throw new Error("concept_ids must contain at most 64 unique values");
      }
      return result(await actions.visualize({
        mode: "diagram",
        domain: required(args, "domain"),
        diagramType: args.diagram_type,
        conceptIds,
      }));
    }
    if (name === "preview_hub_initialization") return result(await actions.previewHubInitialization());
    if (name === "initialize_hub") return result(await actions.initializeHub({
      expectedBase: required(args, "expected_base"),
      expectedInitializationDigest: required(args, "expected_initialization_digest"),
    }));
    if (name === "list_hub_questions") {
      const status = args.status, limit = args.limit;
      if (status !== undefined && status !== "open" && status !== "resolved" && status !== "needs-review") {
        throw new Error("status must be open, resolved or needs-review");
      }
      if (limit !== undefined && (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 100)) {
        throw new Error("limit must be an integer from 1 to 100");
      }
      return result(await actions.listQuestions({
        ...(typeof status === "string" ? { status } : {}),
        ...(limit === undefined ? {} : { limit: limit as number }),
      }));
    }
    if (name === "answer_hub_question") {
      const revision = args.question_revision;
      if (!Number.isInteger(revision) || Number(revision) < 1) {
        throw new Error("question_revision must be a positive integer");
      }
      return result(await actions.answerQuestion({
        questionId: required(args, "question_id"), revision: revision as number,
        answer: required(args, "answer"), maintainer: required(args, "maintainer"),
      }));
    }
    if (name === "publish_hub_okf_proposal") {
      const mode = args.publication_mode;
      if (mode !== "direct" && mode !== "pr") throw new Error("publication_mode must be direct or pr");
      const publication = await actions.publish({ proposalId: required(args, "proposal_id"),
        diffDigest: required(args, "proposal_digest"), mode });
      return result(publication, publication.remote !== "in-review"
        && !(publication.remote === "published" && publication.local === "recognized"));
    }
    if (name === "synchronize_hub_okf") return result(await actions.synchronize());
    if (name === "recover_hub_okf") return result(await actions.recover(required(args, "transaction_id")));
    const proposalId = required(args, "proposal_id");
    if (name === "inspect_hub_okf_proposal") return result(await actions.inspect(proposalId));
    throw new Error(`unsupported Hub action: ${name}`);
  } catch (error) {
    return result({ error: error instanceof Error ? error.message : "Hub action failed" }, true);
  }
}
