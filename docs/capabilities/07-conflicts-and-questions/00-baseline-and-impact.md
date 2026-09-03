# 07.00 — Baseline and impact

> Status: Shared Questions and three-tier AWS/SQS enrichment are implemented;
> per-item lifecycle states removed from MVP.

## Outcome

Section 07 allows multiple source-backed claims to coexist, preserves uncertainty
as Questions and turns maintainer answers into scoped evidence/guidance instead
of global truth. A conflict does not block Ingest and can be resolved in batches
through Domain Enrichment.

## Reusable baseline

- Concept documents already retain source IDs/provenance, and canonical relations
  retain evidence IDs.
- The current `agentbase.live_claims` identifies volatile observations; Section 08
  has superseded it with snapshot-first `agentbase.observed_values`.
- Proposal Finalize renders bounded Question declarations as ordinary Hub Markdown
  and an index before inspection/digest; there is no Question sidecar.
- A Question ID is derived from an immutable origin tuple and contains no Hub or
  machine identity; an exact revision check prevents answering a Question that
  changed underneath the user.
- `answer_hub_question` requires an explicit `human:*`, creates exactly one
  Maintainer Guidance proposal and does not modify accepted Hub bytes directly.
- Refresh already has explicit removal/correction intent and review grouping; the
  runtime `supersede/retract` state has been removed under the current contract.
- Hub query already reads canonical claims/relations at an exact commit but does
  not yet compose a complete conflict-aware answer.

## Deferred gaps

1. The runtime accepts explicit `needs-review` but does not yet infer it from new
   evidence that conflicts with Guidance.
2. Baseline Ingest/Refresh currently creates Questions from observed-value
   references. Capability 046 Initial Ingest reuses the same SharedQuestion
   renderer and adds a private, Receipt-bound QuestionPlan for missing-evidence,
   relation or identity candidates with an exact source revision; it does not
   create a second Question system.
3. Maintainer Guidance currently binds an exact subject/property; there is no
   reviewed Domain-wide or Hub-wide scope or provider-evidence resolution yet.
4. Conflict-aware query composition and batch Question resolution are not yet available.
5. Complete conflict-aware query composition belongs to Section 10.

## Impact checkpoint

| Boundary | Impact | Reason |
|---|---|---|
| Claim/provenance model | Contained if natural knowledge identities are reused | Do not create a universal claim database or an ID for every paragraph. |
| Shared Published Questions | Broad change | Requires Hub representation, query and synchronization instead of machine-only truth. |
| Needs Review lifecycle | Contained after shared model | Adds a transition based on new evidence or a Guidance revision. |
| Maintainer Guidance scope | Contained change | Reuses the current proposal/document path and explicit human authority. |
| Conflict presentation | Contained after model | Primarily query/read composition; no scorer is needed. |
| Exact correction/removal | Contained change | The proposal/pull request states the reason/evidence; Git retains history without a tombstone state. |
| Batch Question resolution | Broad change | Uses the Domain Enrichment multi-repository proposal/checkpoints from Sections 06 and 09. |

There is no need to rewrite OKF concepts, the Git-backed Hub or the proposal
lifecycle. Section 08 makes a clean cutover from the old live-reference model to
observed snapshots; Section 07 only uses stable observed-value identity and
provenance and does not own the resolver. A Question in an unaccepted proposal
is work in progress; after Accept it is shared Hub knowledge. A private index or
cache has no authority.

## Dependency boundaries

- Relation/identity candidates come from Section 06.
- Observed snapshots and the current-source response boundary belong to Section 08.
- Domain Enrichment orchestration belongs to Section 09.
- Conflict-aware responses belong to Section 10.
- Review/pull-request publication belongs to Section 11.

Section 07 defines the governance contract; it does not repeat those workflows.
