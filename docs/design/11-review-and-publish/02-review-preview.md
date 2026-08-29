# 11.02 — Review preview

> Status: Structured inspection, including atomic Batch Initial Ingest, is
> implemented; optional visual review is deferred.

## Outcome

Review lets the user understand what a proposal will change before Local Accept
and before a pull request. Selection occurs while the authoring draft is still
editable; a Finalized proposal is an atomic review unit and can only be Accepted
in full or returned for editing.

## MVP flow

```text
editable authoring draft
        ↓ add / edit / remove items
Finalize validates dependencies and locks exact bytes
        ↓
structured inspection + bounded before/after content
        ↓ accept all | return to authoring
immutable Local Draft commit
        ↓ later publication selection
PR preview/body + exact Git diff
```

Preview groups `Added`, `Updated`, `Removed` and `Questions/Limitations`. Initial
Ingest also shows Repository/Domain/revision, five-lane coverage, embedded groups,
relations/Flows and ignored counts/reasons; raw Seed/Inventory/graph data does
not enter review or the pull request. Each entry retains its path, change kind,
allowed state, reason when available, bounded before/after bytes and digest. A
destructive entry must retain its correction/removal reason/evidence; preview
does not infer the reason from the Git diff.

## Atomic selection rule

- Concepts, relations, Questions, evidence and navigation can be edited before Finalize.
- Finalize rechecks the entire bundle, relation targets, protected bytes,
  Question references and navigation invariants.
- After Finalize, no per-item checkbox can change the locked bundle.
- If review fails, return to authoring and Finalize again; Accept requires the
  exact reviewed proposal diff digest and tree digest.
- Publication can select dependency-safe proposal commits but cannot split items
  inside an accepted proposal.

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
- An invalid/non-applicable inspection cannot be Accepted.
- Proposal bytes/base changing after inspection makes Accept fail closed.
- Preview does not read source, probe credentials, Refresh, Accept or Publish.

## Knowledge activity summaries

Successful proposal materializes concise newest-first entries in
`repositories/<slug>/log.md` for repository-owned activity and
`domains/<slug>/log.md` only for Enrichment, cross-repository relation/Flow or
explicit Domain correction. Routine Repository membership does not duplicate a
Domain log entry. Existing Hub log grammar remains authoritative. Do not log query,
tool call, raw Inventory or failed/Incomplete attempt. Git commit, PR and exact
diff remain the complete audit history.

## Current implementation gap

Structured inspection, grouped changes, bounded content and exact-digest Accept
exist. The host workflow must clearly express the return-to-authoring step when
review fails. Static HTML/graph review is outside the MVP and needs no runtime capability yet.
