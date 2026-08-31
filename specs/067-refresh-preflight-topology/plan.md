# Implementation Plan: Refresh preflight topology

**Branch**: `feature/refresh-change-accounting` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

## Summary

Reuse the existing authoring session and changed-set validator. Add optional
session-bound validation, share the source and structural checks with Finalize,
and teach Refresh to supply the session ID. Add no new tool or persistence.

## Upstream Contracts

- **Product Contract**: `docs/product/07-ai-sdlc-context.md`.
- **Architecture Contract**: `docs/architecture/flows.md`.
- **Capability Contract**: Knowledge Entry, Refresh, and Review requirements
  named in `spec.md`.
- **Affected Requirements**: `AB-SCHEMA-056`, `AB-REFRESH-017..018`.
- **Baseline Commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.

## Technical Context

**Language/Version**: TypeScript on Node.js 24.12

**Dependencies**: existing OKF parser, relationship validator and authoring
session; no new package

**State**: existing private prepared session only; no migration or new store

**Testing**: focused Node tests, deterministic projection test and `npm run verify`

## Implementation Decisions

| Concern | Choice | Reason |
|---|---|---|
| MCP surface | Optional `session_id` on `validate_okf_changes` | Keeps 44 tools and standalone compatibility |
| Validation ownership | One authoring helper reused by session validation and Finalize | Prevents rule drift |
| Topology gate | New known concepts must structurally reach Repository or Domain | Smallest invariant that keeps promoted nodes usable |
| Recovery | Return validation failure before Finalize; workspace remains editable | Preserves the workflow's one Finalize call |

## Validation Mapping

| Requirement | Evidence |
|---|---|
| `AB-SCHEMA-056` | MCP schema/call test plus session-bound source-ID regression |
| `AB-REFRESH-017` | Refresh skill assertion and one-Finalize C1 trace |
| `AB-REFRESH-018` | unanchored/anchored Resource tests plus Domain projection |

## Complexity Tracking

No dependency, daemon, schema migration, second tool or projection change.
