import { HUB_PROPOSAL_SUBJECT_PATTERN } from "../../../core/hub/index.ts";
import { HUB_OKF_QUERY_TOOLS } from "./mcp-query-tools.ts";

const DOMAIN_HOME_SCHEMA = {
  type: "object",
  properties: {
    kind: { type: "string", enum: ["domain"] },
    identity: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
    title: { type: "string", minLength: 1, maxLength: 120 },
  },
  required: ["kind", "identity", "title"],
  additionalProperties: false,
} as const;

const HOME_SELECTION_SCHEMA = {
  oneOf: [
    { type: "object", properties: { kind: { type: "string", enum: ["shared"] } },
      required: ["kind"], additionalProperties: false },
    DOMAIN_HOME_SCHEMA,
  ],
} as const;

const CONFIRMED_DOMAIN_SCHEMA = {
  type: "object",
  properties: {
    identity: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
    title: { type: "string", minLength: 1, maxLength: 120 },
  },
  required: ["identity", "title"],
  additionalProperties: false,
} as const;

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
    description: "Read active Hub profile and recovery status.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "configure_hub",
    description: "Connect an existing non-empty Hub at the exact branch.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        target_branch: { type: "string", minLength: 1 },
      },
      required: ["repository_url", "target_branch"], additionalProperties: false,
    },
  },
  {
    name: "preview_hub_bootstrap",
    description: "Preview support files for an empty Hub.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        target_branch: { type: "string", minLength: 1 },
      },
      required: ["repository_url", "target_branch"], additionalProperties: false,
    },
  },
  {
    name: "bootstrap_hub",
    description: "Initialize an empty Hub once; knowledge remains pending for review.",
    inputSchema: {
      type: "object",
      properties: {
        repository_url: { type: "string", minLength: 1 },
        target_branch: { type: "string", minLength: 1 },
      },
      required: ["repository_url", "target_branch"], additionalProperties: false,
    },
  },
  {
    name: "preflight_hub_ingest",
    description: "Resolve Repository identity and Domain choices; authorize exact source.",
    inputSchema: {
      type: "object",
      properties: { source_repository: { type: "string", minLength: 1 } },
      required: ["source_repository"], additionalProperties: false,
    },
  },
  {
    name: "scan_workspace_repositories",
    description: "Inventory Git roots; match_names adds local link hints.",
    inputSchema: {
      type: "object",
      properties: { workspace_root: { type: "string", minLength: 1 }, match_names: { type: "boolean" } },
      required: ["workspace_root"], additionalProperties: false,
    },
  },
  {
    name: "prepare_hub_profile_migration",
    description: "Prepare a private legacy-to-Profile workspace.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "finalize_hub_profile_migration_proposal",
    description: "Validate exact migration moves and lock a proposal.",
    inputSchema: { type: "object", properties: {
      session_id: { type: "string", pattern: "^profile-migration-[a-f0-9]{24}$" },
      moves: { type: "array", maxItems: 4096, items: { type: "object", properties: {
        from_path: { type: "string", minLength: 1, maxLength: 512 },
        to_path: { type: "string", minLength: 1, maxLength: 512 },
      }, required: ["from_path", "to_path"], additionalProperties: false } },
    }, required: ["session_id", "moves"], additionalProperties: false },
  },
  {
    name: "prepare_hub_okf",
    description: "Prepare new/Refresh workspace; returns source changes, gaps and resume state.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["new", "refresh"] },
        refresh_scope: {
          type: "string", enum: ["delta", "coverage"],
          description: "Refresh-only scope. Delta is backward-compatible default; coverage is explicit broad bounded recovery and requires coverage.",
        },
        source_repository: { type: "string", minLength: 1 },
        subject_directory: {
          type: "string",
          pattern: HUB_PROPOSAL_SUBJECT_PATTERN.source,
          description: "Logical proposal focus. New Initial Ingest requires repositories/<slug>; Refresh reuses the existing subject returned by Hub continuity. Source repository identity and changed concept paths remain independent.",
        },
        confirmed_domain: {
          type: "object",
          description: "Legacy-compatible owner-confirmed Domain default. Profile Initial Ingest accepts this or home_plan, never both.",
          properties: {
            identity: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
            title: { type: "string", minLength: 1, maxLength: 120 },
          },
          required: ["identity", "title"], additionalProperties: false,
        },
        home_plan: {
          type: "object",
          description: "One owner-confirmed Profile 1.0 placement plan. Home controls physical path; participations alone create Domain relations.",
          properties: {
            default_home: HOME_SELECTION_SCHEMA,
            exceptions: {
              type: "array", maxItems: 64, items: {
                type: "object", properties: {
                  candidate_id: { type: "string", minLength: 1, maxLength: 128 },
                  home: HOME_SELECTION_SCHEMA,
                }, required: ["candidate_id", "home"], additionalProperties: false,
              },
            },
            participations: {
              type: "array", maxItems: 64, items: {
                type: "object", properties: {
                  candidate_id: { type: "string", minLength: 1, maxLength: 128 },
                  domain: CONFIRMED_DOMAIN_SCHEMA,
                }, required: ["candidate_id", "domain"], additionalProperties: false,
              },
            },
          },
          required: ["default_home", "exceptions", "participations"],
          additionalProperties: false,
        },
        discovery_receipt_id: {
          type: "string", pattern: "^discovery-receipt-[a-f0-9]{24}$",
          description: "Required for new Initial Ingest and rejected for Refresh; returned by receipt-producing schema guidance.",
        },
        signals: {
          type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64,
          description: "Optional legacy Refresh signals for newly discovered concept roles. Existing current-Repository concept roles are retained automatically.",
        },
        guidance_request: {
          type: "object",
          description: "Refresh-only bounded source-backed candidates and observations. New Initial Ingest receives this immutable guidance through discovery_receipt_id.",
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
        restart: { type: "boolean", description: "Refresh only: start a fresh session and preserve previous edits." },
      },
      required: ["mode", "source_repository", "subject_directory"],
      additionalProperties: false,
    },
  },
  {
    name: "finalize_hub_okf_proposal",
    description: "Validate and lock workspace; return digest/summary, then Inspect.",
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
        removals: {
          type: "array", maxItems: 64, items: {
            type: "object", properties: {
              kind: { type: "string", enum: ["concept", "repository-contribution"] },
              concept_id: { type: "string", minLength: 1 },
              reason: { type: "string", minLength: 1, maxLength: 512 },
              evidence_resources: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1, maxItems: 64 },
            }, required: ["kind", "concept_id", "reason", "evidence_resources"], additionalProperties: false,
          },
        },
        change_accounting: {
          type: "array", maxItems: 128,
          description: "Refresh-only: exactly one reviewable outcome for every path returned by Prepare sourceChanges.paths.",
          items: {
            type: "object", properties: {
              path: { type: "string", minLength: 1, maxLength: 512 },
              outcome: { type: "string", enum: ["updated", "new", "embedded", "question", "ignored"] },
              reason: { type: "string", minLength: 1, maxLength: 512 },
            }, required: ["path", "outcome", "reason"], additionalProperties: false,
          },
        },
      },
      required: ["session_id"], additionalProperties: false,
    },
  },
  {
    name: "prepare_batch_hub_ingest",
    description: "Preflight 2-32 repos and suggest source-name links.",
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
    description: "Confirm every member and lock a sequential batch.",
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
    description: "Lock one receipt-bound member checkpoint.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      member_id: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" },
      session_id: { type: "string", pattern: "^hub-session-[a-f0-9]{24}$" },
    }, required: ["manifest_id", "manifest_revision", "member_id", "session_id"], additionalProperties: false },
  },
  {
    name: "retry_batch_hub_ingest_member",
    description: "Retry one failed batch member explicitly.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" }, manifest_revision: { type: "integer", minimum: 1 },
      member_id: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" },
    }, required: ["manifest_id", "manifest_revision", "member_id"], additionalProperties: false },
  },
  {
    name: "revise_batch_hub_ingest_membership",
    description: "Replace the full member set in a new revision.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" }, manifest_revision: { type: "integer", minimum: 1 },
      member_ids: { type: "array", minItems: 2, maxItems: 32, items: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" } },
    }, required: ["manifest_id", "manifest_revision", "member_ids"], additionalProperties: false },
  },
  {
    name: "finalize_batch_hub_ingest_proposal",
    description: "Lock one atomic proposal from completed members.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" }, manifest_revision: { type: "integer", minimum: 1 },
    }, required: ["manifest_id", "manifest_revision"], additionalProperties: false },
  },
  {
    name: "prepare_domain_enrichment",
    description: "Lock Published-only scope; no provider calls.",
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
    description: "Replace enrichment scope in a new revision.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^enrichment-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      repository_ids: { type: "array", minItems: 1, maxItems: 32, items: { type: "string", minLength: 1 } },
      candidates: { type: "array", minItems: 1, maxItems: 64, items: ENRICHMENT_CANDIDATE_SCHEMA },
    }, required: ["manifest_id", "manifest_revision", "repository_ids", "candidates"], additionalProperties: false },
  },
  {
    name: "run_domain_enrichment",
    description: "Verify exact candidates after AWS session confirmation.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^enrichment-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      provider_session_confirmed: { type: "boolean" },
      retry_candidate_ids: { type: "array", minItems: 1, maxItems: 64, items: { type: "string", pattern: "^candidate-[a-f0-9]{24}$" } },
    }, required: ["manifest_id", "manifest_revision", "provider_session_confirmed"], additionalProperties: false },
  },
  {
    name: "finalize_domain_enrichment_proposal",
    description: "Prepare enrichment proposal from terminal outcomes.",
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
    description: "Review verified hunks/impact; include_content opts into full bytes.",
    inputSchema: {
      type: "object",
      properties: { proposal_id: { type: "string", minLength: 1 }, include_content: { type: "boolean" } },
      required: ["proposal_id"], additionalProperties: false,
    },
  },
  {
    name: "publish_hub_okf_proposal",
    description: "Publish exact reviewed digest in confirmed direct/PR mode.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_id: { type: "string", minLength: 1 },
        proposal_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        publication_mode: { type: "string", enum: ["direct", "pr"] },
      },
      required: ["proposal_id", "proposal_digest", "publication_mode"], additionalProperties: false,
    },
  },
  ...HUB_OKF_QUERY_TOOLS,
  {
    name: "read_hub_okf_concept",
    description: "Read exact Published Markdown with freshness warnings.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", minLength: 1, maxLength: 512 } },
      required: ["path"], additionalProperties: false,
    },
  },
  {
    name: "prepare_hub_visualization",
    description: "Prepare Published diagram or offline Domain site.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["diagram", "domain-site"] },
        domain: { type: "string", pattern: "^domains/[a-z0-9]+(?:-[a-z0-9]+)*$" },
        diagram_type: { type: "string", enum: ["architecture", "dependency", "sequence"] },
        concept_ids: {
          type: "array", minItems: 1, maxItems: 64, uniqueItems: true,
          items: { type: "string", minLength: 1, maxLength: 512 },
        },
        output_directory: { type: "string", minLength: 1, description: "Explicit absolute new or empty local directory for a one-shot static site." },
        visibility_acknowledged: { type: "boolean", description: "Must be true after warning that the output copies Published knowledge." },
      },
      required: ["mode", "domain"], additionalProperties: false,
    },
  },
  {
    name: "preview_hub_initialization",
    description: "Preview missing Hub README/CI against remote main.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "initialize_hub",
    description: "Create/recover reviewed support-files PR.",
    inputSchema: { type: "object", properties: {
      expected_base: { type: "string", pattern: "^[a-f0-9]{40}$" },
      expected_initialization_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    }, required: ["expected_base", "expected_initialization_digest"], additionalProperties: false },
  },
  {
    name: "list_hub_questions",
    description: "List governed Questions at the exact accepted view.",
    inputSchema: {
      type: "object", properties: {
        status: { type: "string", enum: ["open", "resolved", "needs-review"] },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      }, additionalProperties: false,
    },
  },
  {
    name: "answer_hub_question",
    description: "Prepare attributed guidance and exact Question transition.",
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
    name: "synchronize_hub_okf",
    description: "Fetch target and transactionally replay accepted proposals.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "recover_hub_okf",
    description: "Recover one interrupted transaction; preserve accepted commits.",
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
