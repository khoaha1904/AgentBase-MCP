# 02.08 — Profile 1.0 bootstrap and grouped-home Initial Ingest

> Status: Grouped-home behavior and compact G5-C1 materialization are
> implemented and verified. Earlier type-relative paths are historical context;
> [02.10](10-compact-profile-layout-requirements.md) owns current paths.
>
> Release evidence: Required

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)

Architecture Contracts:
[Ownership](../../architecture/ownership.md),
[Dependencies](../../architecture/dependencies.md),
[Flows](../../architecture/flows.md),
[State and trust](../../architecture/state-and-trust.md), and
[Runtime](../../architecture/runtime.md).

## Current → target

Bootstrap publishes the README, root/shared indexes and Profile declaration;
Hub CI is added through reviewed initialization or upgrade.
Initial Ingest writes global type-first paths and overloads
`confirmed_domain`: it chooses both placement and `part-of` participation.

G4-C2 switches only new empty-Hub bootstrap to the already admitted Profile 1.0
baseline. Profile-aware Initial Ingest accepts one confirmed grouped home plan,
derives Domain Capsule paths and records separately confirmed participation.
The existing `confirmed_domain` input remains an exact compatibility form for
one Domain default with the current Repository/System participation behavior.

## Benefit → impact

New Hubs become authorable in the accepted layout rather than requiring an
immediate migration. One plan avoids per-file prompts, supports genuinely
shared concepts and prevents physical placement from silently asserting Domain
membership.

This is a broad but bounded change across bootstrap, Initial Ingest session
state, skeleton materialization, Batch member use and the additive MCP input
schema. It reuses the existing Profile classifier, Discovery Receipt,
proposal/review lifecycle and deterministic bootstrap receipt. No registry,
database, migration engine or MCP tool rename is added. Refresh, legacy-Hub
migration, profile-aware query/visualization and release profile claims remain
later capabilities.

## Grouped home plan

One `home_plan` contains exact fields:

```yaml
default_home:
  kind: domain
  identity: domains/orders
  title: Orders
exceptions:
  - candidate_id: shared-contract
    home:
      kind: shared
participations:
  - candidate_id: order-service
    domain:
      identity: domains/fulfilment
      title: Fulfilment
```

A home is either exact `{ kind: shared }` or
`{ kind: domain, identity: domains/<slug>, title: <1..120 characters> }`.
There are at most 64 unique candidate exceptions and 64 unique
candidate/Domain participation pairs. The Repository output always uses the
default home; exceptions may target only other materialized concept candidates.
Every reference must resolve to the frozen Discovery Receipt, and one Domain
identity must have one title throughout the plan and current Hub.

Home determines only the physical path. Participation produces an evidenced
`part-of` relation and never changes home. A Domain referenced by home or
participation is reused when its exact Profile identity and title exist, or is
created at `domains/<slug>/index.md` with owner-guidance and source evidence.

## Compatibility and failure

- Profile 1.0 Initial Ingest requires exactly one of `home_plan` or the legacy
  `confirmed_domain`; providing neither or both fails before a session is
  created.
- `confirmed_domain` becomes a Domain-default plan with no home exceptions and
  retains the current Repository plus selected-System `part-of` behavior.
- Unprofiled legacy Initial Ingest retains its current type-first behavior in
  this slice. The later migration/admission capability blocks legacy mutation
  before Group 4 release; no intermediate Group 4 state is released.
- The public `subject_directory` remains accepted as `repositories/<slug>` for
  new Initial Ingest. In a Profile Hub it supplies only the Repository slug;
  the returned session/proposal subject and concept identities use the actual
  home-qualified path.
- Invalid, stale, ambiguous or colliding plans fail before writing a session or
  leave the copied authoring bundle recoverably reset. No Published bytes are
  changed by plan validation or skeleton materialization.

## Requirements

- **AB-HOME-001** — New empty-Hub bootstrap deterministically includes root
  base-OKF `index.md`, `shared/index.md`, the exact Profile 1.0 concept, README
  in one baseline commit, without CI files. Root and shared navigation satisfy
  Profile admission before any remote write; CI uses a later reviewed workflow.
- **AB-HOME-002** — Bootstrap preview, digest, interruption recovery, exact-empty
  remote guard and direct-write authority continue to cover the complete new
  baseline; no second bootstrap mode or profile registry is introduced.
- **AB-HOME-003** — A grouped home plan has one exact default home, at most 64
  unique candidate exceptions and at most 64 unique candidate/Domain
  participation pairs. Home/Domain values, candidate IDs and Domain titles are
  strictly normalized, deterministic and unknown-field rejecting.
- **AB-HOME-004** — A Profile Initial Ingest accepts exactly one confirmed
  `home_plan` or `confirmed_domain`. The legacy form deterministically becomes
  one Domain default and retains current Repository/System participation;
  supplying both, neither or a mutable value outside the frozen Receipt fails
  before session creation.
- **AB-HOME-005** — The Repository uses the default home. Exceptions target only
  other materialized concept candidates from the exact Receipt; embedded,
  ignored, Domain, unknown and duplicate candidates cannot receive an exception.
  Participation additionally requires that candidate's released schema to
  admit an evidenced `part-of` Domain relation.
- **AB-HOME-006** — Profile materialization derives every known-type path from
  home plus the shared Profile category rule, retains deterministic collision
  suffixing within that category and returns the actual Profile identity/path.
  The legacy `repositories/<slug>` subject is only a slug input in this flow.
- **AB-HOME-007** — Every referenced Domain is reused only when its exact
  `domains/<slug>` identity and `domains/<slug>/index.md` type/title match,
  otherwise created with bounded owner-guidance and Repository evidence. Root
  and home indexes resolve every newly materialized concept directly.
- **AB-HOME-008** — Physical home creates no semantic membership. Only explicit
  plan participation creates an evidenced `part-of` relation. Compatibility
  translation is the sole exception and reproduces the previous Repository and
  selected-System relations explicitly.
- **AB-HOME-009** — The normalized home plan and actual home-qualified subject
  are part of session identity and persisted private session state. Exact rerun
  is idempotent; altered plan, Receipt, source or Hub base cannot reuse the
  session.
- **AB-HOME-010** — Finalize and replacement-after-base-advance preserve the
  exact plan, revalidate Profile admission and proposal scope, and retain the
  normal one-repair boundary without mutating Published knowledge on failure.
- **AB-HOME-011** — Batch Initial Ingest can use the legacy Domain-default form
  unchanged and each member may use an exact grouped plan. Member checkpoint,
  atomic composition and same-base checks retain actual home-qualified paths
  without adding shared mutable plan state.
- **AB-HOME-012** — MCP tool names and existing `confirmed_domain` input remain
  valid. `home_plan` is additive and bounded; Refresh rejects it in this slice.
  Compact end-to-end verification activates the separately owned
  `agentbase-okf@1.0` author compatibility declaration. Release manifests keep
  `qualified_scale: null`.

## Implementation and verification map

- `core/knowledge` owns normalized home-plan values, compatibility translation
  inputs and Profile path derivation.
- `app/hub-okf/workspace` renders and verifies the complete bootstrap baseline.
- `app/hub-okf/authoring` binds a plan to one Receipt/session and materializes
  paths, relations and navigation.
- `app/hub-okf/mcp` owns the additive wire schema and legacy adapter.
- Focused core, bootstrap, authoring, Batch and MCP tests own
  `AB-HOME-001..012`; the canonical full verification remains the release gate.

## Deferred boundaries

- Legacy report/migration and the final all-mutation authoring admission gate.
- Profile-aware Refresh rehoming.
- Query, context, semantic-impact and visualization home/participation roles.
- Release Profile compatibility declarations.
- Capacity and real-model benchmarks.
