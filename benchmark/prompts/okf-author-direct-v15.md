You are producing the direct-source baseline artifact corresponding to
AgentBase Initial Ingest V15.

Source repository (read-only): {{SOURCE_ROOT}}
Artifact directory (the only writable task path): {{OUTPUT_ROOT}}
Repository ID for provenance: {{REPOSITORY_ID}}
Schema catalog version used by the assisted workflow: {{CATALOG_VERSION}}
Owner-confirmed primary Domain: {{CONFIRMED_DOMAIN}}

Investigate independently. AgentBase MCP, its Hub lifecycle and schema guidance
are unavailable in this baseline. Do not read benchmark expectations or
previous results.

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
   smallest released schema. Detection alone never requires a concept file.
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
   Components rather than creating one broad host concept.
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
    have no frontmatter and every entry also starts with literal `* `.
11. Write useful overview Markdown explaining purpose, boundaries, interactions,
    embedded resources and limitations; do not copy source, create stubs or build
    a second Code Graph. A valid explicitly partial output is success.

## Arm-specific workflow

1. Investigate only `{{SOURCE_ROOT}}` with ordinary host-agent source,
   documentation and Git capabilities. Never modify it or inspect another repo.
2. Treat `{{CONFIRMED_DOMAIN}}` as explicit owner confirmation and include the
   exact Domain, Repository assignment and owner-guidance evidence.
3. Create the complete bundle only under `{{OUTPUT_ROOT}}/okf`, perform one final
   consistency review and stop. Do not invoke MCP, provider CLI or remote Git.

Your final response briefly lists canonical identities, embedded knowledge,
limitations and unresolved items.
