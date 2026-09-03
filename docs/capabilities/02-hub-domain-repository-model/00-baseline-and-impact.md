# 02 — Baseline and impact checkpoint

> Status: The current Domain/Repository baseline is implemented; the owner
> reconfirmed the one-repository-one-Domain and workspace-grouping boundary.

## Current high-level decision

- Each repository has exactly one primary Domain.
- A cross-Domain relation does not place a repository in another Domain.
- Every subproject in a monorepo inherits that Domain.
- A parent folder containing independent repositories is only routing/batch
  scope.

## Current baseline

AgentBase has:

- the canonical `domains/<slug>` Domain concept;
- optional `confirmed_domain` with exact identity/title;
- deterministic owner-guidance evidence for user confirmation;
- validation requiring a Repository and current-source System to have
  `part-of → Domain`;
- query-time Domain scope derived through the `part-of` chain;
- a Repository concept and stable source-repository ID independent of
  System/Domain;
- single-repository and Batch Initial Ingest Domain confirmation.

Baseline sources:

- [Confirmed Domain validation](../../../src/core/knowledge/governance/confirmed-domain.ts)
- [Schema catalog](../../../src/core/knowledge/schemas/catalog.ts)
- [Hub prepare MCP input](../../../src/app/hub-okf/mcp/mcp-tools.ts)
- [Hub prepare runtime](../../../src/app/hub-okf/query/runtime-actions.ts)
- [Domain-scoped query graph](../../../src/core/knowledge/query/hub-query-graph.ts)
- [Repository source identity](../../../src/app/repository-okf/evidence/source-state.ts)

## Current gap

The core primary-Domain relation, validation and explicit Batch Initial Ingest
are implemented. A monorepo subfolder still normalizes to its Git root as
defined by the product contract. The remaining deferred work is host automation
that uses a subproject as a bounded query/evidence scope; it does not need a
separate Repository ID or Domain.

## Reusable parts

- Domain identity, owner guidance, System `part-of` validation and query scope.
- Repository concept/source identity and entity-centered graph.
- Existing Hub search to list/match a Domain before prepare.
- Host skill can read bounded README/docs and coordinate a batch; no model SDK
  or Domain-classification service is needed in runtime.

## Current contract

1. Keep the decision that one repository has one primary Domain.
2. Store assignment as an evidenced `Repository part-of → Domain` relation; do
   not create a metadata registry or side database.
3. Initial Ingest requires owner confirmation. Refresh must match the
   Published/Local Draft assignment; a mismatch warns and stops for user repair.
4. The host skill reads bounded root README/docs, searches existing Domains,
   presents candidates/mismatches and calls prepare only after confirmation.
5. Batch uses the same preflight for each repository, confirms one matrix and
   runs the existing bounded Batch Initial Ingest tools.
6. Every subproject in one Git repository **inherits the repository's primary
   Domain**. A subproject is only an evidence/query scope and has no Repository
   ID or Domain assignment of its own.
7. Concepts/relations may still point into another Domain; this does not change
   the repository's primary Domain.

The Repository `part-of` relation lets current Domain query reuse graph
derivation. An existing Repository concept without an edge is added gradually by
Refresh; the Hub is not bulk-migrated. If a concept is protected or
human-authored, the Agent does not edit it automatically; it reports that a
maintainer must perform an explicit reviewed correction and creates no copy.

## Impact

The current decision needs no new runtime model. Primary Domain, validation and
batch already exist. Only subproject-scope automation remains a contained
host-skill change if usage evidence proves it needed. Giving a subproject its own
Domain/Repository identity would be a broad out-of-scope change.

## Decided

Every subproject in a Git repository inherits exactly one primary Domain. A
subproject is only an evidence/query scope; multi-Domain Repository identity is
not part of the first version. Cross-Domain concepts/relations remain allowed
and do not change the repository's primary Domain.

Impact after the decision: **Contained change**.
