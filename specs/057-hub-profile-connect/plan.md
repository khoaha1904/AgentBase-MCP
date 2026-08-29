# Implementation Plan: AgentBase CLI Surface and Hub Connect

**Branch**: `main` | **Date**: 2026-08-29 | **Spec**: [spec.md](spec.md)

## Summary

Expose one small AgentBase command surface under `abs`: `status`, `hub connect`
and `hub sync`. Keep the existing lifecycle, OKF authoring, benchmark and
recovery routes available only to skills, MCP clients or internal verification.
Make `hub connect` the one owner flow for selecting a Hub and optionally
replacing one shared owner-private token through a masked terminal prompt.
Blank input reuses the existing token.

## Design decisions

- `abs` is the product command name; OKF remains a data-format term.
- The public surface has three commands only. No public ingest, query, publish,
  proposal, validator or benchmark commands are added in this slice.
- `mcp`, `node src/cli.ts` and old `okf ...` routes remain technical/compatibility
  paths and are omitted from help.
- Existing MCP tool names, Hub identity and authorization boundaries remain
  unchanged. Credential storage is simplified to one shared owner-private
  default token rather than one token per Hub profile.
- A single existing dispatcher is reused; no shell wrapper or second CLI is
  introduced.

## Technical context

**Language/Version**: TypeScript executed directly on Node.js `>=24.12 <25`

**Primary dependencies**: Node.js standard library and existing Hub identity,
credential and attach modules; interactive terminal input.

**Storage**: Existing owner-private credential root and active Hub
configuration; migrate/reuse the existing global token file, with no token in
Hub data or profile metadata.

**Testing**: Node.js test runner with deterministic GitHub-token and Hub-action
doubles, plus existing repository verification.

**Constraints**: No token argument/output/error, GitHub CLI lookup, arbitrary
executable, automatic login, sync during connect, cross-profile knowledge
movement, new dependency, daemon or crash journal.

## Constitution check

- **Evidence before abstraction — pass**: reuse the current dispatcher and
  masked terminal credential writer; no generic credential-provider layer.
- **Local-first explicit authority — pass**: network and credential access occur
  only during explicit `abs hub connect`; local status and MCP query remain local.
- **Agent-navigable ownership — pass**: CLI composes; existing configuration and
  attach modules own persistence and activation.
- **Cumulative knowledge — pass**: command-surface work changes no Hub knowledge.
- **Specification and verification — pass after owner approval**: this spec,
  linked requirements and focused tests precede runtime edits.

## Project structure

```text
src/cli.ts                         # public abs dispatcher plus hidden routes
src/app/hub-okf/cli.ts             # existing Hub orchestration
src/app/hub-okf/cli.test.ts        # focused command and credential tests
package.json                       # bin.abs points at the existing dispatcher
.agents/skills/agentbase-hub/SKILL.md
README.md
```

## Delivery order

1. Lock the public command contract and regression tests.
2. Add `abs` help/dispatch while retaining hidden compatibility routes.
3. Make `hub connect` perform the existing validated attach plus shared-token
   prompt/reuse and rollback boundary.
4. Update skill and README guidance to use only public `abs` commands.
5. Run focused tests, secret checks, spec checks and the full verification gate.

## Complexity tracking

No constitution violation or architecture exception remains.
