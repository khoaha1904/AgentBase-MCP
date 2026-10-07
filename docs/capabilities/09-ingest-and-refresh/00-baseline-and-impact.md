# 09 — Source and proposal workflow

> Status: Implemented; deferred boundaries are stated below.

Preflight authorizes exact source identity/snapshot; new Ingest freezes
Seed/Inventory/Receipt, Prepare creates a private bundle, and
Validate/Finalize/Inspect enforce exact evidence and bytes. Refresh reconciles only
its source contribution and preserves omission/protected content. Batch Initial
Ingest is sequential with per-member checkpoints and one atomic result; Batch Refresh
and mixed modes remain deferred.

## Contract owners

Current bounds and field contracts live in
[09-runtime-requirements.md](09-runtime-requirements.md) and
[Publication and recovery](../11-review-and-publish/12-direct-publication-requirements.md).
Changes follow the repository impact gate; Git retains superseded designs.
