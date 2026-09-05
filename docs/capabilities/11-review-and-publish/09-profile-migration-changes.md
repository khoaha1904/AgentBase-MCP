# 11.09 — Reviewed Profile migration and mutation admission

> Status: G4-C7 legacy-to-Profile migration/admission and G5-C1 compact
> admission are implemented and verified. G5-C1 remains a qualification-data
> reset rather than another migration mode.
>
> Release evidence: Required

Product Contracts:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md) and
[Knowledge lifecycle](../../product/03-knowledge-lifecycle.md).

Architecture Contracts:
[Flows](../../architecture/flows.md),
[Runtime](../../architecture/runtime.md), and
[State and trust](../../architecture/state-and-trust.md).

## Current → target

Profile validation exists in individual authoring workflows, but an unprofiled
legacy Hub can still reach the common Accept boundary. There is also no
operational, reviewable path for moving real legacy knowledge into Domain
Capsules.

G4-C7 adds one report-first legacy-to-Profile workspace and makes Accept the
final common knowledge-mutation admission gate. Migration never guesses a home:
the owner or authoring agent supplies an exact file-move map, reviews the full
byte and semantic impact, then uses the ordinary Accept, Publish and Sync flow.

## Benefit → impact

All current and future proposal producers inherit one final Profile guarantee,
so a missed workflow-specific check cannot mix legacy and Domain-Capsule
layouts. Real Hub migration is explicit, loss-aware and Git-recoverable without
a converter framework, dual read/write mode, database or application rollback.

The change is medium-sized with moderate migration-validation risk. It adds two
backward-compatible MCP tools and one proposal mode; existing tool inputs stay
unchanged. Normal legacy reads remain available. The owner-authorized Crawler
fixture should still be reset and re-ingested instead of migrated.

The same clean-cutover rule applies to all owner-confirmed disposable Profile
1.0 qualification Hubs during G5-C1 cutover. This migration workflow remains for
real legacy knowledge and does not gain a development-layout converter. An
owner-declared durable Hub is never reset by the qualification-data permission.

## Workflow

```text
legacy Published head with no accepted pending commits
    -> Prepare: read-only report + private editable full-tree workspace
    -> owner/agent assigns homes, moves files and rewrites exact references
    -> Finalize with exact from_path -> to_path declarations
    -> immutable migration manifest + byte/semantic impact + rollback commit
    -> Inspect -> Accept -> one independent PR -> merge -> Sync
    -> normal Profile authoring enabled
```

Prepare and Finalize mutate only private workflow state. Accept creates the
first local Hub commit. The rollback point is the exact migration parent; Git
revert/reset remains an owner operation and application rollback never changes
Hub history.

## Requirements

- **AB-PROFILE-MIGRATE-001** — Prepare accepts only an exact
  `legacy-unprofiled` Published/active head with no accepted pending commit,
  returns its Profile classification, tree digest, bounded file/concept report
  and exact rollback commit, and creates only a private full-tree workspace.
- **AB-PROFILE-MIGRATE-002** — Prepare rejects Profile 1.0, malformed or unknown
  Profile declarations, dirty/advanced authority and unsafe bundle entries. It
  never infers Domain participation, physical home or a file move.
- **AB-PROFILE-MIGRATE-003** — A migration session binds its exact Hub profile,
  checkout, base commit/tree, workspace paths and creation time. Finalize
  rejects changed authority, stale/tampered session state and a base that no
  longer equals both active and Published head.
- **AB-PROFILE-MIGRATE-004** — Finalize requires a normalized, unique, bounded
  `from_path` to `to_path` declaration for every removed base file. Each source
  must exist only in the base and each target only in the proposed tree; no
  undeclared removal or move is admitted.
- **AB-PROFILE-MIGRATE-005** — Every moved concept preserves its concept type.
  A proposed concept without a base identity or declared move may only be the
  exact Profile declaration or an explicit Domain concept needed by a reviewed
  capsule. Existing files modified in place remain visible in the byte and
  semantic impact.
- **AB-PROFILE-MIGRATE-006** — Non-index additions that are neither declared
  move targets nor admitted Profile/Domain concepts fail. Base files retained
  at the same path are never implicitly deleted, and support/non-Markdown files
  may move only with byte-identical content.
- **AB-PROFILE-MIGRATE-007** — The complete proposed tree must pass exact OKF
  0.2, Profile 1.0 layout, navigation, relationship, observed-value, external-
  identity and Hub integrity validation before proposal creation. Missing
  evidence retains knowledge or becomes an authored Question; migration does
  not silently reclassify or delete it.
- **AB-PROFILE-MIGRATE-008** — Finalize writes one immutable migration manifest
  containing base/proposed tree digests, exact move map, added/updated/removed
  paths, Profile transition and rollback commit. Its digest is bound into the
  proposal identity, retained inspection and Git trailer.
- **AB-PROFILE-MIGRATE-009** — Migration uses the ordinary immutable inspection,
  semantic-impact, explicit digest confirmation, Accept transaction, independent
  pull request and synchronization/recovery boundaries. It cannot stack with a
  Repository proposal or use the direct bootstrap exception.
- **AB-PROFILE-MIGRATE-010** — The common Accept boundary recomputes proposal
  bytes, semantic impact and Profile transition immediately before mutation.
  Normal `new`, `refresh`, `batch-new` and `enrichment` proposals require exact
  Profile 1.0 at both base and proposed trees; only `migration` may transition
  `legacy-unprofiled` to Profile 1.0.
- **AB-PROFILE-MIGRATE-011** — A migration may be accepted only when it is the
  sole pending change over Published. While an accepted migration remains
  pending, no later normal proposal may be accepted; normal authoring resumes
  after merge and synchronization remove that migration from pending ancestry.
- **AB-PROFILE-MIGRATE-012** — Legacy read/query diagnostics remain compatible,
  existing MCP tool inputs and outputs do not change, migration tools never
  receive credentials, and capacity/model benchmarks remain deferred with
  `qualified_scale: null`.

## Implementation and verification map

- `app/hub-okf/migration/profile-migration.ts` owns Prepare, session admission,
  exact move accounting and immutable migration proposal construction.
- `app/hub-okf/review/mutation-admission.ts` owns the final common Profile and
  retained migration-manifest admission used by Accept.
- Hub proposal/pending/publication modules carry migration identity through the
  existing Git and PR lifecycle without creating a second state machine.
- Focused tests cover the requirements above; the canonical repository gate is
  run once after implementation. No real-model or capacity benchmark runs.

## Deferred boundaries

- Automatic home inference, identity merge/redirect and lossy conversion.
- Dual reads/writes, multi-version Profile compatibility and background migration.
- Application-driven Hub rollback or automatic PR merge.
- Crawler fixture conversion; reset and re-ingest it under Profile 1.0 instead.
