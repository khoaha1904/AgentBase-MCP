# Verification: Local-First AgentBase Product Correction

**Date:** 2026-08-13
**Scope:** Corrected application, local Hub lifecycle, schema catalog,
publication/synchronization simulations, completed canonical repository/
launcher migration and local Hub data correction. Remote publication remains
the separately authorized T044 checkpoint.

## Canonical offline gate

`npm run verify` passes:

- specification checks: pass, including official product identity and active
  naming guards;
- TypeScript typecheck: pass;
- architecture: 0 errors and 5 visible warnings;
- tests: **219 passed, 0 failed**;
- `git diff --check`: pass;
- no real GitHub request or mutation is required by the gate.

The architecture warnings comprise two exact owner-reviewed cohesive hotspots
and three line-count review signals. `src/app/hub-okf/index.ts` is the
single capability entrypoint; `src/app/hub-okf/runtime-actions.ts` is the Hub
action composition root. Their exact marks record ceilings, reasons and review
conditions. The two forwarding-only public API files briefly introduced to
reduce import counts were removed. `hub-okf/refresh.ts`,
`repository-okf/graph-round.ts` and `providers/codebase-memory/session.ts`
remain ordinary visible line warnings, not baselined exceptions. Refresh stays
cohesive because its protection, validation and lifecycle classification form
one policy; it was not split merely to suppress a review threshold.

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
- FR-015–016 have report-first tooling, completed additive migration and exact
  rollback receipts for T040–T042.
- SC-001–005 pass their named end-to-end or real-Git simulations.
- SC-006 passes active naming guards; the remaining historical rebuild-name
  occurrence is explicitly labeled evidence in `docs/handoff.md`.
- SC-007 passes with no unreviewed architecture exception, no metric-driven
  fragments and no real GitHub dependency.

## Remaining owner checkpoints

- T040 completed on 2026-08-13: source stabilization commit
  `35d4628d902e293273b7ac29f2b015c94c679d81` has correct 2026 author/commit
  timestamps, and `/home/khoa/workspace/AgentBase/AgentBase-MCP` was created as
  a clean independent clone at the same commit. The original development
  worktree remains present and clean. After the migration receipt commit, both
  worktrees were fast-forwarded to
  `638840bd164a407a0e8956b46febf4614aad7f7b`; `npm ci` reported zero known
  vulnerabilities and the canonical clone independently passed the complete
  215-test repository gate.
- T042 completed with owner approval on 2026-08-13. A new private
  `khoaha1904/AgentBase-MCP` repository was created and its `main` initially
  received exact commit `7f1a0bf325785deab5fc3956ad4f85881fcb3bd4`.
  Private `khoaha1904/knowledger-hub` was renamed to
  `khoaha1904/AgentBase-Hub`; five branches and PR #1 open / #2–#3 merged were
  preserved. Canonical MCP `origin` changed from the local development source
  to `git@github.com:khoaha1904/AgentBase-MCP.git`.
- The current Codex host had no MCP entries before cutover. It now has enabled
  STDIO entry `agentbase`, launching canonical `src/cli.ts mcp` with the exact
  canonical working directory and Hub identity/root. It forwards only the
  `AGENTBASE_HUB_GITHUB_TOKEN` variable name; no token value was read or stored.
  Exact launcher rollback is `codex mcp remove agentbase`.
- T041 completed at canonical Hub commit
  `587a91e676104e0cd58889acb938ca2b44a350d2`. The clone is clean, its local
  `main` equals `origin/main`, and its canonical origin is
  `https://github.com/khoaha1904/AgentBase-Hub.git`. The dirty legacy Hub
  worktree was not modified.
- Cutover exposed and verified bug `hub-migration-remote-identity`: raw SSH
  migration input could create a clone rejected by runtime. Migration now
  accepts `owner/name`, derives runtime's canonical HTTPS URL and rejects raw
  URL authority before mutation. The real STDIO query lists 26 tools and
  successfully searches local Hub; the full gate passes 217/217.
- T043 completed locally on 2026-08-13. Proposal
  `73420160d16893b75470d1f2` at diff digest
  `sha256:692f95129aad7b4367f544b9e5b20a5a3310f66b69832b7c74011d27e2a80d95`
  removed only the root link, subject index and mutable AgentBase draft for
  `repositories/agentbase-next`. Inspection was applicable with no conflict or
  prohibited deletion. Acceptance advanced local Hub `main` from
  `587a91e676104e0cd58889acb938ca2b44a350d2` to
  `a86fbb57cdd15090740e6f2445a11c62692d8a92`; the worktree is clean, pending
  inventory contains exactly this proposal, and local search no longer returns
  `agentbase-next`.
- T043 also exposed and fixed `hub-session-persistent-checkout`: finalization
  now admits only the exact configured persistent clone, and whole-subject
  refresh uses Git file semantics while protecting reviewed content and
  unrelated index edits. MCP commit
  `a5407a3ace8ed29d4816e697f9322c1e1505c667` is published on official MCP
  `main`; the complete gate passes 219/219.
- Remote Hub `main` remains exactly
  `587a91e676104e0cd58889acb938ca2b44a350d2`; T043 performed no Hub fetch,
  push, PR or GitHub API action.
- Remote rollback: rename `AgentBase-Hub` back to `knowledger-hub`, restore MCP
  canonical origin to `/home/khoa/workspace/AgentBase/agentbase-next`, and
  delete the newly created remote MCP repository only if explicitly authorized.
- T044 remains: separately authorize publication of the pending Hub correction
  through one PR.
- T047: run the real quickstart/migration journeys and close the active
  capability only after the authorized checkpoints above are complete.
