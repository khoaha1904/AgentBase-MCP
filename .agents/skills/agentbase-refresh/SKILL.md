---
name: agentbase-refresh
description: Refresh one existing AgentBase Hub Repository contribution from an authorized local checkout into a reviewable Local Draft. Use after Initial Ingest when repository knowledge may have changed; not for Batch, Domain Enrichment, publication, or provider CLI enrichment.
---

# Refresh one AgentBase repository

Produce either `no_change`, one reviewable partial/complete Local Draft, or an
Incomplete result. Never Accept, publish, submit, synchronize, clone another
repository, or invoke provider CLI from this workflow.

## Workflow

1. Run `preflight_hub_ingest` for the exact local checkout. Continue only for
   one existing canonical Repository match. Route a new match to Initial Ingest;
   ask the owner to resolve an ambiguous fork/mirror match.
2. Prepare `mode: refresh` without an evidence digest. Treat returned active
   local `main`, source snapshot, continuity, known gaps and omitted counts as
   the bounded baseline.
3. Investigate in order: exact changed source, known Questions/limitations/
   broken or aging references, then one small discovery pass. Before discovery,
   inspect the exact Git diff from the returned previously observed commit to
   the current commit for every returned changed path; do not replace this with
   a partial read of a large file. Use Code Graph as a private map and resolve
   retained claims to exact authorized source.
4. Author only inside the prepared `bundle/` following `agentbase-okf`. A valid
   sparse or partial result is enough; do not search for completeness.
5. Preserve omission. Missing graph/search evidence, elapsed time or an omitted
   file never means deletion. For a shared multi-repository concept, change only
   structured source/claim/relation entries with exact current-Repository
   evidence ownership. Preserve ambiguous prose/metadata and declare a Question
   or limitation.
6. Validate changed concepts once and perform at most one content repair.
   Finalize once with Questions and any destructive `lifecycle_intents` bound to
   the final bytes. Every intent needs a bounded reason and exact existing
   current-Repository evidence resources. Use `supersede` only with a real
   replacement concept. Do not invent evidence to make an intent pass.
7. Present `no_change` or the complete grouped inspection. Stop before Accept.

## Recovery

One retryable stateless guidance `INVALID_ARGUMENT` may be corrected once before
proposal state exists. This budget is independent of the one content repair.
Do not automatically retry Prepare, Finalize, stale Hub/source, authority,
integrity, transport or uncertain-state failures. Report those as Incomplete
with the exact diagnostic and retained repairable workspace when available.
