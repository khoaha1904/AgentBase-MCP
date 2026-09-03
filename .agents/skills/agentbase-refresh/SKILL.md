---
name: agentbase-refresh
description: Explicit-only AgentBase refresh. Use only when the user names $agentbase-refresh to refresh one existing Hub Repository contribution from an authorized checkout; never for ordinary repository reading, Batch, Domain Enrichment, publication, or provider enrichment.
---

# Refresh one AgentBase repository

Produce either `no_change`, one reviewable partial/complete Local Draft, or an
Incomplete result. Never Accept, publish, submit, synchronize, clone another
repository, or invoke provider CLI from this workflow.

This workflow uses `preflight_hub_ingest`, the tools named by
`use-codebase-memory`, optional `list_okf_schemas`/`get_okf_schema`,
`prepare_hub_okf`, `validate_okf_changes`, `finalize_hub_okf_proposal` and
`inspect_hub_okf_proposal` only.

## Workflow

1. Run `preflight_hub_ingest` for the exact local checkout. Continue only for
   one existing canonical Repository match. Route a new match to Initial Ingest;
   ask the owner to resolve an ambiguous fork/mirror match.
2. Call `prepare_hub_okf` with `mode: refresh` and no evidence digest. Treat the
   returned active local `main`, source snapshot, continuity, known gaps and
   omitted counts as the bounded baseline.
3. Investigate in order: exact changed source, known Questions/limitations/
   broken or aging references, then one small discovery pass. Before discovery,
   inspect the exact Git diff from the returned previously observed commit to
   the current commit for every returned changed path; do not replace this with
   a partial read of a large file. Use Code Graph as a private map and resolve
   retained observations to exact authorized source.
4. Author only inside the prepared `bundle/` following `agentbase-okf`. A valid
   sparse or partial result is enough; do not search for completeness.
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
5. Preserve omission. Missing graph/search evidence, elapsed time or an omitted
   file never means deletion. For a shared multi-repository concept, change only
   structured source/observation/relation entries with exact current-Repository
   evidence ownership. Preserve ambiguous prose/metadata and declare a Question
   or limitation.
6. Validate changed concepts once with the prepared `session_id` and perform at
   most one content repair. Session-bound validation must pass before Finalize.
   Call `finalize_hub_okf_proposal` once with the complete `change_accounting`,
   Questions and any destructive `removals` bound to the final bytes. Every
   removal needs a bounded reason and exact existing current-Repository evidence
   resources. Corrections are ordinary edits; do not invent evidence to make a
   removal or materialized change outcome pass.
7. Call `inspect_hub_okf_proposal`, then present `no_change` or the complete
   grouped inspection. Stop before Accept.

## Recovery

One retryable stateless guidance `INVALID_ARGUMENT` may be corrected once before
proposal state exists. This budget is independent of the one content repair.
Do not automatically retry Prepare, Finalize, stale Hub/source, authority,
integrity, transport or uncertain-state failures. Report those as Incomplete
with the exact diagnostic and retained repairable workspace when available.
