# 02 — Hub, Domain and Repository model

> Status: Domain/Repository and Batch Initial Ingest are implemented;
> subproject-scope automation in a monorepo is deferred.

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)

## Contract map

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
- [`06-capability-requirements.md`](06-capability-requirements.md) — normative
  requirement routes for identity, Domain confirmation and batch assignment.

## Current behavior and boundary

Repository primary Domain, owner confirmation, `part-of` validation and explicit
Batch Initial Ingest are implemented. A parent containing multiple repositories
is only grouping/routing scope. The remaining deferred work is automatic use of
a monorepo subproject as a bounded source scope; it adds no registry, database
or subproject identity.
