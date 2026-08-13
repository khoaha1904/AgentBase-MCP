# Implementation Plan: Lazy Hub Configuration and Bootstrap

**Branch**: `009-lazy-hub-bootstrap` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-lazy-hub-bootstrap/spec.md`

## Summary

Make Hub authority optional and lazily configured. The MCP server always exposes
Hub status/setup tools, while graph tools remain independent. An existing Hub
is cloned and atomically admitted from an exact GitHub URL; a new Hub is created
locally with one classified base commit and no remote. First publication attaches
a user-created empty GitHub repository and transactionally executes either an
all-history bootstrap to `main` or base-only bootstrap followed by the existing
deterministic knowledge PR lifecycle.

## Technical Context

**Language/Version**: Node.js `>=24.12 <25` with directly executed erasable TypeScript

**Primary Dependencies**: Existing exact MCP SDKs, system Git through the bounded Git adapter and existing GitHub REST adapter; no new dependency

**Storage**: One atomic owner-private global `hub.json`, one owner-private data-root Hub clone/repository, existing local proposal/publication state and a new bootstrap receipt

**Testing**: `node:test`, disposable local/bare Git repositories, fake GitHub HTTP, focused capability tests and `npm run verify`

**Target Platform**: Current Linux/macOS-compatible local MCP runtime assumptions; no daemon or watcher

**Project Type**: Modular-monolith MCP application plus a separately managed data-only Git repository

**Performance Goals**: Hub status and local-only setup are bounded local operations; Code Graph startup performs zero Hub I/O; no network-latency claim

**Constraints**: No GitHub repository creation, automatic Hub switching, token in arguments/config/receipts, populated-remote bootstrap, force push, implicit mode choice, knowledge regeneration, metric-driven fragmentation or remote-main write outside the exact first-bootstrap contract

**Scale/Scope**: One optional active Hub, one base commit, ordered local proposal commits, one bootstrap transaction and at most one initial knowledge PR

## Constitution Check

### Pre-design gate

- **Evidence Before Abstraction — PASS**: the implemented local-main/pending/PR/sync lifecycle and the owner's concrete `B0 -> K1 -> K2` flow are bounded evidence; no multi-Hub or arbitrary-host abstraction is added.
- **Local-First Explicit Authority — PASS**: graph and local-only Hub work require no network; attach/bootstrap are explicit user actions and bootstrap mode is never inferred.
- **Agent-Navigable Ownership — PASS**: optional configuration, local initialization and bootstrap remain distinct named responsibilities inside the existing `app/hub-okf` capability; core/provider direction remains unchanged.
- **Cumulative Knowledge Without Implicit Destruction — PASS**: base and proposal commits retain exact identities; bootstrap publishes existing commits without regeneration or deletion.
- **Specification and Deterministic Verification — PASS**: Capability 009 is active, uses stable `AB-HUB-SETUP-*` IDs and requires offline success/failure/recovery evidence.

### Post-design gate

PASS. No new dependency, provider, daemon, model, architecture exception or broad permission store is introduced. The only remote-main exception is the owner-approved, empty-repository, first-bootstrap transaction with exact recovery receipts.

## Project Structure

### Documentation (this feature)

```text
specs/009-lazy-hub-bootstrap/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── hub-configuration.md
│   └── hub-bootstrap.md
├── checklists/
│   ├── requirements.md
│   └── bootstrap-safety.md
└── tasks.md
```

### Source Code (repository root)

```text
src/core/hub/
  local-state.ts             # optional remote authority + exact base identity
  proposal.ts                # base/knowledge commit classification contracts

src/providers/github-hub/
  git-process.ts             # bounded empty-remote/ref operations
  github-api.ts              # repository/PR identity and permission categories

src/app/hub-okf/
  configuration.ts           # optional configuration union and legacy env admission
  configuration-file.ts      # atomic global non-secret Hub configuration
  setup.ts                    # status, existing attach and local-only initialization
  local-hub.ts               # admit local-only or remote Hub without fake identity
  bootstrap.ts               # first remote bootstrap transaction/recovery
  runtime-actions.ts         # per-call lazy configuration composition
  mcp-tools.ts               # status/configure/bootstrap agent actions
  cli.ts                     # equivalent explicit CLI actions

scripts/check-specs.mjs      # living requirement route/ID enforcement
docs/specs/agentbase-hub.md  # current accepted product contract
README.md                    # user flow and permission recovery
```

**Structure Decision**: Preserve the existing Hub capability. Add three files
only because configuration persistence, local setup and remote bootstrap have
distinct state machines and reasons to change. Do not split the cohesive MCP
tool registry or runtime composition merely to reduce current warnings; review
and update exact baselines only if their measured ceiling genuinely grows.

## Design Phases

### Phase A — Optional global authority

1. Model `unconfigured`, `local-only` and `remote` states with one stable local
   Hub ID and exact base commit.
2. Persist non-secret configuration atomically under the existing global
   owner-private configuration boundary. Process environment remains a legacy
   compatibility input, not an installation prerequisite.
3. Construct Hub actions even when unconfigured and reload configuration per
   call so setup takes effect without restarting the MCP session.

### Phase B — Lazy setup

1. Expose status and configure actions with `existing`/`new` modes.
2. Parse only exact credential-free `https://github.com/<owner>/<repo>[.git]`
   URLs.
3. Clone existing Hubs into a staging directory, validate canonical remote,
   clean `main`, base content and ownership, then atomically rename/admit.
4. Initialize a new local Git repository with private storage, README, OKF v0.2
   root index and one base-classified commit. Persist only after the commit is
   admitted.

### Phase C — Local-only OKF

1. Extend local Hub state and authoring proposal identity with a stable local
   Hub ID and optional remote identity.
2. Treat the base commit as the pending ancestry baseline for local-only Hubs.
3. Keep publish/synchronize unavailable without remote authority while prepare,
   finalize, accept, query and pending continue normally.

### Phase D — First bootstrap and recovery

1. Build an immutable bootstrap intent from the supplied repository URL, exact
   base, active head, ordered proposal commits and explicit mode.
2. Prove the target has no refs before the first push. Add canonical `origin`
   only inside the serialized bootstrap transaction.
3. For `all-to-main`, push exact active head once, fetch/admit it and persist the
   remote configuration with zero pending proposals.
4. For `base-to-main-knowledge-pr`, push exact base once, persist/admit the
   remote configuration, then reuse batch publication for the complete pending
   prefix. Zero knowledge commits complete without a branch/PR.
5. Checkpoint intent, main push, configuration admission and PR completion so
   retry accepts only exact already-created refs and never pushes a changed
   `main` twice.

### Phase E — Product surface and qualification

1. Add MCP/CLI status, configure and bootstrap contracts without token, force,
   target, repository-creation or switching controls.
2. Update living specs/README/handoff and enforce requirement IDs.
3. Run focused state/setup/bootstrap/recovery/permission suites, architecture
   review and the canonical gate. Real GitHub bootstrap remains separately
   authorized and is not needed for completion.

## Rollback Boundaries

- **Before setup admission**: remove only owned staging state; no active config.
- **After local base commit**: the local-only Hub is valid and recoverable even
  if configuration persistence must be retried.
- **Before bootstrap main push**: remote remains empty; local history unchanged.
- **After main push**: exact receipt plus remote ref permits configuration/PR
  completion without another changed-main push.
- **After base-only bootstrap before PR**: remote `main` contains only base;
  local knowledge remains active and recoverable as pending commits.
- **Permission failure**: preserve configuration, receipt, local refs and token
  bytes; retry only after the user updates global token access.

## Complexity Tracking

No constitution violation is requested. The owner explicitly approved the one
direct-main bootstrap exception for a user-created empty repository. It is
bounded by exact URL/ref admission, an explicit mode, serialized mutation and a
non-secret recovery receipt; normal publication still uses PRs.
