# Feature Specification: Readable Hub README

**Feature Branch**: `036-readable-hub-readme`

**Created**: 2026-08-23

**Status**: Complete

**Input**: Make the standard Hub README useful to a new human reader and update
the already-initialized production Hub through a new PR.

## User Scenario

As a person opening AgentBase-Hub on GitHub, I can understand what created it,
what it stores, where to start, how it is organized and how changes are reviewed
without mistaking README for the canonical knowledge index.

## Requirements

- **FR-001**: The standard README MUST link AgentBase-MCP and use a portable
  relative link for its own Hub repository root.
- **FR-002**: It MUST direct readers to `index.md` as the canonical entrypoint.
- **FR-003**: It MUST explain the knowledge/evidence boundary, representative
  layout, reviewed publication lifecycle and CI without duplicating the catalog.
- **FR-004**: New Hubs and missing-README initialization MUST share the exact
  renderer; an existing README MUST still never be overwritten automatically.
- **FR-005**: The production update MUST be a new README-only PR based on exact
  remote `main` and created with MCP's dedicated Hub token.

## Success Criteria

- The renderer has focused assertions for the MCP link, index link and
  not-a-source-copy boundary while the canonical test inventory remains 50.
- The real PR changes only `README.md` and Hub CI succeeds.
