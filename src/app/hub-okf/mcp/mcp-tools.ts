import { HUB_PROPOSAL_SUBJECT_PATTERN } from "../../../core/hub/index.ts";
import { HUB_OKF_QUERY_TOOLS } from "./mcp-query-tools.ts";

const ENRICHMENT_CANDIDATE_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string", pattern: "^candidate-[a-f0-9]{24}$" },
    kind: { type: "string", enum: ["identity", "relation", "question"] },
    source_concept_id: { type: "string", minLength: 1, maxLength: 512 },
    target_concept_id: { type: "string", minLength: 1, maxLength: 512 },
    predicate: { type: "string", minLength: 1, maxLength: 64 },
    expected_arn: { type: "string", minLength: 1, maxLength: 512 },
    queue: { type: "object", properties: {
      name: { type: "string", minLength: 1, maxLength: 85 },
      account_id: { type: "string", pattern: "^[0-9]{12}$" },
      region: { type: "string", pattern: "^[a-z]{2}(?:-gov)?-[a-z]+-[0-9]$" },
    }, required: ["name", "account_id", "region"], additionalProperties: false },
    identity_evidence_ids: { type: "array", minItems: 1, maxItems: 64, items: { type: "string", minLength: 1, maxLength: 128 } },
    interaction_evidence_ids: { type: "array", maxItems: 64, items: { type: "string", minLength: 1, maxLength: 128 } },
    question: { type: "object", properties: {
      id: { type: "string", pattern: "^question-[a-f0-9]{24}$" },
      revision: { type: "integer", minimum: 1 },
    }, required: ["id", "revision"], additionalProperties: false },
  },
  required: ["id", "kind", "source_concept_id", "queue", "identity_evidence_ids", "interaction_evidence_ids"],
  additionalProperties: false,
} as const;

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
        target_branch: { type: "string", minLength: 1 },
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
        target_branch: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["all-to-main", "base-to-main-knowledge-pr"] },
      },
      required: ["repository_url", "target_branch", "mode"], additionalProperties: false,
    },
  },
  {
    name: "bootstrap_hub",
    description: "Publish a local-only Hub to an explicitly supplied empty GitHub repository using the reviewed mode.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        target_branch: { type: "string", minLength: 1 },
        mode: { type: "string", enum: ["all-to-main", "base-to-main-knowledge-pr"] },
      },
      required: ["repository_url", "target_branch", "mode"], additionalProperties: false,
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
    description: "Prepare a local new or refresh AgentBase Hub OKF proposal without publishing. Refresh returns bounded changed paths, observed source state and known gaps. New Initial Ingest returns editable skeletons only for promoted concepts and embeds non-promoted resource knowledge in its parent. Preserve generated sources, relationships, repository identity metadata and navigation while enriching those skeletons. selectedSchemas is the hard allowlist; Initial Ingest always includes Repository.",
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
    description: "Validate and lock an authored Hub workspace into one immutable local proposal. A Question may reference only existing agentbase.observed_values on its subject with the exact property, role and source_id; otherwise omit it and record a limitation.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", pattern: "^hub-session-[a-f0-9]{24}$" },
        questions: {
          type: "array", maxItems: 64, items: {
            type: "object", properties: {
              subject: { type: "string", minLength: 1, maxLength: 512 },
              property: { type: "string", minLength: 1, maxLength: 128,
                pattern: "^[A-Za-z0-9][A-Za-z0-9._-]*$",
                description: "Exact property token already present in the subject's agentbase.observed_values; not a prose question." },
              observation_refs: { type: "array", minItems: 1, maxItems: 64,
                description: "Each role/source_id pair must exactly match an existing observed value with the same subject and property.", items: {
                type: "object", properties: {
                  role: { type: "string", enum: ["documentation", "implementation", "configuration", "provider"] },
                  source_id: { type: "string", minLength: 1, maxLength: 128 },
                }, required: ["role", "source_id"], additionalProperties: false,
              } },
              missing_evidence: { type: "array", items: { type: "string", minLength: 1, maxLength: 512 }, maxItems: 64 },
            }, required: ["subject", "property", "observation_refs"], additionalProperties: false,
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
    name: "prepare_batch_hub_ingest",
    description: "Preflight 2-32 explicit local repositories against one proposed Domain without authoring knowledge.",
    inputSchema: { type: "object", properties: {
      source_repositories: { type: "array", minItems: 2, maxItems: 32, items: { type: "string", minLength: 1 } },
      proposed_domain: { type: "object", properties: {
        identity: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
        title: { type: "string", minLength: 1, maxLength: 120 },
      }, required: ["identity", "title"], additionalProperties: false },
    }, required: ["source_repositories", "proposed_domain"], additionalProperties: false },
  },
  {
    name: "confirm_batch_hub_ingest",
    description: "Confirm every exact preflight member and lock one sequential Batch Initial Ingest manifest.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      assessments: { type: "array", minItems: 2, maxItems: 32, items: { type: "object", properties: {
        member_id: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" },
        decision: { type: "string", enum: ["match", "override"] },
        evidence_path: { type: "string", minLength: 1, maxLength: 512 },
      }, required: ["member_id", "decision", "evidence_path"], additionalProperties: false } },
    }, required: ["manifest_id", "manifest_revision", "assessments"], additionalProperties: false },
  },
  {
    name: "record_batch_hub_ingest_member",
    description: "Finalize one existing Initial Ingest session into its exact private batch checkpoint. Questions may reference only existing agentbase.observed_values with exact property/role/source_id; otherwise omit them and keep a limitation.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      member_id: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" },
      session_id: { type: "string", pattern: "^hub-session-[a-f0-9]{24}$" },
      questions: { type: "array", maxItems: 64, items: {
        type: "object", properties: {
          subject: { type: "string", minLength: 1, maxLength: 512 },
          property: { type: "string", minLength: 1, maxLength: 128,
            pattern: "^[A-Za-z0-9][A-Za-z0-9._-]*$",
            description: "Exact property token already present in the subject's agentbase.observed_values; not a prose question." },
          observation_refs: { type: "array", minItems: 1, maxItems: 64,
            description: "Each role/source_id pair must exactly match an existing observed value with the same subject and property.", items: { type: "object", properties: {
            role: { type: "string", enum: ["documentation", "implementation", "configuration", "provider"] },
            source_id: { type: "string", minLength: 1, maxLength: 128 },
          }, required: ["role", "source_id"], additionalProperties: false } },
          missing_evidence: { type: "array", maxItems: 64, items: { type: "string", minLength: 1, maxLength: 512 } },
        }, required: ["subject", "property", "observation_refs"], additionalProperties: false,
      } },
    }, required: ["manifest_id", "manifest_revision", "member_id", "session_id"], additionalProperties: false },
  },
  {
    name: "retry_batch_hub_ingest_member",
    description: "Make exactly one failed batch member eligible for a new explicit Initial Ingest attempt.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" }, manifest_revision: { type: "integer", minimum: 1 },
      member_id: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" },
    }, required: ["manifest_id", "manifest_revision", "member_id"], additionalProperties: false },
  },
  {
    name: "revise_batch_hub_ingest_membership",
    description: "Create a new immutable batch revision from a complete replacement member set.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" }, manifest_revision: { type: "integer", minimum: 1 },
      member_ids: { type: "array", minItems: 2, maxItems: 32, items: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" } },
    }, required: ["manifest_id", "manifest_revision", "member_ids"], additionalProperties: false },
  },
  {
    name: "finalize_batch_hub_ingest_proposal",
    description: "Compose every completed current member into one immutable atomic Batch Initial Ingest proposal.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" }, manifest_revision: { type: "integer", minimum: 1 },
    }, required: ["manifest_id", "manifest_revision"], additionalProperties: false },
  },
  {
    name: "prepare_domain_enrichment",
    description: "Lock a Published-only Domain/multi-Repository enrichment manifest without calling AWS or mutating Hub knowledge.",
    inputSchema: { type: "object", properties: {
      domain_id: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
      repository_ids: { type: "array", minItems: 1, maxItems: 32, items: { type: "string", minLength: 1 } },
      candidates: { type: "array", minItems: 1, maxItems: 64, items: ENRICHMENT_CANDIDATE_SCHEMA },
      account_id: { type: "string", pattern: "^[0-9]{12}$" },
      regions: { type: "array", minItems: 1, maxItems: 16, items: { type: "string" } },
    }, required: ["domain_id", "repository_ids", "candidates", "account_id", "regions"], additionalProperties: false },
  },
  {
    name: "revise_domain_enrichment_membership",
    description: "Create the next immutable enrichment manifest revision from a complete replacement Repository/candidate set.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^enrichment-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      repository_ids: { type: "array", minItems: 1, maxItems: 32, items: { type: "string", minLength: 1 } },
      candidates: { type: "array", minItems: 1, maxItems: 64, items: ENRICHMENT_CANDIDATE_SCHEMA },
    }, required: ["manifest_id", "manifest_revision", "repository_ids", "candidates"], additionalProperties: false },
  },
  {
    name: "run_domain_enrichment",
    description: "After explicit AWS CLI session confirmation, verify exact manifest candidates sequentially with released read-only calls.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^enrichment-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      provider_session_confirmed: { type: "boolean" },
      retry_candidate_ids: { type: "array", minItems: 1, maxItems: 64, items: { type: "string", pattern: "^candidate-[a-f0-9]{24}$" } },
    }, required: ["manifest_id", "manifest_revision", "provider_session_confirmed"], additionalProperties: false },
  },
  {
    name: "finalize_domain_enrichment_proposal",
    description: "Create one reviewable enrichment proposal from trusted terminal outcomes; never Accept or Publish it.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^enrichment-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      answers: { type: "array", maxItems: 64, items: { type: "object", properties: {
        candidate_id: { type: "string", pattern: "^candidate-[a-f0-9]{24}$" },
        question_id: { type: "string", pattern: "^question-[a-f0-9]{24}$" },
        question_revision: { type: "integer", minimum: 1 },
        action: { type: "string", enum: ["answer", "defer"] },
        answer: { type: "string", minLength: 1, maxLength: 4096 },
        maintainer: { type: "string", pattern: "^human:[A-Za-z0-9][A-Za-z0-9._@-]{0,127}$" },
      }, required: ["candidate_id", "question_id", "question_revision", "action"], additionalProperties: false } },
    }, required: ["manifest_id", "manifest_revision", "answers"], additionalProperties: false },
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
    description: "Read one exact Markdown path from the synchronized Published AgentBase-Hub commit.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", minLength: 1, maxLength: 512 } },
      required: ["path"], additionalProperties: false,
    },
  },
  {
    name: "preview_hub_initialization",
    description: "Preview missing README and CI support files against exact remote Hub main without replaying knowledge drafts.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "initialize_hub",
    description: "Create or recover one reviewed Hub support-baseline pull request; preserve existing README and current CI.",
    inputSchema: { type: "object", properties: {
      expected_base: { type: "string", pattern: "^[a-f0-9]{40}$" },
      expected_initialization_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    }, required: ["expected_base", "expected_initialization_digest"], additionalProperties: false },
  },
  {
    name: "list_hub_questions",
    description: "List shared governed Question documents from the exact accepted Hub view.",
    inputSchema: {
      type: "object", properties: {
        status: { type: "string", enum: ["open", "resolved", "needs-review"] },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      }, additionalProperties: false,
    },
  },
  {
    name: "answer_hub_question",
    description: "Prepare one atomic proposal containing attributed Maintainer Guidance and the exact Question transition.",
    inputSchema: {
      type: "object", properties: {
        question_id: { type: "string", pattern: "^question-[a-f0-9]{24}$" },
        question_revision: { type: "integer", minimum: 1 },
        answer: { type: "string", minLength: 1, maxLength: 4096 },
        maintainer: { type: "string", pattern: "^human:[A-Za-z0-9][A-Za-z0-9._@-]{0,127}$" },
      }, required: ["question_id", "question_revision", "answer", "maintainer"], additionalProperties: false,
    },
  },
  {
    name: "list_pending_hub_okf",
    description: "List ordered accepted local proposal commits not yet admitted in the remote target branch.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "submit_hub_okf_proposals",
    description: "Publish selected accepted proposals as independent Repository Init PRs or same-Repository Init/Refresh PR chains, using MCP's dedicated Hub credential.",
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
    description: "Fetch the configured remote target and transactionally replay remaining accepted local proposals.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "recover_hub_okf",
    description: "Recover one exact interrupted Hub transaction without resetting accepted commits.",
    inputSchema: {
      type: "object",
      properties: { transaction_id: { type: "string", minLength: 1 } },
      required: ["transaction_id"], additionalProperties: false,
    },
  },
] as const;

export type HubOkfToolName = typeof HUB_OKF_TOOLS[number]["name"];
export type { HubToolActions } from "./mcp-tool-actions.ts";
export { callHubOkfTool } from "./mcp-tool-call.ts";
