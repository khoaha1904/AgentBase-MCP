You are executing the AgentBase single-repository Initial Ingest V15 qualification.

Source repository (read-only): {{SOURCE_ROOT}}
Artifact directory (the only benchmark output path): {{OUTPUT_ROOT}}
Repository source ID hint: {{REPOSITORY_ID}}
Schema catalog version: {{CATALOG_VERSION}}
Owner-confirmed primary Domain: {{CONFIRMED_DOMAIN}}

This is an isolated benchmark invocation of the packaged `agentbase-ingest`
workflow, not a user-authored production prompt. Do not read benchmark
expectations or previous results.

## Shared authoring contract

1. Execute Preflight, Discover, Investigate, Author and Validate in order. The
   confirmed Domain above is explicit benchmark-owner input; never infer another
   Domain from repository or product names.
2. Use available investigation capabilities only as bounded discovery aids,
   then return to exact authorized source paths and line spans. Tool records,
   source blocks, caches and absolute checkout paths never become Hub knowledge.
3. Use **Detect -> Promote -> Render**. Detect technologies and resources from
   evidence first. Promote only a stable identity with independent query/link
   value and a deployment, ownership, contract, cross-boundary, failure,
   operations or lifecycle boundary. Render promoted candidates with the
   smallest released schema. Detection alone never requires a concept file. A
   standalone Flow requires at least two independently useful endpoint
   boundaries; a System and its single contained Function with embedded
   schedule, state and delivery details do not suffice.
4. Initial Ingest uses exactly these catalog `7.0.0` types: `Repository`,
   `Domain`, `System`, `Component`, `Function`, `Interface`, `Flow`, `Resource`.
   `Entity` and `Metric` are enrichment-only. Provider products such as Lambda,
   EC2, SQS, SNS, DynamoDB and Azure VM are technology metadata, not schemas.
5. Create one Repository concept citing this source. Store its primary Domain as
   one `part-of` relation evidenced by the supplied owner-guidance resource. A
   created System also uses its own owner-evidenced `part-of` relation. Keep
   Repository, System and Domain as different identities.
6. Embed ordinary internal queues, topics, tables, buckets, infrastructure
   definitions and hosts in the Component, Function, System or Flow that uses
   them, with exact evidence. Promote one to `Resource` only when it has
   independent shared/operational value. Prefer one independently deployed or
   triggered Lambda as `Function`; describe workloads running on a VM as
   Components rather than creating one broad host concept. This qualification
   is Terraform-only: when exact Terraform exists for retained runtime or
   infrastructure knowledge, submit its resource observation. CloudFormation
   or handler evidence may supplement behavior but cannot replace it.
7. Every attributed claim and canonical relation cites a stable source ID with
   `repository://<canonical-repository-id>/<relative-path>#Lx-Ly`, except the
   supplied `agentbase://owner-guidance/...` Domain evidence. Desired-state IaC
   does not prove deployed state, account, region, ARN or runtime values.
8. Change-prone values remain live references. Valid target kinds are exactly
   `symbol`, `function`, `config-field` and `text`. A directly evidenced small
   non-sensitive scalar may include an observed, explicitly non-current snapshot
   with exact revision and UTC observation time; otherwise keep only reference.
9. Use only canonical relationship directions with evidence and resolving
   Markdown links. Express containment from the child with `part-of`; never
   persist inverse helper predicates such as `contains`. Flow steps are
   contiguous, ordered and evidence-bearing.
10. Keep Hub navigation progressive. Root `index.md` contains only
    `okf_version: "0.2"`, heading `# AgentBase-Hub`, and at most three literal
    `* ` entries to existing Domain/System/Repository indexes. Category indexes
    have no frontmatter and every entry also starts with literal `* `. Prepare
    already populated required navigation; preserve it and never append a target
    already present. Keep a new Domain sparse and summarize only the current
    repository-contributed scope supported by evidence.
11. Write useful overview Markdown explaining purpose, boundaries, interactions,
    embedded resources and limitations; do not copy source, create stubs or build
    a second Code Graph. A valid explicitly partial output is success.

## Arm-specific workflow

1. Call `get_hub_status` once. The harness is isolated and unconfigured, so call
   `configure_hub` once with `mode: new`; never attach or bootstrap a remote Hub.
2. Call `preflight_hub_ingest` once for `{{SOURCE_ROOT}}`. Treat
   `{{CONFIRMED_DOMAIN}}` as the explicit confirmation after reviewing the root
   README/docs and preflight summary.
3. Call `index_repository` exactly once, then `get_architecture` exactly once.
   Use bounded graph/source tools only as needed to identify useful boundaries
   and exact evidence.
4. Build one bounded Detect -> Promote candidate list. Call
   `get_okf_authoring_schemas` exactly once with candidates plus snake_case
   observations, each bound to an exact relative source path and line span. Use
   only exact released type names in `suggested_type`. Structured mappings win;
   semantic disagreement remains ambiguous. If guidance fails, stop Incomplete:
   do not alter the request and continue.
5. Call `prepare_hub_okf` exactly once with `mode: new`, the source repository,
   one normalized `repositories/<slug>` subject, the exact confirmed Domain, the
   same unchanged `guidance_request` and honest coverage. Do not supply
   `evidence_digest`; MCP derives it from validated evidence and source state.
6. Author only inside the returned bundle root. Use the returned canonical
   repository ID in every repository source and Repository identity record.
   Perform one bounded active-Hub identity match; an empty isolated Hub is a
   valid no-match result.
7. Call `validate_okf_changes` with all changed concepts and exact path-derived
   identities. Make at most one repair from exact failures.
8. Call `finalize_hub_okf_proposal` exactly once. If it fails, stop Incomplete;
   never retry it. Then call `inspect_hub_okf_proposal` exactly once only after
   successful Finalize. Inspection must be applicable and remain a prepared
   preview. Never call Accept, submit, synchronize, bootstrap or any provider CLI.
9. After successful inspection, copy the exact finalized bundle to
   `{{OUTPUT_ROOT}}/okf` for scoring. Do not create any other artifact there.

Your final response briefly lists canonical identities, embedded knowledge,
partial limitations, Questions and the prepared proposal identity.
