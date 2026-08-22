# MCP Contract: Batch Initial Ingest

## `prepare_batch_hub_ingest`

Accepts 2..32 explicit absolute repository roots plus one proposed Domain. It
runs deterministic source/Hub identity preflight only and returns a matrix with
member IDs, canonical status, document hints, Domain comparison and warnings.
It creates no authoring session and performs no model, graph or provider call.

## `confirm_batch_hub_ingest`

Accepts the exact prepared manifest revision and complete corrected membership/
Domain decision. It rejects unresolved, duplicate, nested or existing canonical
repositories and returns an immutable confirmed manifest with sequential order.

## Existing single-repository authoring tools

For each confirmed member, the host skill uses the existing graph/guidance flow
and `prepare_hub_okf` against the manifest base. It reports the resulting session
to the batch using `record_batch_hub_ingest_member`. The recorder validates exact
member, base, source state and session ownership; arbitrary trees are rejected.

## `retry_batch_hub_ingest_member`

Marks exactly one failed/invalidated member ready for a new ordinary authoring
attempt. It never reruns a member, invokes a model or changes completed siblings.

## `revise_batch_hub_ingest_membership`

Creates a new manifest revision from a complete replacement membership. It
reports reusable/invalidated members and blocking attributable dependencies.
No proposal or accepted state is changed.

## `finalize_batch_hub_ingest_proposal`

Requires exact terminal completed checkpoints for all current members. It
composes their validated changes, reconciles append-only indexes and regenerates
only the confirmed Domain's navigation from exact member targets, rejects every
other ownership/dependency overlap, validates the complete bundle and creates
one `batch-new` proposal plus inspection. It does not Accept or Publish.

## Existing lifecycle

Inspect, Accept, pending reconstruction and submit admit `batch-new` as one
indivisible independent PR unit targeting `main` with all member Repository IDs.
