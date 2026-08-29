# 02 — Hub, Domain and Repository model

> Status: Domain/Repository and Batch Initial Ingest are implemented;
> subproject-scope automation in a monorepo is deferred.

High-level decision:
[How are Hub, Domain and Repository organized?](../../product/02-hub-domains-and-repositories.md)

## Planned decomposition

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — Domain baseline and
  the one-primary-Domain-per-Git-repository decision.
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

## Current implementation delta

Repository primary Domain, owner confirmation, `part-of` validation and explicit
Batch Initial Ingest are implemented. A parent containing multiple repositories
is only grouping/routing scope. The remaining deferred work is automatic use of
a monorepo subproject as a bounded source scope; it adds no registry, database
or subproject identity.
