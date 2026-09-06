# 02 — Baseline and impact checkpoint

> Status: Group 4 physical-home versus semantic-participation behavior is
> implemented. Group 5 compact Profile 1.0 is implemented and verified as a
> broad pre-release correction.

## Current high-level decision

- Every Repository and concept has one physical Domain or `shared` home.
- A Repository or concept may have evidenced participation in several Domains.
- Home controls stewardship/default navigation; only relations express semantic
  participation.
- A parent folder containing independent repositories is only routing/batch
  scope, and a monorepo child remains evidence/query scope rather than a new
  Repository identity.

## Implemented baseline

AgentBase already has:

- stable Domain selectors, Repository source identity and owner-confirmed grouped
  home plans;
- Profile 1.0 classification with Domain/`shared` homes;
- explicit `part-of` participation independent from home;
- Initial Ingest, Refresh, Batch, Enrichment, query, visualization, semantic
  impact and migration consumers of that classification; and
- exact proposal/Accept/Publish recovery around path changes.

Baseline sources:

- [Profile classifier](../../../src/core/knowledge/documents/agentbase-profile.ts)
- [Grouped home plan](../../../src/core/knowledge/governance/initial-ingest-home-plan.ts)
- [Hub authoring](../../../src/app/hub-okf/authoring/initial-ingest-skeleton.ts)
- [Domain-scoped query graph](../../../src/core/knowledge/query/hub-query-graph.ts)
- [Repository source identity](../../../src/app/repository-okf/evidence/source-state.ts)

## Accepted gap and target

The implemented Profile development layout still stores Domain separately in
`domain.md`, creates type-relative directories and writes Repository/Domain
activity logs. That shape encourages thin concept files and misleading
Repository directories. G5-C1 replaces it with the compact layout and dossier
rules in [02.10](10-compact-profile-layout-requirements.md).

The target retains one home, multi-Domain participation, grouped home
confirmation, stable Repository lineage and Domain extraction boundaries. It
changes only how a home stores useful reading units: Domain `index.md`, rich
Repository dossiers, type-neutral `knowledge/`, lifecycle `questions/` and no
Published activity logs.

Automatic monorepo-subproject scope remains deferred and requires no additional
identity or registry.

## Reuse and impact

Reuse Profile/home values, owner guidance, relations, source identity, proposal
state, Git publication and every cross-home authority rule. Replace path
classification, skeletons/navigation and all path consumers atomically.

Impact is **Broad change**, accepted by the owner: concept paths/identities,
validation, authoring, query, impact, visualization, Question/Guidance placement
and release declarations change. Existing qualification Hubs are disposable and
may be reset/re-ingested; no owner-declared durable Hub may be deleted or
silently migrated. No model service, database, home registry or second
publication lifecycle is added.
