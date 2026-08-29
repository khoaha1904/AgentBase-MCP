# 05.05 — Publication-layer reconciliation

> Status: Technical design draft.

## Synchronize flow

```text
fetch remote main
      ↓
recognize pending proposals already Published
      ↓
replay remaining proposal commits in isolated candidate
      ↓ validate exact candidate
atomically advance local main and remoteBase
```

Proposal recognition continues to use commit ancestry, proposal trailer/diff
identity and stable patch identity. Do not match only by concept title or
resource name.

## Cleanup semantics

- Do not remove individual items or files from a local sidecar.
- A proposal recognized as Published simply leaves pending ancestry when the
  local base advances to the remote commit.
- An unpublished proposal is rebased as a whole, retaining proposal identity
  and knowledge bytes when validation succeeds.
- Query classification is recomputed from the new remoteBase/activeHead.

## Failure and recovery

- Fetch, conflict or validation failure does not change active local state.
- Candidate/recovery receipts retain the exact phase and conflict paths.
- Do not drop proposals, force-push, rewrite remote main or retry invisibly.
- A conflict must be resolved before the next publication.

## Minimal runtime delta

Keep current `accept`, `pending`, `publish`, `synchronize` and recognition. Only
bounded inventory/query metadata needs expansion to expose layer/proposal state;
do not change Git topology or add a persistence model.
