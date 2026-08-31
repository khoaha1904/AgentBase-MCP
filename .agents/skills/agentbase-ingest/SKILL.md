---
name: agentbase-ingest
description: Ingest one authorized local source repository into a sparse, evidence-backed AgentBase OKF proposal preview. Use when a user asks to initialize, ingest, or draft Hub knowledge for one repository; do not use for ordinary questions, Refresh, multi-repository batches, provider CLI enrichment, Accept, or Publish.
---

# Ingest one repository

Create one reviewable proposal from bounded source evidence. The user supplies
the repository, not an authoring prompt. Stop before Accept or Publish.

This workflow uses `preflight_hub_ingest`, the tools named by
`use-codebase-memory`, `get_okf_authoring_schemas`, `prepare_hub_okf`,
`validate_okf_changes`, `finalize_hub_okf_proposal` and
`inspect_hub_okf_proposal` only.

## Workflow

1. **Preflight** — Read [`references/preflight.md`](references/preflight.md).
   Call `preflight_hub_ingest`, compare the repository documents with returned
   Domain summaries, show evidence and warnings, then obtain one explicit
   primary-Domain confirmation.
2. **Discover** — Index exactly the `analysis_source_repository` returned by
   Preflight and follow `use-codebase-memory`. The index call appends one
   bounded Discovery Seed after its fixed diagnostic/architecture/census pass.
   If the Seed is not `ready`, stop Incomplete. Reuse its graph; never ingest
   graph records or raw Seed rows.
3. **Investigate** — Detect technology, then decide promotion before selecting
   a schema. A standalone candidate needs stable identity and an independent query/link value,
   plus an evidenced deployment, ownership, contract, cross-boundary,
   failure or operational boundary. An independently deployed function may be
   a `Function`. SQS/SNS/event buses, tables, buckets, databases and compute
   hosts default to `embedded` knowledge in the Function, Component or System
   that uses them; declare that parent in `parent_candidate_id`. EC2/VM evidence
   is a host reference, never a Server concept. Promote an evidenced workload
   on that host as `Component`; if no workload is known, retain only the host
   reference or a limitation. Resolve every retained item to an exact source
   path/span and keep important ambiguity as a Question or limitation.
   Structured observations support only Terraform and Terragrunt. Label `.tf`
   or `.tf.json` evidence `terraform`; label `terragrunt.hcl` module
   orchestration `terragrunt`. When Terragrunt references a module, cite the
   module's exact `.tf` file as `terraform` for provider resources. Never label
   SAM/CloudFormation/YAML as Terraform or Terragrunt. Exact supported Terraform
   or Terragrunt observations are high-priority when readily available. If they
   are omitted, expose that as a coverage limitation rather than invalidating an
   otherwise truthful partial proposal. Usually keep one runtime's internal
   trigger, state and delivery sequence embedded; create a Flow only when it
   adds independent query or navigation value. This is an authoring heuristic,
   not a fixed concept-count rule. Treat ordinary frontend, backend, worker and
   function runtimes the same way: keep each independently deployed or operated
   runtime separate, and group its internal modules, storage, queues and alarms
   in that parent. A provider resource count never determines concept count.
4. **Author** — Build one Inventory covering every Seed group without changing
   MCP-owned lane, priority or group IDs. Give each group exactly one
   `materialized`, `question` or `ignored` outcome. A materialized item names
   only `candidate_ids`; candidate records already declare concept/embedded and
   parent. When multiple groups contribute distinct evidence to the same
   knowledge boundary, materialize the same candidate IDs from every such
   group; MCP emits the candidate identity once. Put Question data directly in
   its origin item and select only
   `candidate_key + evidence_id` already present in the same guidance request.
   Reserve ignored P0 for a true duplicate that adds no distinct evidence; it
   uses exact reason `duplicate-covered` and names a materialized
   `covered_by_origin_group_id`. Never create item/QuestionPlan IDs, output
   parents, item evidence lists, repository source resources or revisions; MCP
   derives all of them. Call `get_okf_authoring_schemas` with that Inventory, the qualified
   candidates and exact semantic/resource observations. Every candidate declares
   `disposition: concept` or `disposition: embedded`; embedded candidates have
   no `suggested_type`. A valid embedded candidate remains parent-owned even
   when no released provider profile identifies its technology; keep the
   returned provider-neutral limitation. An observation's `candidate_id` is its primary
   attribution; standalone candidates may share known observations, while an
   embedded candidate cites only its own observations. For a semantic-only candidate,
   include one released provider-neutral `suggested_type` to expose the agent's
   intended role. Standalone `Interface` or `Resource` intent also requires a
   compatible `promotion` basis and exact candidate-owned semantic
   `evidence_ids`; if that boundary is not evidenced, submit the knowledge as
   embedded in its useful parent. Treat a returned `suggested` role as reviewable, never exact;
   structured mapping wins and semantic keyword matches are diagnostic rather
   than a pass/fail gate. The successful call returns one
   `discovery_receipt_id`. Pass only that Receipt ID, source repository,
   subject and confirmed Domain to `prepare_hub_okf`; never resend mutable
   guidance, coverage, signals or an evidence digest. For Initial Ingest, set
   `subject_directory` to one normalized `repositories/<repository-slug>` path;
   the confirmed Domain is not the proposal subject. Persist the confirmed
   primary Domain as an owner-evidenced `Repository part-of Domain` relation.
   Run one bounded active-Hub identity match, then follow `agentbase-okf` inside
   the returned workspace. Enrich the returned OKF skeletons instead of
   rebuilding their frontmatter or navigation from memory. Prepare has already
   populated the direct root entrypoint; preserve it and never create
   architecture category indexes. Keep a newly confirmed Domain sparse and
   summarize only the current repository-contributed scope supported by evidence;
   never invent a complete domain definition. Preserve the visible
   review limitation on every suggested skeleton. Preserve the one prepared
   Embedded Knowledge table in its parent. An embedded item has no OKF identity,
   standalone file, navigation or canonical graph relationship. When exact
   evidence proves a useful runtime direction, add an optional `Embedded Relations`
   table with `Source | Relation | Target | Evidence`: use `self`, one exact
   concept identity or one unique same-parent embedded name, and cite only the
   parent's source IDs. Create only useful
   concepts and required navigation. If the guidance call returns retryable
   `INVALID_ARGUMENT` with recovery `correct-and-retry-same-tool`, correct only
   the reported request defect and call it once more. Preserve truthful
   evidence; remove, embed or defer a candidate rather than inventing support.
   Do not retry ambiguous/unsupported recommendations or any internal,
   integrity, authority or transport failure.
5. **Validate** — Run changed-set and final validation. Preserve prepared
   `sources[].observed_revision`. Do not author `questions/` or the Repository
   activity log; Finalize renders both from the Receipt. Make at most one repair
   from exact failures. If Finalize returns a Hub-base replacement session,
   continue from its new skeletons without rerunning source discovery. Inspect and present the complete proposal diff,
   Questions, limitations and partial-coverage status.

## Stop rules

- Stop as Incomplete when repository authority changes, provider cleanup is
  uncertain, evidence/proposal integrity fails, or the one repair still fails.
- A valid sparse or no-change result is success; completeness is not required.
- Guidance gets at most one pre-state input correction. This budget is separate
  from the one post-state changed-document repair and neither permits blind
  Prepare or Finalize retries.
- After one exact validation failure, make at most one repair. A second failure
  is Incomplete and requires an explicit user retry; never start another hidden
  reasoning pass.
- Do not call a provider CLI, clone another repository, Accept, submit,
  synchronize, rebuild a PR or publish from this skill.
- Do not store source blocks, graph output, secrets or arbitrary config dumps in
  Hub. A small directly evidenced snapshot is optional and remains an observed,
  non-current value.
