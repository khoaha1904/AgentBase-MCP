# Data model — Initial Ingest discovery quality

All entities below are private runtime/checkpoint values except the final OKF
documents and activity summaries. Raw source and graph records never enter Hub.

## SourceSnapshot

Exact source selected by Hub Init Preflight.

- `repositoryId`: canonical AgentBase Repository identity
- `remote`: normalized GitHub/GHE host plus owner/repository and credential-free
  canonical HTTPS URL
- `defaultBranch`: API-resolved default branch
- `commit`: exact 40-hex remote head
- `requestedRoot`: admitted user-selected Git root
- `analysisRoot`: admitted clean exact checkout or AgentBase-private detached
  worktree backed by an AgentBase-private bare mirror
- `kind`: `current-checkout | detached-worktree`
- `createdAt`: observation time

Rules:

- Current checkout is reusable only when clean and `HEAD == commit`.
- Snapshot identity is `repositoryId + remote + defaultBranch + commit`;
  machine-local paths never enter evidence or Hub.
- Repository switch, inaccessible/changed snapshot or lost authority invalidates
  downstream mutable state. Default-head advance marks `source-advanced` but
  does not invalidate the pinned snapshot.
- Source host must equal the active Hub host. Network access uses only that
  profile's token over HTTPS and verifies the fetched commit against the API
  result. Private paths are profile/source scoped and marker-owned.

## DiscoveryLane

One of:

1. `identity-product`
2. `runtime-entrypoint`
3. `interface-event-trigger`
4. `integration-data-channel`
5. `deploy-operations`

Lane result is MCP-computed `covered | absent-after-check | limited` plus bounded
limitation text when limited. `absent-after-check` means bounded supported checks
found no signal; it does not assert real-world repository absence.

## DiscoveryGroup

Compact machine-derived structural signal.

- `id`: session-stable digest-derived ID
- `lane`: owning DiscoveryLane
- `kind`: normalized signal kind
- `priority`: MCP-assigned `p0 | p1 | p2`
- `title`: bounded technical label, not a concept name
- `count`: number of grouped provider/file rows
- `sources`: bounded exact relative path/span samples
- `hints`: bounded normalized facts
- `limitations`: parser/truncation/source diagnostic

Groups may combine one runtime's entrypoints, one interface's routes, one
target/protocol integration or one workload's deploy resources. They do not
assert semantic OKF identity. One group receives one disposition; that
disposition may name multiple materialized outputs without splitting the group.

Fixed P0 classes are identity/confirmed-Domain anchors, evidenced
runtime/entrypoint, explicit interface/trigger, explicit deploy/IaC workload,
explicit outbound dependency and diagnostics that may hide one of those.

## DiscoverySeed

Per-connection machine baseline for an armed Init/Batch Init member only.

- `id`, `digest`
- SourceSnapshot identity and engine/profile identity
- five MCP-derived lane diagnostics
- ordered DiscoveryGroups
- capture totals, paging/truncation/overflow metadata and limitations
- `state`: `collecting | ready | invalid`

The Seed becomes ready only after index status/coverage, the explicit fixed
architecture aspect recipe and safe census complete or disclose limitations. It
resets on source/repository switch, revision change or connection close.
Ordinary query and normal change-first Refresh never create this entity.

## InventoryItem

Agent interpretation of one Seed group.

- `id`
- `originGroupId`: one active Seed group ID
- `disposition`: `concept | embedded | question | ignored`
- `outputs`: required non-empty list for concept/embedded; each mapping has a
  `candidateId` and, for embedded output, `parentCandidateId`
- `questionPlanId`: required for question
- `reason`: P0 ignored accepts only `duplicate-covered`
- `coveredByItemId`: required for P0 duplicate and must resolve to a non-ignored
  Inventory item whose output will materialize
- `evidenceIds`: exact observations used by concept/embedded/question

Every important Seed group appears exactly once across Inventory items. Question
and Ignored items never enter schema selection.

## QuestionPlan

Private normalized plan reusing the existing SharedQuestion model.

- `id`, `kind`: existing Question kind
- `originGroupId`
- `targetCandidateId`, later resolved `subjectId`
- `property`, `scopeKey`
- candidate/source evidence references including observed revision
- `missingEvidence`, `limitations`

An unbindable uncertainty is converted to a limitation before Receipt freeze.
Every QuestionPlan admitted to a Receipt must materialize at Finalize; missing
subject/source evidence is Incomplete and cannot silently downgrade.

## RepositoryEvidenceSource

Small compatible extension to an existing `sources[]` entry:

- `id`, `resource`: existing fields; `resource` remains `repository://...`
- `observed_revision`: exact 40-hex SourceSnapshot commit

Capability 046 requires `observed_revision` on every Init/Refresh-authored
repository source and validates exact 40-hex form. Source-entry identity is
`resource + observed_revision`: re-observing the same path/span at a newer commit
creates or uses a distinct source ID. Retained claims keep the old ID/revision
until explicitly re-observed; the Repository concept's newest `observed_source`
cannot relabel them.

## DiscoveryInventory

- `seedId`
- InventoryItems
- semantic and Terraform/Terragrunt observations
- QuestionPlans
- bounded run limitations

The Agent may build it locally, but MCP accepts one submitted final Inventory;
lane status and priority come from the active Seed rather than caller input.

## InventoryReceipt

Immutable compact result of guidance validation.

- `id`: `discovery-receipt-<24 hex>`
- `seedDigest`, SourceSnapshot identity, exact Hub profile ID and Published base
- normalized lane results and dispositions
- guidance request/output for concept/embedded candidates
- selected schemas
- materialization expectations for concept, embedded and QuestionPlan items
- ignored counts/reasons and limitations
- `digest`, `createdAt`

Before Prepare it is immutable connection-only state. Prepare first looks up a
persisted session by Receipt ID: an exact request digest returns the same session,
a mismatch rejects, and no persisted match requires the active frozen Receipt.
Session creation is atomic, so a crash cannot leave a half-session. Finalized
and cancelled sessions are terminal; one Receipt cannot create two sessions.

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
- operation: Init for this capability
- affected Repository and bounded summary
- proposal/source revision reference where supported by current grammar

Capability 046 writes Repository activity to `repositories/<slug>/log.md` only.
Later Refresh/correction/Question resolution remain repository-owned; Domain
Enrichment, cross-repository relation/Flow and explicit Domain correction own
Domain logs. Failed or Incomplete runs produce no ActivityEntry.

## State transitions

```text
Preflight → SourceSnapshot
             ↓
Discover → Seed collecting → Seed ready
                              ↓
Investigate → one submitted Inventory
                              ↓ guidance success
                       immutable Receipt
                              ↓ Prepare
                       persisted authoring session
                              ↓ Author/Validate
                     Ready for review | Incomplete
```

Source snapshot drift invalidates discovery. Default-head advance is only a
freshness warning. For Init, any Hub-base advance before Finalize retains
unchanged source/Seed/submitted Inventory, rematches Published identity, issues
a new base-bound Receipt and creates a replacement session; the old session is
rejected and eligible for safe cleanup. Normal Refresh has no Receipt: it keeps
unchanged source/change analysis and reruns existing preparation/guidance on the
new base. Source discovery is not rerun. After Finalize, normal proposal
reconciliation applies.
