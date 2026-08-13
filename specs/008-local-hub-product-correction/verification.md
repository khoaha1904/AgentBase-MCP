# Verification: Local-First AgentBase Product Correction

**Date:** 2026-08-13
**Scope:** Corrected application, local Hub lifecycle, schema catalog,
publication/synchronization simulations, completed canonical repository/
launcher migration, installer credential boundary and completed real Hub data
correction lifecycle.

## Canonical offline gate

`npm run verify` passes:

- specification checks: pass, including official product identity and active
  naming guards;
- TypeScript typecheck: pass;
- architecture: 0 errors and 5 visible warnings;
- tests: **232 passed, 0 failed**;
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
- FR-020–025 have installer interaction, private global storage, runtime
  admission and recovery evidence.
- SC-001–005 pass their named end-to-end or real-Git simulations.
- SC-006 passes active naming guards; the remaining historical rebuild-name
  occurrence is explicitly labeled evidence in `docs/handoff.md`.
- SC-007 passes with no unreviewed architecture exception, no metric-driven
  fragments and no real GitHub dependency.
- SC-008 passes every client-selection and credential-lifecycle fixture without
  client-configuration mutation or token disclosure.

## Real qualification and closure

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
- FR-020–025 / SC-008 installer evidence passes. `./install.sh` prepares exact
  dependencies and supports Codex, Claude Code or combined selection while
  reporting registration as deferred and leaving client configurations
  untouched. Masked paste, Backspace, empty skip, Ctrl+C restoration,
  non-interactive operation, XDG/fallback storage, `0700`/`0600` admission,
  symlink/malformed rejection, preserve/explicit-replace and runtime environment
  precedence are covered by 13 new requirement-linked tests.
- A real non-interactive `./install.sh </dev/null` run completed `npm ci`, found
  zero known vulnerabilities, skipped client/token input, wrote no credential
  and reported deferred registration. The canonical gate then passed 232/232
  with 0 architecture errors and the same five visible review warnings.
- Remote rollback: rename `AgentBase-Hub` back to `knowledger-hub`, restore MCP
  canonical origin to `/home/khoa/workspace/AgentBase/agentbase-next`, and
  delete the newly created remote MCP repository only if explicitly authorized.
- T044 and T055 completed on 2026-08-13 after the owner ran the interactive
  installer. Admission inspected only credential path metadata: the global file
  was a regular owner file at mode `0600` under an owner directory at mode
  `0700`; no token bytes were read, logged or passed as a CLI argument.
- The official `submit` action selected the sole dependency-safe pending prefix
  containing proposal `73420160d16893b75470d1f2`. Publication receipt
  `2ad361aa321cf89e3243db4e` records remote base
  `587a91e676104e0cd58889acb938ca2b44a350d2`, deterministic branch
  `agentbase/publish-2ad361aa321cf89e3243db4e`, exact head
  `a86fbb57cdd15090740e6f2445a11c62692d8a92` and
  [AgentBase-Hub PR #4](https://github.com/khoaha1904/AgentBase-Hub/pull/4).
  The receipt is local mode `0600` and contains no credential.
- Independent remote-ref inspection confirmed the publication branch at the
  reviewed proposal commit while remote `main` remained exactly at the admitted
  base. AgentBase-MCP did not merge or write remote `main`.
- The owner merged PR #4. Explicit synchronization `sync-msr3vsov` fetched
  remote head `9fcb2aec8790fcfe31f30354c09ac51a0d65fc92`, recognized proposal
  `73420160d16893b75470d1f2`, found zero remaining proposals/rebased commits and
  atomically advanced local active `main` to that exact head. Local and remote
  tracking refs match, the worktree is clean, pending inventory is empty and a
  local Hub search for `agentbase-next` returns no result.
- T047 completed all quickstart evidence: offline real-Git journeys cover local
  accept, schema selection, batch publication and recovery; real migration
  preflight remained report-only and preserved the dirty legacy Hub; the owner
  completed interactive installation; real publication/synchronization passed;
  and the final canonical gate passed 232/232 tests with 0 architecture errors
  and the same five reviewed warnings.
- Final reconciliation checked FR-001–025, SC-001–008, all 21 acceptance
  scenarios, the seven plan decision groups and all five constitution
  principles. Convergence found no missing, partial, contradictory or
  unrequested implementation work and appended no tasks.
