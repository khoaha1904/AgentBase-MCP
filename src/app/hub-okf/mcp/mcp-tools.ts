import { HUB_PROPOSAL_SUBJECT_PATTERN } from "../../../core/hub/index.ts";
import { HUB_OKF_QUERY_TOOLS } from "./mcp-query-tools.ts";

export const HUB_OKF_TOOLS = [
  {
    name: "get_hub_status",
    description: "Report whether AgentBase-MCP has no Hub, a local-only Hub, or an attached remote Hub.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "configure_hub",
    description: "Attach an existing AgentBase-Hub or create a new local-only Hub when OKF is first requested.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["existing", "new"] },
        repository_url: { type: "string", minLength: 1 },
      },
      required: ["mode"], additionalProperties: false,
    },
  },
  {
    name: "preview_hub_bootstrap",
    description: "Preview the exact base and knowledge commits for first publication to an empty GitHub repository.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["all-to-main", "base-to-main-knowledge-pr"] },
      },
      required: ["repository_url", "mode"], additionalProperties: false,
    },
  },
  {
    name: "bootstrap_hub",
    description: "Publish a local-only Hub to an explicitly supplied empty GitHub repository using the reviewed mode.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["all-to-main", "base-to-main-knowledge-pr"] },
      },
      required: ["repository_url", "mode"], additionalProperties: false,
    },
  },
  {
    name: "preflight_hub_ingest",
    description: "Resolve one local checkout against canonical Hub Repository identities and list bounded Domain summaries without creating a proposal.",
    inputSchema: {
      type: "object",
      properties: { source_repository: { type: "string", minLength: 1 } },
      required: ["source_repository"], additionalProperties: false,
    },
  },
  {
    name: "prepare_hub_okf",
    description: "Prepare a local new or refresh AgentBase Hub OKF proposal without publishing. Refresh returns bounded changed paths, observed source state and known gaps. New Initial Ingest returns editable skeletons only for promoted concepts and embeds non-promoted resource knowledge in its parent. selectedSchemas is the hard allowlist; Initial Ingest always includes Repository.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["new", "refresh"] },
        source_repository: { type: "string", minLength: 1 },
        subject_directory: {
          type: "string",
          pattern: HUB_PROPOSAL_SUBJECT_PATTERN.source,
          description: "Logical proposal focus; source repository identity and changed concept paths remain independent.",
        },
        confirmed_domain: {
          type: "object",
          description: "Optional owner-confirmed business Domain; never inferred from the repository name.",
          properties: {
            identity: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
            title: { type: "string", minLength: 1, maxLength: 120 },
          },
          required: ["identity", "title"], additionalProperties: false,
        },
        signals: {
          type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64,
          description: "Optional legacy Refresh signals for newly discovered concept roles. Existing current-Repository concept roles are retained automatically.",
        },
        guidance_request: {
          type: "object",
          description: "Required for new Initial Ingest; bounded source-backed candidates and observations. Every candidate declares disposition concept or embedded. candidate_id preserves primary attribution; standalone concepts may share known observations. Embedded candidates require parent_candidate_id, may cite only their own observations and receive no concept identity, path or relationship.",
          properties: {
            candidates: { type: "array", minItems: 1, maxItems: 64, items: { type: "object" } },
            semantic_observations: { type: "array", maxItems: 64, items: { type: "object" } },
            resource_observations: { type: "array", maxItems: 64, items: { type: "object" } },
          },
          required: ["candidates", "semantic_observations", "resource_observations"], additionalProperties: false,
        },
        coverage: {
          type: "object", properties: {
            partial: { type: "boolean" },
            limitations: { type: "array", maxItems: 64, items: { type: "string", minLength: 1, maxLength: 512 } },
          }, required: ["partial", "limitations"], additionalProperties: false,
        },
      },
      required: ["mode", "source_repository", "subject_directory"],
      additionalProperties: false,
    },
  },
  {
    name: "finalize_hub_okf_proposal",
    description: "Validate and lock an authored Hub workspace into one immutable local proposal. Omit questions that have no existing claim IDs; never send an empty claim_ids list.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", pattern: "^hub-session-[a-f0-9]{24}$" },
        questions: {
          type: "array", maxItems: 64, items: {
            type: "object", properties: {
              subject: { type: "string", minLength: 1, maxLength: 512 },
              property: { type: "string", minLength: 1, maxLength: 128 },
              claim_ids: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64 },
              missing_evidence: { type: "array", items: { type: "string", minLength: 1, maxLength: 512 }, maxItems: 64 },
            }, required: ["subject", "property", "claim_ids"], additionalProperties: false,
          },
        },
        lifecycle_intents: {
          type: "array", maxItems: 64, items: {
            type: "object", properties: {
              action: { type: "string", enum: ["remove-concept", "remove-contribution", "supersede", "retract"] },
              concept_id: { type: "string", minLength: 1 },
              replacement_concept_id: { type: "string", minLength: 1 },
              reason: { type: "string", minLength: 1, maxLength: 512 },
              evidence_resources: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64 },
            }, required: ["action", "concept_id", "reason", "evidence_resources"], additionalProperties: false,
          },
        },
      },
      required: ["session_id"], additionalProperties: false,
    },
  },
  {
    name: "inspect_hub_okf_proposal",
    description: "Inspect one immutable local Hub proposal and its bounded full diff.",
    inputSchema: {
      type: "object",
      properties: { proposal_id: { type: "string", minLength: 1 } },
      required: ["proposal_id"], additionalProperties: false,
    },
  },
  {
    name: "accept_hub_okf_proposal",
    description: "Accept exactly one reviewed proposal as a local AgentBase-Hub main commit without remote publication.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_id: { type: "string", minLength: 1 },
        proposal_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      required: ["proposal_id", "proposal_digest"], additionalProperties: false,
    },
  },
  ...HUB_OKF_QUERY_TOOLS,
  {
    name: "read_hub_okf_concept",
    description: "Read one exact Markdown path from accepted local AgentBase-Hub knowledge.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", minLength: 1, maxLength: 512 } },
      required: ["path"], additionalProperties: false,
    },
  },
  {
    name: "read_hub_live_evidence",
    description: "Read validated live source references from one accepted Hub concept and bind them to the authorized repository.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", minLength: 1, maxLength: 512 } },
      required: ["path"], additionalProperties: false,
    },
  },
  {
    name: "list_hub_questions",
    description: "List bounded governed questions and their provenance-bearing history.",
    inputSchema: {
      type: "object", properties: {
        status: { type: "string", enum: ["pending", "resolved"] },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      }, additionalProperties: false,
    },
  },
  {
    name: "answer_hub_question",
    description: "Record one explicitly attributed maintainer answer and prepare a reviewable Maintainer Guidance proposal.",
    inputSchema: {
      type: "object", properties: {
        question_id: { type: "string", pattern: "^[a-f0-9]{24}$" },
        question_revision: { type: "integer", minimum: 1 },
        answer: { type: "string", minLength: 1, maxLength: 4096 },
        maintainer: { type: "string", pattern: "^human:[A-Za-z0-9][A-Za-z0-9._@-]{0,127}$" },
      }, required: ["question_id", "question_revision", "answer", "maintainer"], additionalProperties: false,
    },
  },
  {
    name: "list_pending_hub_okf",
    description: "List ordered accepted local proposal commits not yet admitted in remote main.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "submit_hub_okf_proposals",
    description: "Publish one dependency-safe pending proposal prefix through one branch and pull request.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_ids: {
          type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 100,
        },
      },
      required: ["proposal_ids"], additionalProperties: false,
    },
  },
  {
    name: "synchronize_hub_okf",
    description: "Fetch remote main and transactionally replay remaining accepted local proposals.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "recover_hub_okf",
    description: "Recover one exact interrupted Hub transaction without resetting accepted commits.",
    inputSchema: {
      type: "object",
      properties: { proposal_id: { type: "string", minLength: 1 } },
      required: ["proposal_id"], additionalProperties: false,
    },
  },
] as const;

export type HubOkfToolName = typeof HUB_OKF_TOOLS[number]["name"];
export type { HubToolActions, HubToolContext } from "./mcp-tool-actions.ts";
export { callHubOkfTool } from "./mcp-tool-call.ts";
