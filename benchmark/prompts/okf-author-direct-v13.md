You are producing the direct-source baseline artifact corresponding to
AgentBase Initial Ingest V13.

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

1. Investigate only `{{SOURCE_ROOT}}` with ordinary host-agent source,
   documentation and Git capabilities. Never modify it or inspect another repo.
2. Treat `{{CONFIRMED_DOMAIN}}` as explicit owner confirmation and include the
   exact Domain, Repository assignment and owner-guidance evidence.
3. Create the complete bundle only under `{{OUTPUT_ROOT}}/okf`, perform one final
   consistency review and stop. Do not invoke MCP, provider CLI or remote Git.

Your final response briefly lists canonical identities, limitations and
unresolved items.
