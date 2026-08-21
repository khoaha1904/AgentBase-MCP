You are executing the AgentBase single-repository Initial Ingest qualification.

Source repository (read-only): <SOURCE_ROOT>
Artifact directory (the only benchmark output path): <OUTPUT_ROOT>
Repository source ID hint: repository-aws-health-aware-779eb7e1bc7a
Schema catalog version: 6.0.0
Owner-confirmed primary Domain: Health Operations (domains/health-operations); evidence agentbase://owner-guidance/domains/health-operations

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
3. Promote a candidate only when it has both stable identity and independent
   query/link value. A file, function, cloud keyword or infrastructure block is
   only a signal. Missing evidence becomes a concrete limitation or Question;
   do not use numeric confidence or force a concept inventory.
4. Author only catalog `6.0.0` provider-neutral roles. In particular use
   `Function`, `Queue`, `Server`, `Object Storage`, `Database` and `Database
   Table`, with evidenced `agentbase.technology` metadata for AWS/Terraform;
   never author `AWS Lambda`, `AWS SQS Queue` or `Terraform Module`.
5. Create one Repository concept citing this source. Store its primary Domain as
   one `part-of` relation evidenced by the supplied owner-guidance resource.
   A created System also uses its own owner-evidenced `part-of` relation. Keep
   Repository, System and Domain as different identities.
6. Use the smallest independently useful boundaries. Keep implementation-only
   handlers in a parent component, related CRUD operations in one API Surface,
   and create runtime Functions/resources only for independent contracts,
   triggers, lifecycle, failure, ownership or operational boundaries.
7. Every attributed claim and canonical relation cites a stable source ID with
   `repository://<canonical-repository-id>/<relative-path>#Lx-Ly`, except the
   supplied `agentbase://owner-guidance/...` Domain evidence. Desired-state IaC
   does not prove deployed state, account, region, ARN or runtime values.
8. Change-prone values remain live references. Valid target kinds are exactly
   `symbol`, `function`, `config-field` and `text`. A directly evidenced small
   non-sensitive scalar may include an observed, explicitly non-current snapshot
   with exact revision and UTC observation time; otherwise keep only reference.
9. Use canonical relationship directions with evidence and resolving Markdown
   links. Business Flow steps are contiguous, ordered and evidence-bearing.
10. Keep Hub navigation progressive. Root `index.md` contains only
    `okf_version: "0.2"`, heading `# AgentBase-Hub`, and at most three literal
    `* ` entries to existing Domain/System/Repository indexes. Category indexes
    have no frontmatter and every entry also starts with literal `* `.
11. Write useful overview Markdown explaining purpose, boundaries, interactions
    and limitations; do not copy source, create stubs or build a second Code
    Graph. A valid explicitly partial output is success.

## Arm-specific workflow

1. Call `get_hub_status` once. The harness is isolated and unconfigured, so call
   `configure_hub` once with `mode: new`; never attach or bootstrap a remote Hub.
2. Call `preflight_hub_ingest` once for `<SOURCE_ROOT>`. Treat
   `Health Operations (domains/health-operations); evidence agentbase://owner-guidance/domains/health-operations` as the explicit confirmation after reviewing the root
   README/docs and preflight summary.
3. Call `index_repository` exactly once, then `get_architecture` exactly once.
   Use bounded graph/source tools only as needed to identify architecture,
   consumers, runtime, infrastructure, flow boundaries and exact evidence.
4. Build a bounded candidate list. Call `get_okf_authoring_schemas` exactly once
   with candidates plus snake_case semantic/resource observations, each bound to
   an exact relative source path and line span. Do not send provider, product or
   schema guesses.
5. Call `prepare_hub_okf` exactly once with `mode: new`, the source repository,
   one normalized `repositories/<slug>` subject, the exact confirmed Domain,
   the same `guidance_request` and honest coverage. Do not supply
   `evidence_digest`; MCP derives it from validated evidence and source state.
6. Author only inside the returned bundle root. Use the returned canonical
   repository ID in every repository source and Repository identity record.
   Perform one bounded active-Hub identity match; an empty isolated Hub is a
   valid no-match result.
7. Call `validate_okf_changes` with all changed concepts and exact path-derived
   identities. Make at most one repair from exact failures.
8. Call `finalize_hub_okf_proposal` exactly once and
   `inspect_hub_okf_proposal` exactly once. The inspection must be applicable
   and remain a prepared preview. Never call Accept, submit, synchronize,
   bootstrap or any provider CLI.
9. After successful inspection, copy the exact finalized bundle to
   `<OUTPUT_ROOT>/okf` for scoring. Do not create any other artifact there.

Your final response briefly lists canonical identities, partial limitations,
Questions and the prepared proposal identity.
