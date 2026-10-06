# 11.02 — Review preview

> Status: Structured byte and semantic inspection, including atomic Batch
> Initial Ingest, is implemented and verified; optional visual review remains
> deferred. G5-C1 activity-log removal is implemented and verified; G5-C2
> pre-Finalize quality summary is deferred and inactive.

## Outcome

Review explains material changes before explicit Publish. Selection occurs in
the editable authoring workspace; Finalize locks one atomic proposal.

```text
editable draft → deterministic Finalize → structured inspection
              → confirm exact proposal Publish | return to authoring
```

Preview groups `Added`, `Updated`, `Removed` and `Questions/Limitations`. Initial
Ingest also shows Repository/Domain/revision, five-lane coverage, embedded groups,
relations/Flows and ignored counts/reasons; raw Seed/Inventory/graph data does
not enter review or the pull request. Each entry retains its path, change kind,
allowed state, reason when available, bounded before/after bytes and digest. A
destructive entry must retain its correction/removal reason/evidence; preview
does not infer the reason from the Git diff.

Tool responses carry each inspection payload once. Grouped entries retain path,
change and decision metadata while file bytes remain in the ordered entry list;
preserved files have no before/after content. Inspect exposes `proposal_digest`
as the exact digest accepted by Publish.

Finalize and Inspect also expose `refreshSuggestions` for newly promoted
Resources whose title matches an embedded item in a retained base concept.
Each candidate names the foreign source Repository and parent to Refresh for
possible `publishes-to`/`writes-to` evidence. Matching ignores case and repeated
whitespace only; it is not identity or ownership proof. Parents citing multiple
repositories are left for agent investigation. Suggestions are deterministic,
limited to 16 with an omitted count, and rechecked against retained bytes.
They never modify another Repository's concepts or start Refresh.

The deferred G5-C2 design adds no quality policy/packet/report, findings/probes,
repair count or owner override to current inspection. Optional external AI
review notes remain outside AgentBase state and the Hub.

## Atomic selection rule

- Concepts, relations, Questions, evidence and navigation can be edited before Finalize.
- Finalize rechecks the entire bundle, relation targets, protected bytes,
  Question references and navigation invariants.
- After Finalize, no per-item checkbox can change the locked bundle.
- If review fails, return to authoring and Finalize again; Publish requires the
  exact reviewed proposal diff digest and tree digest.
- Publish consumes one complete proposal; it cannot split its items.

This rule avoids creating a second selection engine that automatically repairs a
relation/index/Question when the user removes an item.

## Optional visual review after MVP

A static local HTML file can be generated from immutable inspection data to show:

- a summary and change groups;
- concept cards with before/after content;
- a relation graph and affected neighbors;
- Questions, limitations and evidence/provenance;
- exact proposal/tree/diff identity.

HTML is a derived view, not Hub state or review authority. If implemented, the
first version only needs to generate a file and open it in a browser; it needs no
persistent server, database, login or write API. Interactive editing/selection is
considered only after the static view proves useful, and every change must still
return to authoring and be Finalized again.

## Failure boundaries

- Truncated content must be marked clearly and retain its digest; do not present it as a full diff.
- An invalid/non-applicable inspection cannot be Published.
- Proposal bytes/base changing after inspection makes Publish fail closed.
- Preview does not read source, probe credentials, Refresh or Publish.

## Operational history

Compact Profile 1.0 materializes no Repository or Domain activity `log.md`.
Git commits, pull requests and their exact diffs remain complete shared history.
Discovery and proposal-operation records stay in owner-private workflow state
and are retained only for review/publication/recovery. Optional external review
notes are not AgentBase inspection evidence or Published knowledge.

## Implemented and deferred boundary

Inspection retains grouped byte changes and a digest-bound semantic projection.
Inspect and Publish rederive it before use. Invalid or stale proposal evidence
fails before mutation; a failed review returns to authoring.
Static HTML/graph review and semantic-quality admission remain deferred.
