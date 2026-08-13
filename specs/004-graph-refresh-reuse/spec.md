# Capability 004: Graph Refresh Reuse

- **Status:** Completed
- **Created:** 2026-08-12
- **Completed:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`

## Outcome

A coding agent can repeat an explicit repository evidence round without paying
for another graph index when the accepted source and provider are unchanged.
When source changes, or the caller explicitly requests refresh, AgentBase asks
the managed graph provider to update its graph and accepts the new freshness
state only after the complete round succeeds safely.

This capability hardens Part 1 only. It does not implement an incremental
parser, watcher, daemon, automatic background work, graph publication or OKF
authoring behavior.

Promotion result: exact initial/reuse/add/modify/delete/forced qualification
passed. Unchanged reuse invoked no index and preserved fact/source evidence;
changed and forced rounds returned current graph results with clean cleanup.

## Owner decisions treated as settled

- Codebase Memory owns graph construction and its internal full/incremental
  mechanics. AgentBase will not reimplement them.
- AgentBase owns one small private freshness receipt that binds an accepted
  source state, managed provider identity and private graph namespace.
- An exact receipt match may skip indexing and query the existing private graph.
- A missing/mismatched receipt, changed source or explicit `--refresh` delegates
  exactly one refresh to the provider in the current bounded session.
- Receipt state advances only after complete evidence, unchanged source through
  cleanup and clean process shutdown.
- If a supposedly reusable graph cannot be queried, the round fails visibly and
  tells the caller to retry explicitly with `--refresh`; there is no hidden
  refresh retry.
- Existing explicit evidence remains the trigger. No background refresh or
  standing process is added.
- The slice stops instead of growing recovery machinery if the exact provider
  cannot satisfy this contract reliably.

## User stories

### User Story 1 — Reuse an unchanged graph (P1)

As a coding agent, I can repeat an explicit evidence request for unchanged
source and receive current graph evidence without invoking another index.

**Independent test:** Prepare one accepted round, then repeat it with the same
source/provider/private namespace and prove that the second round makes zero
index calls while returning equivalent normalized evidence.

Acceptance:

- the first successful round creates one private freshness receipt;
- an exact source/provider/namespace match selects `reused` preparation and
  makes zero provider index calls;
- query, source-integrity and cleanup checks still run on every round;
- diagnostics disclose `reused` without exposing machine-local paths or adding
  timing/receipt data to the normalized evidence digest;
- a missing, malformed or mismatched receipt is never treated as fresh.

### User Story 2 — Refresh explicitly when freshness changes (P1)

As a coding agent, I can change repository source or request `--refresh`, then
receive graph evidence that reflects the new source without AgentBase owning a
second indexing algorithm.

**Independent test:** Add, modify and delete authored fixture code across
separate rounds and prove that each changed or forced round makes exactly one
provider index call, returns the expected new graph facts and advances the
receipt only after safe completion.

Acceptance:

- changed source, missing receipt and `--refresh` select `refreshed` preparation;
- AgentBase calls only the provider's existing index operation and does not
  inspect files to compute graph deltas;
- failed indexing, failed queries, source drift or uncertain cleanup leave the
  previous receipt byte-for-byte unchanged;
- a reusable-cache query failure performs no automatic refresh and provides an
  explicit `--refresh` recovery instruction;
- diagnostics disclose `refreshed` and a bounded reason: `missing-receipt`,
  `source-changed`, `provider-changed` or `forced`.

## Functional requirements

- **AB-REFRESH-001**: AgentBase MUST maintain at most one private freshness
  receipt per repository/provider graph namespace, outside the source checkout.
- **AB-REFRESH-002**: The receipt MUST bind a schema version, repository source
  identity, exact managed engine identity, graph namespace identity and the
  accepted normalized evidence digest without storing an absolute source path.
- **AB-REFRESH-003**: A receipt MUST be reusable only when every bound identity
  exactly matches the current round; absent, malformed, unsupported or
  mismatched state MUST select provider refresh rather than freshness reuse.
- **AB-REFRESH-004**: An exact reusable receipt MUST cause zero provider index
  calls while preserving the current bounded query, source-integrity and
  cleanup lifecycle.
- **AB-REFRESH-005**: Missing/mismatched freshness, changed source or explicit
  `--refresh` MUST invoke exactly one provider-owned index operation before the
  existing evidence queries.
- **AB-REFRESH-006**: AgentBase MUST NOT implement file-level graph deltas,
  language parsing or provider-private incremental state.
- **AB-REFRESH-007**: A new receipt MUST be written atomically and privately
  only after complete normalized evidence, source integrity through cleanup and
  clean provider shutdown are established.
- **AB-REFRESH-008**: Any refresh, query, source-integrity or cleanup failure
  MUST produce no partial successful evidence and MUST leave the previous
  receipt unchanged.
- **AB-REFRESH-009**: A failed reuse query MUST fail visibly with explicit
  `--refresh` recovery guidance and MUST NOT trigger an automatic index retry.
- **AB-REFRESH-010**: Diagnostics MUST report `reused` or `refreshed` plus the
  bounded decision reason; receipt paths, local roots and timing MUST remain
  outside normalized evidence and its digest.
- **AB-REFRESH-011**: The capability MUST preserve the exact managed binary,
  private cache, allowed root and short-lived session, and MUST NOT activate a
  watcher, daemon, UI, provider configuration mutation, network, credential or
  model call.
- **AB-REFRESH-012**: Mandatory verification MUST remain offline with fakes and
  captured provider responses; exact-provider add/modify/delete/reuse
  qualification MUST remain explicit and must disclose measured limitations.

## Key entities

- **Graph freshness receipt:** Private acceptance record binding one source,
  provider and graph namespace to the last safely completed evidence digest.
- **Graph preparation decision:** Per-round result selecting `reused` or
  `refreshed` and a bounded reason.
- **Graph preparation diagnostics:** Observable, non-canonical report of the
  decision, lifecycle timings and safety outcome.

## Edge cases

- Receipt exists but is truncated, has an unknown schema or fails validation:
  treat it as non-reusable and refresh; overwrite only after success.
- Receipt matches but the provider cache was deleted or corrupted: fail the
  query with explicit `--refresh` guidance; do not double the work invisibly.
- Source changes after the decision or while queries/cleanup run: reject the
  entire round and retain the previous receipt.
- Managed provider version or integrity changes: refresh even if source is
  unchanged.
- Two rounds target the same namespace concurrently: each may commit only a
  complete atomically written receipt; the last successful equivalent state may
  win, and no reader may observe partial JSON.
- Explicit `--refresh` is used on unchanged source: perform one provider index
  operation and record `forced`; do not claim incremental speed.

## Success criteria

- **SC-REFRESH-001**: A second unchanged fixture round makes zero index calls,
  returns fact/source-equivalent normalized evidence and reports `reused`.
- **SC-REFRESH-002**: Add, modify and delete fixture scenarios each make exactly
  one index call and return graph facts consistent with the new source.
- **SC-REFRESH-003**: Every injected index, query, mutation and cleanup failure
  leaves the prior receipt byte-for-byte unchanged, emits no partial success and
  leaves zero standing provider processes.
- **SC-REFRESH-004**: The unchanged path removes the measured approximately
  `3.47s` no-op index stage on the accepted fixture; no repository-scale or
  provider-incremental latency claim is made.
- **SC-REFRESH-005**: Canonical verification passes fully offline with no native
  provider, network, credentials or AI call.

## Assumptions

- The accepted repository source identity already captures commit plus relevant
  dirty authored content and excludes generated, dependency, secret-like and
  AgentBase-owned state by contract.
- The provider's explicit index operation is the supported freshness entrypoint;
  AgentBase relies on its graph correctness but not on an incremental latency
  guarantee.
- The private cache is disposable. `--refresh` is sufficient recovery for this
  MVP; cache generations, garbage collection and repair commands are deferred.

## Explicit non-goals

- File watcher, daemon, polling loop or refresh without an explicit command.
- AgentBase-owned parser, call-graph builder or incremental indexing algorithm.
- Cache generations, cache garbage collection, a graph-status command or
  provider configuration management.
- Cross-repository graph linkage, Terraform/AWS discovery, OKF enrichment or
  Hub question resolution.
- Universal performance, freshness interval or repository-scale claims.
