# 02.03 — Batch Domain assignment

> Status: Batch Initial Ingest assignment is implemented offline; Batch Refresh
> is deferred.

## Scope

Batch accepts only repository roots specified by the user in the workspace. It
does not recursively scan the workspace/home to find repositories.

The host skill runs Domain preflight for each repository before full Ingest and
creates a confirmation matrix:

| Repository | Existing | Proposed | Evidence | Warning |
|---|---|---|---|---|
| crawler-api | Crawler | Crawler | root README | — |
| crawler-job | — | Crawler | docs overview | new assignment |
| recommender | Recommendation | Crawler | root README | mismatch |

## Confirmation

- The user may declare one shared Domain for the whole batch.
- The skill still checks each repository and does not hide an unusual one.
- The user edits the Domain or removes a repository before confirming the matrix.
- No repository starts full Ingest while the matrix has an unresolved row.

After confirmation, repositories run sequentially with an individual checkpoint.
A repository failure does not delete another repository's completed checkpoint,
but the batch remains `Incomplete`: no atomic proposal is available for Accept,
Publish or Published-knowledge query. Retry or a membership revision must finish
before the entire batch is finalized again.

## Runtime shape

Batch Initial Ingest uses bounded MCP tools for preflight, manifest, member run,
finalize and inspection. The host skill keeps the workflow understandable for
the user; durable reviewable knowledge appears only in the atomic proposal after
finalize.
