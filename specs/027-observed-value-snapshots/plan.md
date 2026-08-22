# Implementation Plan: Observed Value Snapshots

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Clean-cut the existing live-claim parser into one repository-only observed-value
contract, reuse its scalar/source-state guards, replace the Hub query action,
and adapt Refresh/Question evidence binding. Do not implement provider or current
source lookup. Keep one focused governance test and existing end-to-end tests.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Dependencies**: Existing standard library and YAML parser; no new dependency

**Storage**: Existing OKF Markdown frontmatter and Git-backed Hub

**Testing**: Replace legacy live-claim cases in the existing 50-test offline gate

## Constitution Check

- Evidence: every value binds one admitted Repository source and exact clean or
  dirty observation state.
- Local-first: ordinary snapshot query performs no source/network operation.
- Ownership: contract stays in `core/knowledge/governance`; query/tool adapters
  stay in `app/hub-okf`; source access remains in the existing graph provider.
- Cumulative knowledge: Refresh omission cannot delete accepted identities.
- Verification: AB-VALUE/AB-QUERY requirements map to focused and lifecycle
  evidence before completion.

No dependency, provider, credential boundary, daemon, migration or architecture
exception is introduced. Post-design check: pass.

## Design Decisions

1. Replace `live-claims.ts` rather than keep an alias or compatibility reader.
2. Repository observation state is the only implemented source variant.
3. The owning concept identity must equal `subject`; new deterministic IDs are
   allocated during pre-Finalize normalization, while Refresh preserves accepted
   IDs. Question input uses natural observation references resolved afterward.
4. One derived `## Observed values` table is generated/validated from structured
   values and never becomes a second authority.
5. `read_hub_observed_values` reads exact Hub bytes only and returns
   `sourceAccess: not-checked`; current-source orchestration stays outside it.
6. Existing private Question storage remains for this slice but binds observed
   values instead of semantic live targets. Shared Question documents are Part 07
   follow-up work.
7. One central reconciliation pass stamps current source truth, merges omitted
   current entries, preserves foreign entries and regenerates the owned Markdown
   section before proposal protection/validation.

## Changed Ownership

- `src/core/knowledge/governance/`: observed-value parser, validation, rendering
  and sensitive guard.
- `src/core/knowledge/proposals/`: observed-value mutable-field handling.
- `src/app/hub-okf/authoring/`: Prepare/Finalize/Refresh/Question adaptation.
- `src/app/hub-okf/query/` and `mcp/`: snapshot-only query action/tool.
- `src/app/codebase-memory-mcp/`: safe tool exposure without implicit source bind.

## Complexity Tracking

No exception. This removes semantic-target resolution metadata and reuses the
existing synchronous parser/query path.
