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
2. **Discover** — Follow `use-codebase-memory` for one repository map and one
   bounded architecture pass. Reuse a fresh graph; never ingest graph records.
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
   not a fixed concept-count rule.
4. **Author** — Call `get_okf_authoring_schemas` with the qualified
   candidates plus exact semantic/resource observations. Every candidate declares
   `disposition: concept` or `disposition: embedded`; embedded candidates have
   no `suggested_type`. Each evidence ID is
   owned by one candidate: a candidate may cite only observations whose
   `candidate_id` equals that candidate's `id`. For a semantic-only candidate,
   include one released provider-neutral `suggested_type` to expose the agent's
   intended role. Standalone `Interface` or `Resource` intent also requires a
   compatible `promotion` basis and exact candidate-owned semantic
   `evidence_ids`; if that boundary is not evidenced, submit the knowledge as
   embedded in its useful parent. Treat a returned `suggested` role as reviewable, never exact;
   structured mapping wins and semantic keyword matches are diagnostic rather
   than a pass/fail gate. Pass that same evidence-bearing
   request to `prepare_hub_okf`; never replace it with free text `signals` or
   supply an opaque evidence digest. Persist the confirmed
   primary Domain as an owner-evidenced `Repository part-of Domain` relation.
   Run one bounded active-Hub identity match, then follow `agentbase-okf` inside
   the returned workspace. Enrich the returned OKF skeletons instead of
   rebuilding their frontmatter or navigation from memory. Prepare has already
   populated root and category indexes; preserve those entries and never append
   an existing navigation target. Keep a newly confirmed Domain sparse and
   summarize only the current repository-contributed scope supported by evidence;
   never invent a complete domain definition. Preserve the visible
   review limitation on every suggested skeleton. Preserve the one prepared
   Embedded Knowledge table in its parent. An embedded item has no OKF identity,
   standalone file, navigation or graph relationship. Create only useful
   concepts and required navigation. If the guidance call returns retryable
   `INVALID_ARGUMENT` with recovery `correct-and-retry-same-tool`, correct only
   the reported request defect and call it once more. Preserve truthful
   evidence; remove, embed or defer a candidate rather than inventing support.
   Do not retry ambiguous/unsupported recommendations or any internal,
   integrity, authority or transport failure.
5. **Validate** — Run changed-set and final validation. Make at most one repair
   from exact failures. Inspect and present the complete proposal diff,
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
