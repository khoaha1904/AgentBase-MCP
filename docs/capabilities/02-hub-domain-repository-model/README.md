# 02 — Hub, Domain and Repository model

> Status: Domain/Repository, Batch Initial Ingest and G4-C1 through G4-C7 are
> implemented and verified, including Profile 1.0 admission, grouped homes,
> lifecycle/query/visualization projection, semantic impact, Profile-aware
> Enrichment, reviewed migration and final common mutation admission.
> G5-C1 compact Profile 1.0 is implemented and verified and supersedes the
> type-relative development layout. G5-C2
> semantic quality is deferred and inactive.
> Subproject-scope automation remains deferred.

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — Domain baseline and
  the one-physical-home/multi-participation decision.
- [`01-core-entities.md`](01-core-entities.md) — Hub, Domain, Repository and
  ownership boundaries.
- [`02-domain-confirmation.md`](02-domain-confirmation.md) — read README/docs,
  propose, warn and confirm a Domain.
- [`03-batch-domain-assignment.md`](03-batch-domain-assignment.md) — assign a
  Domain to a batch and handle unusual repositories.
- [`04-monorepo-scopes.md`](04-monorepo-scopes.md) — Git-root identity and
  subproject evidence scope.
- [`05-cross-domain-navigation.md`](05-cross-domain-navigation.md) — link to
  another Domain without changing repository ownership.
- [`06-capability-requirements.md`](06-capability-requirements.md) — normative
  requirement routes for identity, Domain confirmation and batch assignment.
- [`07-profile-layout-requirements.md`](07-profile-layout-requirements.md) —
  Profile 1.0 declaration, Domain Capsule layout and admission requirements.
- [`08-profile-bootstrap-home-plan-requirements.md`](08-profile-bootstrap-home-plan-requirements.md)
  — Profile 1.0 bootstrap and grouped-home Initial Ingest requirements.
- [`09-profile-refresh-guidance-requirements.md`](09-profile-refresh-guidance-requirements.md)
  — Profile Repository Refresh and Question/Guidance requirements.
- [`10-compact-profile-layout-requirements.md`](10-compact-profile-layout-requirements.md)
  — implemented compact Profile 1.0 layout, Repository dossier and clean-cutover
  requirements.

## Current behavior and boundary

Repository source identity, owner-confirmed physical home, explicit `part-of`
participation and Batch Initial Ingest are implemented. A parent containing
multiple repositories is only grouping/routing scope. The remaining deferred
work is automatic use of a monorepo subproject as a bounded source scope; it adds
no registry, database or subproject identity.

G4-C1 provides the reusable Profile/Layout admission boundary. G4-C2 switches
new bootstrap and Initial Ingest to that admitted layout with one bounded
grouped plan and a compatibility adapter. G4-C3 makes Repository Refresh and
Question guidance preserve the existing Profile home. G4-C4 gives query and
visualization one home/participation/boundary projection, and G4-C5 gives
proposal review the same home-versus-semantic-scope distinction. G4-C6 makes
Enrichment preserve Profile identities and homes. G4-C7 reviewed migration and
final common mutation admission close the Profile transition without a second
lifecycle or inferred home placement. G5-C1 now owns the implemented compact
layout; the G4 type-relative paths remain historical development context only.
