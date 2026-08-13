# Verification: Local-First AgentBase Product Correction

**Date:** 2026-08-12
**Scope:** Corrected offline application, local Hub lifecycle, schema catalog,
publication/synchronization simulations and additive migration tooling. Real
canonical-directory, GitHub and Hub-data mutations remain unexecuted approval
checkpoints T040–T044.

## Canonical offline gate

`npm run verify` passes:

- specification checks: pass, including official product identity and active
  naming guards;
- TypeScript typecheck: pass;
- architecture: 0 errors and 4 visible warnings;
- tests: **215 passed, 0 failed**;
- `git diff --check`: pass;
- no real GitHub request or mutation is required by the gate.

The architecture warnings comprise two exact owner-reviewed cohesive hotspots
and two unchanged line-count review signals. `src/app/hub-okf/index.ts` is the
single capability entrypoint; `src/app/hub-okf/runtime-actions.ts` is the Hub
action composition root. Their exact marks record ceilings, reasons and review
conditions. The two forwarding-only public API files briefly introduced to
reduce import counts were removed. `repository-okf/graph-round.ts` and
`providers/codebase-memory/session.ts` remain ordinary visible line warnings,
not baselined exceptions.

## Focused evidence

- Local acceptance advances only local Hub `main`, persists exact proposal
  trailers and makes the accepted commit immediately searchable without a
  network action.
- Concrete catalog fixtures cover all initial types; the AWS/server rehearsal
  selects two Lambda concepts, one SQS queue and one server without unused-type
  placeholders.
- Four proposals from three sources publish a dependency-safe prefix as one
  branch/PR while the fourth remains locally pending.
- Real disposable Git journeys cover clean synchronization, conflict retention,
  cancellation, all recovery checkpoints and exact/trailer/patch recognition.
- Migration tests cover dirty-source preservation, credential-redacted reports,
  destination collisions, symlink rejection and independent Git object stores.
- Architecture tests prove import hotspots fail without an exact reviewed mark,
  marked files cannot grow past their recorded metrics and stale marks fail.

## Naming and credential audit

Active naming checks reject the temporary rebuild name, legacy Hub identity and
temporary subject defaults while allowing explicit historical evidence and
migration-source references. The package is officially named `agentbase-mcp`.

Hub token input remains configuration-owned and optional for local-only actions.
Remote clone, publication and synchronization require it at the boundary. MCP
and CLI schemas reject token/remote/target/force/merge overrides; Git and GitHub
tests prove canary values are redacted from bounded output and errors. No real
token was used in verification.

## Requirement reconciliation

- FR-001–014 and FR-017–019 have implementation and offline acceptance evidence.
- FR-015–016 have report-first, additive migration tooling and rollback steps;
  the actual authorized migrations remain T040–T042.
- SC-001–005 pass their named end-to-end or real-Git simulations.
- SC-006 passes active naming guards; the remaining historical rebuild-name
  occurrence is explicitly labeled evidence in `docs/handoff.md`.
- SC-007 passes with no unreviewed architecture exception, no metric-driven
  fragments and no real GitHub dependency.

## Remaining owner checkpoints

- T040–T041: stabilize the source and create canonical local AgentBase-MCP and
  AgentBase-Hub directories without modifying their source worktrees.
- T042: separately approve GitHub identity/remotes and installed MCP cutover.
- T043–T044: locally accept the governed deletion of qualification-only old Hub
  data, then separately approve its publication PR.
- T047: run the real quickstart/migration journeys and close the active
  capability only after the authorized checkpoints above are complete.
