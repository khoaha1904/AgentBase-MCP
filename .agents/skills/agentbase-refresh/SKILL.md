---
name: agentbase-refresh
description: Explicit-only AgentBase Update knowledge. Use only when the user names $agentbase-refresh, enters from Add repository for the same approved existing repository, or approves a scoped Refresh handoff from AgentBase query; never infer it from ordinary reading or authorize publication/provider access.
---

# Update knowledge

Produce either `no_change`, one reviewable partial/complete private proposal, or an
Incomplete result. Never publish, synchronize, clone another
repository, or invoke provider CLI from this workflow.

The installed command remains `$agentbase-refresh`. Users describe the desired
update, not the internal strategy. Briefly explain the selection: source changes
use Delta; requested missing-knowledge repair uses Coverage, even on unchanged
source. Age, low concept count or retained debt alone does not authorize a broad
pass. Neither strategy automatically updates other repositories.

If a relation gap needs provider evidence, offer
[Domain Enrichment](../agentbase-domain-enrichment/SKILL.md)
for the named Published Domain and exact supported SQS candidates. Continue
there only after explicit scope approval; its account, region and provider-
session confirmations remain required. Unsupported evidence stays a limitation.
Do not automatically combine Refresh and enrichment or treat an update request
as permission for provider reads.

An approved Query handoff supplies a concrete gap, subject and source scope.
Revalidate them through normal Preflight; reuse exact evidence only when its
identity/revision still matches. Approval grants preparation only. A changed Hub,
Repository or broader required scope needs renewed agreement. Cancellation stops
further work and preserves any private proposal without deletion or Publish.

Use `delta` scope unless the owner explicitly asks to repair weak/sparse
knowledge, rerun broad discovery, or refresh coverage after a skill/model/profile
upgrade. Those requests select `coverage` scope in this same skill; never route
them to Initial Ingest, Domain Enrichment or another skill.

This workflow uses `preflight_hub_ingest`, ordinary source read/search, optional `list_okf_schemas`/`get_okf_schema`,
`prepare_hub_okf`, `validate_okf_changes`, `finalize_hub_okf_proposal` and
`inspect_hub_okf_proposal` only.

## Workflow

1. Run `preflight_hub_ingest` for the exact local checkout. Continue only for
   one existing canonical Repository match. For a new match, explain that it
   must first be added and follow [Add repository](../agentbase-ingest/SKILL.md) for the same approved scope
   without requiring another command. Do not prepare Refresh for a new match
   or recursively retry conflicting identity results;
   ask the owner to resolve an ambiguous fork/mirror match. Use the returned
   exact Repository concept identity as the Refresh subject; never derive its
   Profile home from the checkout path or current source evidence.
2. For `delta`, call `prepare_hub_okf` with `mode: refresh` and either omit
   `refresh_scope` or pass `delta`; provide no evidence digest. For `coverage`,
   use ordinary read/search tools against the exact Preflight
   `analysis_source_repository` and broadly but boundedly check identity/product,
   runtime/entrypoint, interface/event/trigger, integration/data/channel and
   deploy/operations. Resolve retained findings to exact source; do not read or
   send every file. Then call Prepare with `refresh_scope: coverage` and one
   truthful `coverage` account. `partial` is true exactly when bounded source or lane limitations remain. Treat returned active local `main`, source
   snapshot, continuity, known gaps and omitted counts as the baseline.
3. For Delta, investigate in order: exact changed source, known Questions/
   limitations/broken or aging references, then one small discovery pass. For
   Coverage, reconcile the broad findings from step 2 with exact changed source
   and returned known gaps; do not run a second broad pass. Before discovery,
   inspect the exact Git diff from the returned previously observed commit to
   the current commit for every returned changed path; do not replace this with
   a partial read of a large file. Resolve retained observations to exact authorized source.
4. Author only inside the prepared `bundle/` following `agentbase-okf`. A valid
   SAM/CloudFormation change retains source Type/logical ID and cites both the
   resource and applicable Globals spans. Recheck affected functions when a
   supported inherited scalar changes; do not evaluate macros, nested stacks,
   dynamic references or deployed values. IAM permission is not interaction
   evidence. Preserve unresolved expressions as limitations. A
   sparse or partial result is enough; do not search for completeness.
   Preserve the prepared Repository home, root/capsule/shared navigation and
   every existing Profile path. Refresh has no `home_plan` and cannot rehome a
   concept.
   Keep one change-accounting row for every path in `sourceChanges.paths`:
   `updated`, `new`, `embedded`, `question` or `ignored`, with a concise reason.
   Use `updated`/`new`/`embedded` only when a changed concept cites that exact
   current-Repository path. Report `sourceChanges.omitted` and limitations as a
   partial boundary rather than claiming complete coverage.
   Every new standalone known concept must have an evidenced structural path
   allowed by that concept's exact schema to a Repository or Domain. For a
   Resource, use `implemented-in -> Repository`; Resource does not admit
   `declared-by` or Resource-to-Resource `depends-on`. Otherwise keep it embedded
   or record the limitation; never create an isolated node only to retain prose.
   Prefer updating one existing runtime parent when changed behavior, internal
   storage, retry, dead-letter handling or monitoring shares its deployment and
   ownership boundary. Keep independently deployed frontend, backend, worker
   and cross-repository shared boundaries separate; consolidation is not a
   fixed concept-count target. Update an optional `Embedded Relations` table
   when exact current evidence changes a useful runtime direction. Use only
   `self`, one exact concept identity or one unique same-parent embedded name,
   and never infer an arrow from containment or prose alone.
5. Preserve omission. Missing source/search evidence, elapsed time or an omitted
   file never means deletion. For a shared multi-repository concept, change only
   structured source/observation/relation entries with exact current-Repository
   evidence ownership. Preserve ambiguous prose/metadata and declare a Question
   or limitation. Treat returned Refresh coverage debt as recovery input. Do not
   edit `agentbase.repository.refresh_coverage` directly: Finalize records it for
   partial Delta/Coverage, preserves it for complete Delta and clears it only
   after a non-partial explicit Coverage pass adds no knowledge. Do not run
   three Coverage passes automatically. Stop early on that clean confirmation;
   otherwise inspect and review each proposal before the next pass. Stop after
   three non-converged passes, leave remaining debt visible for owner review and
   return ordinary work to Delta. The cap is not a completeness claim.
6. When concept documents change, validate them once with the prepared `session_id`
   and perform at most one content repair. That validation must pass before Finalize.
   With no changed concepts, skip `validate_okf_changes` (it requires a non-empty
   change set); do not invent edits or submit unchanged concepts. Finalize still
   validates the normalized session bundle and runtime-materialized updates.
   Call `finalize_hub_okf_proposal` once with the complete `change_accounting`,
   Questions and any destructive `removals` bound to the final bytes. Every
   removal needs a bounded reason and exact existing current-Repository evidence
   resources. Corrections are ordinary edits; do not invent evidence to make a
   removal or materialized change outcome pass.
7. If Finalize returns `no_change`, report it without calling inspection. Otherwise
   use Finalize's compact `proposal_id` and `proposal_digest`, call
   `inspect_hub_okf_proposal` once for details, and present the complete
   grouped inspection. Stop before Publish.
   `coverage.partial` concerns investigation scope; `changeAccounting.partial`
   concerns the source delta. They may differ: accounting for every returned
   changed path does not clear earlier discovery/coverage limitations. Read
   each known gap's `details` list alongside its short `detail` summary.

## Recovery

One retryable stateless guidance `INVALID_ARGUMENT` may be corrected once before
proposal state exists. This budget is independent of the one content repair.
Do not automatically retry Prepare, Finalize, stale Hub/source, authority,
integrity, transport or uncertain-state failures. Report those as Incomplete
with the exact diagnostic and retained repairable workspace when available.
