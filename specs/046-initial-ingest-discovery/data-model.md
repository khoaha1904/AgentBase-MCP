# Data model — Initial Ingest discovery quality

All entities below are private runtime/checkpoint values except the final OKF
documents and activity summaries. Raw source and graph records never enter Hub.

## SourceSnapshot

Exact source selected by Hub Init Preflight.

- `repositoryId`: canonical AgentBase Repository identity
- `remote`: GitHub/GHE host plus owner/repository
- `defaultBranch`: API-resolved default branch
- `commit`: exact 40-hex remote head
- `requestedRoot`: admitted user-selected Git root
- `analysisRoot`: current clean checkout or private detached worktree
- `kind`: `current-checkout | detached-worktree`
- `createdAt`: observation time

Rules:

- Current checkout is reusable only when clean and `HEAD == commit`.
- Snapshot identity is `repositoryId + remote + defaultBranch + commit`;
  machine-local paths never enter evidence or Hub.
- Repository switch, inaccessible/changed snapshot or lost authority invalidates
  downstream mutable state. Default-head advance marks `source-advanced` but
  does not invalidate the pinned snapshot.

## DiscoveryLane

One of:

1. `identity-product`
2. `runtime-entrypoint`
3. `interface-event-trigger`
4. `integration-data-channel`
5. `deploy-operations`

Lane result is `covered | absent-after-check | limited` plus bounded limitation
text when limited.

## DiscoveryGroup

Compact machine-derived structural signal.

- `id`: session-stable digest-derived ID
- `lane`: owning DiscoveryLane
- `kind`: normalized signal kind
- `priority`: `p0 | p1 | p2`
- `title`: bounded technical label, not a concept name
- `count`: number of grouped provider/file rows
- `sources`: bounded exact relative path/span samples
- `hints`: bounded normalized facts
- `limitations`: parser/truncation/source diagnostic

Groups may combine one runtime's entrypoints, one interface's routes, one
target/protocol integration or one workload's deploy resources. They do not
assert semantic OKF identity.

## DiscoverySeed

Per-connection machine baseline.

- `id`, `digest`
- SourceSnapshot identity and engine/profile identity
- five lane diagnostics
- ordered DiscoveryGroups
- capture limitations
- `state`: `collecting | ready | invalid`

The Seed resets on source/repository switch, revision change or connection close.

## InventoryItem

Agent interpretation of one or more Seed groups.

- `id`
- `originGroupIds`: non-empty unique Seed IDs
- `disposition`: `concept | embedded | question | ignored`
- `candidateId`: required for concept/embedded
- `parentCandidateId`: required for embedded
- `questionSummary`: required for question
- `reason`: required for ignored; optional bounded rationale otherwise
- `evidenceIds`: exact observations used by concept/embedded/question

Every important Seed group appears exactly once across Inventory items after
split/merge normalization. Question and Ignored items never enter schema
selection.

## DiscoveryInventory

- `seedId`
- five lane results
- InventoryItems
- semantic and Terraform/Terragrunt observations
- bounded run limitations

It remains mutable until successful guidance.

## InventoryReceipt

Immutable compact result of guidance validation.

- `id`: `discovery-receipt-<24 hex>`
- `seedDigest`, SourceSnapshot identity
- normalized lane results and dispositions
- guidance request/output for concept/embedded candidates
- selected schemas
- materialization expectations for concept, embedded and Question items
- ignored counts/reasons and limitations
- `digest`, `createdAt`
- `state`: `frozen | prepared | invalid`

Before Prepare it is connection-only. Prepare persists it in the private
authoring checkpoint and atomically marks it prepared. A receipt cannot prepare
two unrelated sessions.

## CoverageResult

- per-lane status
- P0 acknowledged/missing group IDs
- materialized/missing disposition IDs
- ignored counts/reasons
- limitations
- outcome: `ready-for-review | incomplete`

P1/P2 gaps may be Ready with limitations. Missing P0 acknowledgement,
authority/source mutation or integrity failure is Incomplete.

## ActivityEntry

Human-readable successful knowledge summary rendered using existing Hub log
grammar.

- date/time
- operation: Init, Refresh, correction, Question resolution or Enrichment
- affected Repository/Domain and bounded summary
- proposal/source revision reference where supported by current grammar

Repository activity goes to `repositories/<slug>/log.md`; Domain membership and
cross-repository/Enrichment activity goes to `domains/<slug>/log.md`. Failed or
Incomplete runs produce no ActivityEntry.

## State transitions

```text
Preflight → SourceSnapshot
             ↓
Discover → Seed collecting → Seed ready
                              ↓
Investigate → mutable Inventory
                              ↓ guidance success
                       Receipt frozen
                              ↓ Prepare
                       Receipt prepared + authoring checkpoint
                              ↓ Author/Validate
                     Ready for review | Incomplete
```

Source snapshot or Hub-base drift invalidates the earliest unsafe state.
Default-head advance is only a freshness warning. Before Prepare, retry recreates
Inventory and may reuse an exact graph. After Prepare, retry may reuse the
checkpoint while the pinned SourceSnapshot remains valid; Hub-base changes use
the proposal reconciliation rules.
