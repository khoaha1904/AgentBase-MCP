import type { CallToolResult } from "@modelcontextprotocol/server";

import { normalizeConfirmedDomain, type OkfAuthoringGuidanceRequest } from "../../../core/knowledge/index.ts";
import type { HubToolActions, HubToolContext } from "./mcp-tool-actions.ts";
import type { QuestionDeclaration } from "../authoring/questions.ts";

function result(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }], ...(isError ? { isError: true } : {}) };
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
    if (typeof entry.subject !== "string" || typeof entry.property !== "string"
      || !Array.isArray(entry.claim_ids) || !entry.claim_ids.every((id) => typeof id === "string")
      || (entry.missing_evidence !== undefined && (!Array.isArray(entry.missing_evidence)
        || !entry.missing_evidence.every((item) => typeof item === "string")))) {
      throw new Error("question declaration is invalid");
    }
    return { subject: entry.subject, property: entry.property, claimIds: entry.claim_ids as string[],
      missingEvidence: (entry.missing_evidence ?? []) as string[] };
  });
}

export async function callHubOkfTool(
  name: string,
  args: Readonly<Record<string, unknown>>,
  actions?: HubToolActions,
  context: HubToolContext = {},
): Promise<CallToolResult> {
  try {
    if (!actions) throw new Error("AgentBase Hub runtime is not configured");
    if (name === "get_hub_status") return result(await actions.status());
    if (name === "configure_hub") {
      const mode = required(args, "mode");
      if (mode !== "existing" && mode !== "new") throw new Error("mode must be existing or new");
      const repositoryUrl = args.repository_url;
      if (mode === "existing" && (typeof repositoryUrl !== "string" || !repositoryUrl)) {
        throw new Error("repository_url is required when attaching an existing Hub");
      }
      if (mode === "new" && repositoryUrl !== undefined) {
        throw new Error("repository_url is not accepted for a new local-only Hub");
      }
      return result(await actions.configure({ mode, ...(typeof repositoryUrl === "string" ? { repositoryUrl } : {}) }));
    }
    if (name === "preview_hub_bootstrap" || name === "bootstrap_hub") {
      const mode = required(args, "mode");
      if (mode !== "all-to-main" && mode !== "base-to-main-knowledge-pr") throw new Error("bootstrap mode is invalid");
      const repositoryUrl = required(args, "repository_url");
      return result(name === "preview_hub_bootstrap"
        ? await actions.previewBootstrap(repositoryUrl, mode)
        : await actions.bootstrap(repositoryUrl, mode));
    }
    if (name === "preflight_hub_ingest") {
      return result(await actions.preflight(required(args, "source_repository")));
    }
    if (name === "prepare_hub_okf") {
      const mode = required(args, "mode");
      if (mode !== "new" && mode !== "refresh") throw new Error("mode must be new or refresh");
      if (mode === "new" && args.evidence_digest !== undefined) {
        throw new Error("new Initial Ingest derives evidence_digest; callers must not supply it");
      }
      if (mode === "refresh" && args.evidence_digest === undefined) throw new Error("refresh requires evidence_digest");
      const confirmedDomain = args.confirmed_domain === undefined
        ? undefined : normalizeConfirmedDomain(args.confirmed_domain);
      const coverage = args.coverage;
      if (coverage !== undefined && (!coverage || typeof coverage !== "object" || Array.isArray(coverage)
        || typeof (coverage as Record<string, unknown>).partial !== "boolean"
        || !Array.isArray((coverage as Record<string, unknown>).limitations)
        || !(coverage as Record<string, unknown>).limitations || !((coverage as Record<string, unknown>).limitations as unknown[])
          .every((item) => typeof item === "string" && item.length > 0 && item.length <= 512))) {
        throw new Error("coverage must contain partial and bounded limitations");
      }
      return result(await actions.prepare({
        mode,
        sourceRepository: required(args, "source_repository"),
        ...(args.evidence_digest === undefined ? {} : { evidenceDigest: required(args, "evidence_digest") }),
        subjectDirectory: required(args, "subject_directory"),
        ...(confirmedDomain ? { confirmedDomain } : {}),
        ...(args.signals === undefined ? {} : { signals: Array.isArray(args.signals)
          && args.signals.every((signal) => typeof signal === "string")
          ? args.signals as string[] : (() => { throw new Error("signals must be a string list"); })() }),
        ...(args.guidance_request === undefined ? {} : { guidanceRequest: guidanceRequest(args.guidance_request) }),
        ...(coverage === undefined ? {} : { coverage: coverage as { partial: boolean; limitations: string[] } }),
      }));
    }
    if (name === "finalize_hub_okf_proposal") {
      return result(await actions.finalize(required(args, "session_id"), questionDeclarations(args.questions)));
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
    if (name === "traverse_hub_okf") {
      const direction = args.direction;
      if (direction !== undefined && direction !== "outbound" && direction !== "inbound" && direction !== "both") {
        throw new Error("direction must be outbound, inbound or both");
      }
      const maxDepth = args.max_depth, limit = args.limit;
      if (maxDepth !== undefined && (!Number.isInteger(maxDepth) || Number(maxDepth) < 1 || Number(maxDepth) > 3)) {
        throw new Error("max_depth must be an integer from 1 to 3");
      }
      if (limit !== undefined && (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 100)) {
        throw new Error("limit must be an integer from 1 to 100");
      }
      const kinds = optionalStringList(args, "kinds");
      return result(await actions.traverse(required(args, "start"), {
        ...(typeof direction === "string" ? { direction } : {}),
        ...(kinds ? { kinds } : {}),
        ...(maxDepth === undefined ? {} : { maxDepth: maxDepth as number }),
        ...(limit === undefined ? {} : { limit: limit as number }),
      }));
    }
    if (name === "read_hub_okf_concept") return result(await actions.read(required(args, "path")));
    if (name === "read_hub_live_evidence") {
      return result(await actions.readLiveEvidence(required(args, "path"), context.liveSource));
    }
    if (name === "list_hub_questions") {
      const status = args.status, limit = args.limit;
      if (status !== undefined && status !== "pending" && status !== "resolved") {
        throw new Error("status must be pending or resolved");
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
    if (name === "list_pending_hub_okf") return result(await actions.listPending());
    if (name === "submit_hub_okf_proposals") {
      if (!Array.isArray(args.proposal_ids) || !args.proposal_ids.length
        || !args.proposal_ids.every((value) => typeof value === "string" && value.length > 0)) {
        throw new Error("proposal_ids must be a non-empty string list");
      }
      return result(await actions.submitMany(args.proposal_ids as string[]));
    }
    if (name === "synchronize_hub_okf") return result(await actions.synchronize());
    if (name === "recover_hub_okf") return result(await actions.recover(required(args, "proposal_id")));
    const proposalId = required(args, "proposal_id");
    if (name === "inspect_hub_okf_proposal") return result(await actions.inspect(proposalId));
    if (name === "accept_hub_okf_proposal") {
      return result(await actions.accept(proposalId, required(args, "proposal_digest")));
    }
    throw new Error(`unsupported Hub action: ${name}`);
  } catch (error) {
    return result({ error: error instanceof Error ? error.message : "Hub action failed" }, true);
  }
}
