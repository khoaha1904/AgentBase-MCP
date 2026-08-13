# Data Model: Graph Refresh Reuse

## GraphFreshnessReceipt

Private, disposable acceptance state. Version 1 fields:

- `schemaVersion`: literal `1`;
- `repositoryId`: normalized repository identity;
- `source`: `commit`, `dirty` and `dirtyDigest`; excludes capture time, display
  name and limitations because those do not change source content;
- `engine`: provider/package/version/integrity/executable/adapter/invocation-mode
  identity used by the accepted round;
- `namespaceId`: opaque digest identifying the private provider project/cache
  namespace, not an absolute path;
- `evidenceDigest`: normalized bundle digest from the accepted round;
- `acceptedAt`: completion time for local diagnosis, not freshness comparison.

Validation rejects wrong types, unsupported versions, unbounded strings,
malformed hashes, inconsistent dirty/digest values or an engine outside the
current exact managed identity.

## GraphPreparationDecision

- `mode`: `reused | refreshed`;
- `reason`: `exact-match | missing-receipt | source-changed |
  provider-changed | forced`.

`evidenceDigest` and `acceptedAt` do not participate in freshness matching.

## GraphPreparationDiagnostics

Extends current graph-round diagnostics with preparation `mode` and `reason`.
Existing engine/source/timing/fact/source-path/integrity/cleanup fields remain.
Receipt contents and paths never enter output.

## State transitions

```text
no/invalid receipt ── explicit round ──> refresh provider
exact match        ── explicit round ──> reuse provider cache
identity mismatch  ── explicit round ──> refresh provider
any state          ── --refresh      ──> refresh provider

refresh/reuse + queries + integrity + clean close
    └── success: atomic receipt replace
    └── failure: previous receipt unchanged
```

Concurrent successful equivalent rounds may use last-writer-wins atomic
replacement. No lock manager or cache generation is introduced.
