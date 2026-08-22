# Implementation Plan: Shared Question Documents

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Replace the unpublished private Question JSON ledger and proposal attachment
with one bounded Markdown contract inside the normal Hub tree. Finalize renders
declared Questions before proposal digest/inspection. Hub list/read parse exact
accepted documents. Answer stages one proposal containing a Guidance revision
and the exact Question transition; Accept remains the only accepted-state
mutation.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing standard library, YAML document parser and
Git-backed Hub; no new production dependency

**Storage**: Existing OKF Markdown and Git history under `questions/` and
`guidance/`; no required private Question store

**Testing**: Adapt the existing local-only end-to-end lifecycle case plus focused
governance assertions without exceeding the 50-test canonical gate

**Target Platform**: Local MCP server on supported Node.js hosts

**Project Type**: Modular-monolith MCP server

**Performance Goals**: Synchronous bounded scan of at most the tool's 100
returned Questions; no network/model/source probe for list/read

**Constraints**: Clean cutover, deterministic rendering, exact Hub commit,
64 KiB frontmatter/256 KiB document limits, no accepted mutation before Accept

**Scale/Scope**: One Question per Markdown file; exact-scope Guidance only;
batch resolution and provider enrichment deferred

## Constitution Check

- **Evidence Before Abstraction**: typed references resolve against the exact
  proposal/Hub tree; no universal claim abstraction is introduced.
- **Local-First Explicit Authority**: Question reads are local Git/Markdown only
  and add no credential, network, watcher or model requirement.
- **Agent-Navigable Ownership**: core owns the shared contract; Hub application
  owns lifecycle transitions; MCP adapters only translate interface fields.
- **Cumulative Knowledge**: clean cutover blocks orphan accepted Guidance and
  never silently deletes accepted context.
- **Specification and Verification**: AB-QUESTION-001..005 map to one focused
  contract boundary and the existing end-to-end lifecycle.

No dependency, provider, credential, daemon, irreversible migration or
architecture exception is introduced. Post-design re-check: pass.

## Design Decisions

1. Add one dedicated Question contract in `core/knowledge/governance`; do not
   turn Question into a selectable Concept Schema.
2. Stable ID uses immutable origin fields only. Current subject/property may
   follow reviewed rename without changing ID.
3. Finalize resolves declarations and writes Question files/index into the
   proposal bundle before final validation, inspection and digest.
4. Repeated identical declarations are idempotent; a real document edit advances
   revision exactly once through the dedicated transition function.
5. `list_hub_questions` and internal read use accepted Hub Markdown directly;
   obsolete ledger files are ignored and may be removed as cleanup.
6. Answer reuses the existing Guidance proposal path but expands its allowed
   diff to exactly one Guidance create plus one Question update. No private state
   changes during preparation.
7. Cutover preflight scans accepted Guidance references. An orphan blocks with
   explicit regenerate/migrate direction; unpublished private Questions are not
   migrated.
8. MVP supports exact `subject-property` Guidance only. `needs-review` is valid,
   but automatic conflict inference is deferred.

## Project Structure

```text
src/core/knowledge/governance/
└── questions.ts

src/app/hub-okf/authoring/
├── questions.ts
├── authoring-session.ts
└── guidance-proposal.ts

src/app/hub-okf/review/
├── review-actions.ts
└── accept.ts

src/app/hub-okf/mcp/
└── mcp-tools.ts

src/app/hub-okf/workspace/
└── local-only-e2e.test.ts
```

**Structure Decision**: Extend current ownership boundaries. Remove sidecar and
private-ledger responsibilities rather than add a parallel service.

## Complexity Tracking

No exception. The broad authority change is implemented as a clean replacement
inside existing Markdown/proposal/Git boundaries.
