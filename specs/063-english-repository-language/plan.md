# Plan: English repository language

## Baseline

The repository already uses English in source, scripts and specs. The migration
inventory found Vietnamese in 115 current documentation files: 15 product/
capability overviews under `docs/present` and 100 low-level files under
`docs/design`. No Vietnamese source or spec content requires translation.

## Phase 1 — policy and inventory

- Record English as the repository artifact language.
- Record user-language conversation behavior separately.
- Freeze translation exclusions for vendor/generated/immutable evidence.
- Keep the existing paths, requirements, links and code examples unchanged.

## Phase 2 — product and capability overviews

- Translate `docs/present/README.md` and numbered pages 01–14.
- Review scope, authority, user flows, limits and deferred decisions for semantic
  equivalence.
- Commit in small numbered-area batches.

## Phase 3 — low-level capability contracts

- Translate `docs/design/README.md` and areas 01–14 in bounded batches.
- Preserve all `AB-*` requirements exactly.
- Preserve diagrams, code blocks, paths and external citations.
- Do not reinterpret an old decision while translating it.

## Phase 4 — enforcement and convergence

- Scan AgentBase-owned tracked text for Vietnamese-specific characters and
  known Vietnamese prose.
- Add one standard-library repository-language check with explicit exclusions.
- Run spec/link checks, full verification and a final semantic spot review.
- Record the landed commits and close the capability.

## Recovery

Each translated area is a separate commit. If semantic drift is found, revert
or correct only that area; do not reset unrelated user work or rewrite prior
history. Original text remains recoverable from the baseline Git commit.
