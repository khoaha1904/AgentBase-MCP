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
    description: "Report whether AgentBase-MCP has no Hub or one active remote Hub profile.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "configure_hub",
    description: "Attach an existing non-empty AgentBase-Hub using its credential-free repository URL and exact target branch.",
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
    description: "Preview the exact support baseline commit for one-time direct initialization of an empty Hub repository.",
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
    description: "Write README, root index and Hub CI directly once to an explicitly supplied empty Hub; knowledge remains pending for later pull requests.",
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
    description: "Resolve one local checkout against canonical Hub Repository identities and list bounded Domain summaries without creating a proposal.",
    inputSchema: {
      type: "object",
      properties: { source_repository: { type: "string", minLength: 1 } },
      required: ["source_repository"], additionalProperties: false,
    },
  },
  {
    name: "scan_workspace_repositories",
    description: "Inventory up to 32 Git roots under one explicit workspace and compare lightweight Git metadata with the synchronized Published Hub without reading source or creating proposals.",
    inputSchema: {
      type: "object",
      properties: { workspace_root: { type: "string", minLength: 1 } },
      required: ["workspace_root"], additionalProperties: false,
    },
  },
  {
    name: "prepare_hub_profile_migration",
    description: "Report an exact legacy Published Hub and create a private editable full-tree workspace. Never infers homes or mutates Hub knowledge.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "finalize_hub_profile_migration_proposal",
    description: "Validate an explicitly authored legacy-to-Profile 1.0 workspace and exact file moves into one immutable reviewed migration proposal.",
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
    description: "Prepare a local new or refresh AgentBase Hub OKF proposal without publishing. New Initial Ingest consumes one frozen discovery receipt. Refresh returns bounded changed paths, observed source state and known gaps; delta is default and explicit coverage binds a broad bounded coverage account. Preserve generated sources, relationships, repository identity metadata and navigation while enriching returned skeletons.",
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
      },
      required: ["mode", "source_repository", "subject_directory"],
      additionalProperties: false,
    },
  },
  {
    name: "finalize_hub_okf_proposal",
    description: "Validate and lock an authored Hub workspace into one immutable local proposal. Receipt-bound Init derives Questions from its frozen Inventory; Refresh Questions may reference only exact existing agentbase.observed_values.",
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
    description: "Finalize one exact receipt-bound Initial Ingest session into its private batch checkpoint, retaining member source, Seed, Receipt and coverage identity.",
    inputSchema: { type: "object", properties: {
      manifest_id: { type: "string", pattern: "^batch-ingest-[a-f0-9]{24}$" },
      manifest_revision: { type: "integer", minimum: 1 },
      member_id: { type: "string", pattern: "^batch-member-[a-f0-9]{24}$" },
      session_id: { type: "string", pattern: "^hub-session-[a-f0-9]{24}$" },
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
    description: "Inspect one immutable local Hub proposal with its bounded byte diff and exact semantic impact.",
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
    description: "Read one exact Markdown path from the synchronized Published AgentBase-Hub commit with warning-only freshness metadata.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", minLength: 1, maxLength: 512 } },
      required: ["path"], additionalProperties: false,
    },
  },
  {
    name: "prepare_hub_visualization",
    description: "Prepare a bounded truthful diagram packet or explicitly build one static offline 2D Domain site from an exact synchronized Published Hub commit. Never reads Local Draft or publishes the artifact.",
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
