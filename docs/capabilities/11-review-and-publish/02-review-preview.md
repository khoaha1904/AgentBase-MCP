# 11.02 — Review preview

> Status: Structured byte and semantic inspection, including atomic Batch
> Initial Ingest, is implemented and verified; optional visual review remains
> deferred. G5-C1 activity-log removal is implemented and verified; G5-C2
> pre-Finalize quality summary is deferred and inactive.

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

The deferred G5-C2 design adds no quality policy/packet/report, findings/probes,
repair count or owner override to current inspection. Optional external AI
review notes remain outside AgentBase state and the Hub.

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

## Operational history

Compact Profile 1.0 materializes no Repository or Domain activity `log.md`.
Git commits, pull requests and their exact diffs remain complete shared history.
Discovery and proposal-operation records stay in owner-private workflow state
and are retained only for review/publication/recovery. Optional external review
notes are not AgentBase inspection evidence or Published knowledge.

## Current implementation gap

Structured inspection now retains grouped byte changes, bounded content and one
digest-bound semantic projection covering concepts, relations, Flows,
Questions, navigation, canonical scope, dangling references, strong-identity
duplicates and explicit omissions. Inspect and Accept rederive it before use;
newly prepared legacy evidence fails before mutation, while already accepted
legacy proposals retain the bounded publication warning. The host workflow
must still clearly express the return-to-authoring step when review fails.
Static HTML/graph review and Group 5 quality summary remain outside the current
implemented delivery.
