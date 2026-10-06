---
name: agentbase-ingest
description: Explicit-only AgentBase Add repository. Use only when the user names $agentbase-ingest, enters from Update knowledge for the same approved new repository, or approves a scoped Ingest handoff from AgentBase query; never infer it from ordinary reading or authorize Publish.
---

# Add repository

Create one reviewable proposal from bounded source evidence. The user supplies
the repository, not an authoring prompt. Stop before Publish.

The installed command remains `$agentbase-ingest`. If Preflight finds one
existing canonical Published Repository, explain that it needs an update and
follow [Update knowledge](../agentbase-refresh/SKILL.md) for that same approved scope without asking for a
repeated command. Do not create a duplicate. Ambiguous identity stops for
clarification, never a loop between skills. New repositories follow the stages
below, including all home confirmations.

An approved Query handoff is preparation-only for its named Hub/repository and
gap. Revalidate source authority and retain all Preflight/home confirmations;
carried evidence is a starting point, not a substitute for discovery admission.
Changed or broader scope needs renewed agreement. Cancellation preserves private
work without publishing or deleting it.

This workflow uses `preflight_hub_ingest`, `discover_repository`, `get_okf_authoring_schemas`, `prepare_hub_okf`,
`validate_okf_changes`, `finalize_hub_okf_proposal` and
`inspect_hub_okf_proposal` only.

## Workflow

1. **Preflight** — Read [`references/preflight.md`](references/preflight.md).
   Call `preflight_hub_ingest` and resolve new/existing/ambiguous identity first.
   Apply the existing-repository handoff above before asking for a new home.
   For a new repository, compare its documents with returned
   Domain summaries, show evidence and warnings, then obtain one explicit
   preliminary Repository default-home confirmation.
2. **Discover** - Call `discover_repository` with exactly the
   `analysis_source_repository` returned by Preflight. It returns one bounded
   five-lane Discovery Seed from source census. If the Seed is not `ready`, stop
   Incomplete. Inspect its limits and use ordinary read/search tools to qualify
   source evidence. If an important gap needs the expanded 1,024-file pass,
   obtain explicit confirmation and call the same tool with `discovery_mode:
   expanded` and `discovery_confirmation` containing its current `seed_id`,
   `user_confirmed: true` and a concrete `reason`, before freezing the Receipt.
   Never treat census as complete symbol, route or call-path analysis.
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
   Structured observations support Terraform, Terragrunt, SAM and native
   CloudFormation. For templates, retain the exact resource Type and logical
   ID: `AWS::Serverless::*` uses `sam`; native `AWS::*` uses `cloudformation`,
   even inside a SAM template. Cite YAML/JSON/.template source spans. Do not
   confuse declarations with deployed identity or infer interaction from IAM.
   Read local and inherited Globals evidence together; unsupported expressions,
   transforms and cross-stack references remain limitations. Never run build,
   deploy or cloud calls to fill those gaps. Label `.tf`
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
   `discovery_receipt_id`. From its exact materialized candidates, present one
   grouped plan: the Repository default home, only exceptional candidate homes,
   and only separately evidenced Domain participations. Home is either
   `shared` or one exact `domains/<slug>`; placement never implies
   participation. Obtain one explicit confirmation for the whole plan, not one
   prompt per concept. The simple one-Domain case may use `confirmed_domain`;
   use `home_plan` when a concept is shared, has a different home or has
   separately confirmed participation. Pass only the Receipt ID, source
   repository, subject and exactly one confirmed plan or compatibility Domain
   to `prepare_hub_okf`; never resend mutable
   guidance, coverage, signals or an evidence digest. For Initial Ingest, set
   `subject_directory` to one normalized `repositories/<repository-slug>` path;
   it supplies the slug rather than the final Profile path. Use the exact
   home-qualified subject and skeleton paths returned by Prepare. The
   compatibility Domain retains the prior owner-evidenced Repository/System
   participation; an explicit plan creates `part-of` only from its
   `participations` entries.
   Run one bounded active-Hub identity match, then follow `agentbase-okf` inside
   the returned workspace. Enrich the returned OKF skeletons instead of
   rebuilding their frontmatter or navigation from memory. Prepare has already
   populated root, capsule and home navigation; preserve it and never create
   unrelated indexes. Prepare also returns bounded summaries of existing
   concepts in the selected Domain and their embedded item names; use them to
   recognize shared resources across repositories. Treat the Repository as the default dossier. Add only
   applicable evidence-backed sections for purpose/boundaries, runtime and
   deployment, capabilities, interfaces/triggers, dependencies/data,
   operations/recovery and known gaps; omit unsupported headings and link to
   independently promoted knowledge without copying it. Keep a newly confirmed Domain sparse and
   summarize only the current repository-contributed scope supported by evidence;
   never invent a complete domain definition. Preserve the visible
   review limitation on every suggested skeleton. Preserve the one prepared
   Embedded Knowledge table in its parent. An embedded item has no OKF identity,
   standalone file, navigation or canonical graph relationship. A Repository
   keeps only its own sources and links to promoted concepts; it does not copy
   a child concept's Embedded Knowledge table or sources. When exact
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
   `sources[].observed_revision`.
   Every relationship in frontmatter needs a resolving Markdown link to its
   target in the document body.
   Do not author any home `questions/`; Finalize
   renders Questions from the Receipt and updates the home navigation. Never
   create an AgentBase activity `log.md`. Make at most one repair
   from exact failures. If Finalize returns a Hub-base replacement session,
   continue from its new skeletons without rerunning source discovery. Finalize
   returns a compact summary with `proposal_id` and `proposal_digest`; call
   Inspect once for details and present the complete proposal diff,
   Questions, limitations and partial-coverage status.
   Show `inspection.refreshSuggestions` to the user, naming the source
   Repository to Refresh for possible `publishes-to`/`writes-to` evidence.
   Explain that a name match is only a candidate; do not edit another
   repository's concepts or start its Refresh during this ingest.

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
- Do not call a provider CLI, clone another repository,
  synchronize, rebuild a PR or publish from this skill.
- Do not store source blocks, graph output, secrets or arbitrary config dumps in
  Hub. A small directly evidenced snapshot is optional and remains an observed,
  non-current value.
