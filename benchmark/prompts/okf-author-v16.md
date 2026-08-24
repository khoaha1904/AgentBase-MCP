You are executing the AgentBase single-repository Initial Ingest V16 qualification.

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
   Domain above is explicit benchmark-owner input; never infer another Domain.
2. Use graph/source capabilities only as bounded discovery aids, then cite exact
   authorized relative source paths and line spans. Tool records, caches and
   absolute checkout paths never become Hub knowledge.
3. Use **Detect -> Promote -> Render**. Promote only a stable identity with
   independent query/link value and an evidenced deployment, ownership,
   contract, cross-boundary, failure, operations or lifecycle boundary.
   Detection alone never requires a concept. A truthful sparse proposal is a
   successful `valid_partial` result.
4. Initial Ingest uses catalog `7.0.0` types `Repository`, `Domain`, `System`,
   `Component`, `Function`, `Interface`, `Flow` and `Resource`. Provider products
   and source tools are metadata, not schemas. Entity and Metric are enrichment-only.
5. Create one Repository concept citing this source. Store its primary Domain as
   an owner-evidenced `part-of` relation. A created System uses its own
   owner-evidenced `part-of` relation. These remain different identities.
6. Embed ordinary internal queues, topics, tables, buckets, hosts and
   infrastructure in the useful parent. Promote only independently useful
   boundaries. Prefer independently deployed/triggered Lambda as Function and
   VM workloads as Components. Exact Terraform/Terragrunt evidence is
   high-priority when available; missing a detail is partial coverage, not
   permission to invent it. SAM/CloudFormation is unsupported structured IaC.
7. Every attributed claim and canonical relation cites
   `repository://<canonical-repository-id>/<relative-path>#Lx-Ly`, except the
   supplied owner-guidance Domain evidence. IaC does not prove deployed state,
   account, region, ARN or current runtime values.
8. Store only small directly evidenced non-sensitive snapshots with exact
   revision/time. Otherwise retain a file-level source reference. Never probe a
   provider or fabricate a current value.
9. Use canonical relationship directions with resolving Markdown links.
   Containment points child `part-of` parent. Flow steps are ordered,
   contiguous, evidence-bearing and only use promoted concept endpoints.
10. Keep navigation progressive. Root `index.md` contains only OKF frontmatter,
    `# AgentBase-Hub`, and at most three literal `* ` entries to existing
    Domain/System/Repository indexes. Category indexes have no frontmatter.
    Prepare already populated required navigation; never duplicate an entry.
11. Explain purpose, boundaries, interactions, embedded resources and honest
    limitations. Do not copy source or build a second Code Graph.

## Arm-specific workflow

1. Call `get_hub_status` once. The harness already provides an isolated admitted
   remote Hub profile backed only by local fixture state. Do not call
   `configure_hub`, bootstrap, synchronize or any network/publication action.
2. Call `preflight_hub_ingest` once for `{{SOURCE_ROOT}}`. Treat
   `{{CONFIRMED_DOMAIN}}` as the explicit owner confirmation after reviewing the
   bounded root README/docs and preflight summary.
3. Call `index_repository` exactly once, then `get_architecture` exactly once.
   Use bounded graph/source tools only as needed for useful boundaries and evidence.
4. Build one bounded candidate list. Call `get_okf_authoring_schemas` with
   snake_case observations bound to exact paths/spans. Use released type names.
   Structured mappings win; semantic disagreement is diagnostic. On one
   retryable `INVALID_ARGUMENT` with `correct-and-retry-same-tool`, correct only
   the reported request defect and retry once. Otherwise stop Incomplete.
5. Call `prepare_hub_okf` exactly once with `mode: new`, source repository, one
   normalized `repositories/<slug>` subject, exact confirmed Domain, unchanged
   guidance request and honest coverage. MCP derives `evidence_digest`.
6. Author only inside the returned bundle root. Use its canonical Repository ID
   in all repository sources and the Repository identity record.
7. Call `validate_okf_changes` with all changed concepts and path-derived
   identities. Make at most one repair from exact failures.
8. Call `finalize_hub_okf_proposal` exactly once. Never retry Finalize. After a
   successful Finalize call `inspect_hub_okf_proposal` exactly once. Inspection
   remains a prepared preview. Never Accept, submit, synchronize, bootstrap or
   call a provider CLI.
9. Copy the exact finalized bundle to `{{OUTPUT_ROOT}}/okf` for scoring. Create
   no other artifact there.

Your final response briefly lists canonical identities, embedded knowledge,
partial limitations, Questions and the prepared proposal identity.
