# Implementation Plan: Local-First AgentBase Product Correction

**Branch**: `008-local-hub-product-correction` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

**Input**: Product correction in `docs/product/vision.md` and feature specification in `specs/008-local-hub-product-correction/spec.md`.

## Summary

Evolve the current temporary Hub proposal workspace into a persistent local-first
AgentBase-Hub. Preparation remains non-mutating; acceptance creates one
metadata-bearing commit on local Hub `main`; local OKF queries read that active
tree; a pending queue exposes accepted commits; publication pushes a selected
contiguous prefix as one PR; synchronization fetches remote `main`, recognizes
published proposals and transactionally rebases the remainder. Replace the
generic producer catalog with a versioned concrete-schema catalog selected from
Code Graph and related evidence. Finish with reversible canonical repository
and remote naming migrations to AgentBase-MCP and AgentBase-Hub.
Add an honest first installer slice that prepares repository dependencies,
captures a future Codex/Claude Code selection without configuring either
client, and stores one optional Hub token in a private global file consumed by
the current runtime.

## Technical Context

**Language/Version**: Node.js `>=24.12 <25` with directly executed erasable TypeScript

**Primary Dependencies**: Existing exact MCP SDKs, `codebase-memory-mcp@0.10.1`, `yaml@2.9.0`, system Git through the existing bounded process adapter, GitHub REST through the existing provider

**Storage**: Owner-private local Git clone for active Hub; atomic AgentBase runtime receipts outside Hub; Google OKF Markdown and Git commit metadata inside shared history

**Testing**: `node:test`, disposable local bare Git repositories, fake GitHub API, focused capability tests and `npm run verify`

**Target Platform**: Current Linux/macOS-compatible local MCP runtime assumptions; no daemon or watcher added

**Project Type**: Modular-monolith MCP application plus separately configured data-only Git repository

**Performance Goals**: Local pending/list/read operations remain bounded by the selected Hub paths and complete without network; no repository-scale latency claim until measured

**Constraints**: Preserve dirty legacy worktrees; no force push, direct remote-main write, implicit merge, raw graph publication, repository-local secret persistence, silent reset or semantic conflict auto-resolution; global credential writes are explicit, atomic and owner-private

**Scale/Scope**: One owned local Hub clone, ordered proposal commits from many source repositories, one publication transaction at a time, concrete software/AWS schema baseline

## Constitution Check

### Pre-design gate

- **Evidence Before Abstraction — PASS**: current real Hub qualification, merged history, user correction and legacy schema estate provide bounded evidence. No claim is made that the first concrete catalog is universal.
- **Local-First Explicit Authority — PASS**: local accept/query requires no network; publication, remote rename and MCP installation are separate explicit actions.
- **Agent-Navigable Ownership — PASS**: reuse `core/hub`, `core/knowledge`, `app/hub-okf` and `providers/github-hub`; add no generic utility area.
- **Cumulative Knowledge Without Implicit Destruction — PASS**: local commits are immutable proposal records; sync preserves pending work and conflicts fail closed.
- **Specification and Deterministic Verification — PASS**: capability 008 is active, uses stable IDs and requires offline success/failure/recovery evidence.

### Post-design gate

PASS with no exception. The design changes lifecycle and migration boundaries but adds no dependency, daemon, provider or architecture exemption. External remote renames and installation changes remain owner-approved operational tasks after offline implementation passes.

## Product corrections that precede implementation

The authoritative product definition is now `docs/product/vision.md`. During
implementation, update current living requirements and user documentation to
remove these superseded assumptions from Capability 007:

- proposal state is only a temporary runtime tree;
- commit creation happens only during remote submit;
- one proposal always maps to one PR;
- the generic 11-type catalog is the target vocabulary;
- AgentBase Hub is only a remote publication repository;
- `agentbase-next` is an acceptable default product or subject identity.

Capability 007 remains historical evidence. Its safety primitives are reused;
its observable lifecycle is superseded through new living requirement IDs.

## Project Structure

### Documentation for this feature

```text
specs/008-local-hub-product-correction/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── mcp-tools.md
│   ├── local-hub-git.md
│   ├── installer.md
│   └── repository-migration.md
├── checklists/
│   ├── requirements.md
│   ├── installer-security.md
│   └── lifecycle-migration.md
└── tasks.md
```

### AgentBase-MCP source ownership

```text
src/core/hub/
  local-state.ts          # admitted remote base, proposal ancestry, publication/sync states
  proposal.ts             # provider-neutral proposal identity and transitions

src/core/knowledge/
  schema-catalog.ts       # versioned concrete OKF producer schemas
  hub-query.ts            # provider-neutral local OKF search/read contract

src/providers/github-hub/
  git-process.ts          # existing bounded Git subprocess boundary
  github-api.ts           # existing exact ref/PR boundary

src/app/hub-okf/
  credential-file.ts      # exact global token-file admission for runtime
  local-hub.ts            # persistent clone admission and clean-tree guard
  accept.ts               # exact reviewed tree -> local main proposal commit
  pending.ts              # ancestry-derived pending proposal inventory
  query.ts                # query admitted local active tree
  publish.ts              # selected contiguous prefix -> one branch/PR
  synchronize.ts          # fetch, recognize, rebase and recover
  runtime-actions.ts      # configured MCP action composition
  mcp-tools.ts            # explicit tool contracts

scripts/
  migrate-product-repositories.mjs  # preflight/report and explicitly approved canonical copy/clone
  install.mjs                       # testable interaction and global credential writer

install.sh                          # stable user entrypoint into the installer
```

**Structure Decision**: Preserve the modular monolith and existing capability
owners. `core/hub` owns Git-independent state rules; `core/knowledge` owns OKF
schema/query policy; `providers/github-hub` remains the only Git/GitHub process
boundary; `app/hub-okf` composes local lifecycle. Repository-directory migration
is an explicit script because it affects workspace paths rather than runtime
knowledge behavior.

The root installer is a thin stable entrypoint; interaction and filesystem
policy live in one testable Node script. Runtime credential admission stays in
`app/hub-okf` because only remote Hub actions consume the token. No new
dependency, daemon or client-specific provider is introduced.

## Implementation phases

### Phase A — Product and naming baseline

1. Update living specs, README, architecture, handoff and MCP skill language to
   official `AgentBase-MCP` / `AgentBase-Hub` names.
2. Add checks rejecting accidental active product identity `agentbase-next` or
   `knowledger-hub`, while allowing historical references and explicitly named
   source repositories.
3. Correct AgentBase-Hub data through a governed proposal that removes the
   qualification-only `repositories/agentbase-next` draft. Do not replace it
   with AgentBase-MCP documentation unless the user explicitly builds that OKF.

### Phase B — Concrete schema catalog 2.0

1. Introduce common reusable schema rules that are not emitted as concept types.
2. Add the concrete baseline in FR-007 with evidence signals, required and
   optional fields, body guidance and relationship targets.
3. Rank schema matches by specificity: a specific AWS or software type wins
   over a generic fallback when admitted evidence supports it.
4. Keep selection advisory to the coding agent and validate authored concrete
   concepts without creating placeholders.
5. Preserve unknown Google OKF types and existing extension fields.

### Phase C — Persistent local accept and query

1. Admit one persistent local Hub clone, exact remote and exact remote-main base.
2. Keep prepare/finalize/inspect workspaces from 007, but make `accept` the next
   explicit action instead of remote submit.
3. On accept, require a clean admitted local Hub, exact reviewed digest and
   current parent; commit the full reviewed tree to local `main` with stable
   proposal trailers and atomic external receipt.
4. Derive pending proposals from first-parent ancestry plus admitted metadata;
   do not trust an editable queue file as canonical history.
5. Add bounded local OKF list/search/read tools. Coding-agent guidance routes
   code questions to Code Graph tools and business/system questions to Hub tools;
   no opaque automatic intent classifier is required.

### Phase D — Batch publication

1. List pending commits with stable proposal ID, subject, source identity,
   parent, commit and diff summary.
2. Accept a selected contiguous prefix of pending commits. This is the initial
   dependency-safe selection rule; arbitrary non-contiguous cherry-picking is
   deferred.
3. Verify remote base and exact local ancestry, then push the last selected
   commit to one deterministic publication branch and open one PR.
4. Store publication receipt outside credentials; retries reuse exact branch,
   commits and PR. A PR closed without merge leaves proposals pending and
   requires an explicit replacement publication; publication failure does not
   change local active knowledge.

### Phase E — Synchronization and recovery

1. Fetch remote `main` into an admitted remote-tracking ref without mutating
   local `main`.
2. Recognize published proposals through proposal commit trailers and exact
   patch/tree identities, covering merge commits and explicitly admitted
   cherry-pick-equivalent history; ambiguous partial equivalence remains pending
   and fails visibly rather than being guessed.
3. Build a transaction manifest before rebasing remaining pending proposals
   onto the new remote base.
4. Fast-forward or rebase in an owned temporary worktree, validate the complete
   OKF bundle, then atomically advance local `main`.
5. On conflict or interruption, retain the original local ref, remote ref,
   transaction manifest and exact recovery command. Never use reset/force as
   automatic recovery.

### Phase F — Canonical repository migration

1. Preflight both current repositories: exact HEAD, dirty state, remotes,
   configured MCP path and destination collisions. Produce a report before any
   copy/clone.
2. Stabilize AgentBase-MCP history in the existing development repository, then
   create `/home/khoa/workspace/AgentBase/AgentBase-MCP` through a history-
   preserving local clone/copy that does not share mutable Git object storage.
3. Create `/home/khoa/workspace/AgentBase/AgentBase-Hub` as a fresh clone of the
   admitted Hub remote. Do not use or clean the dirty legacy `agentbase-hub`
   worktree.
4. Verify both canonical directories independently before changing any launcher
   or MCP registration.
5. With separate owner approval, rename/create the GitHub repositories to the
   official names, update exact remotes and reinstall/repoint MCP configuration.
6. Keep old directories and old remote redirect available through a documented
   rollback window. Deletion is a later explicit cleanup, not part of migration.

### Phase G — Honest installer and global credential

1. Add a root `install.sh` entrypoint that runs the repository-owned installer.
2. Present a terminal multi-selection for Codex, Claude Code or both. Retain the
   selection only for the completion summary and label client registration as deferred.
3. Prepare repository dependencies, then prompt interactively for the Hub token
   with one visible `*` per accepted character. Empty Enter selects local-only
   operation; non-interactive execution never prompts.
4. Write only `AGENTBASE_HUB_GITHUB_TOKEN` to the XDG/fallback global credential
   file through an atomic `0700` directory / `0600` file transition. Preserve an
   existing file unless `--replace-token` is explicit.
5. Load that exact file at the Hub runtime boundary only when the process
   environment lacks a token. Reject symlinks, unsafe modes, unknown fields and
   malformed bytes without echoing content.
6. Prove client config non-mutation, masked paste/skip/interruption behavior,
   credential preservation/replacement, precedence and runtime consumption with
   offline `node:test` fixtures.

## Rollback boundaries

- **Before local accept**: remove only owned proposal workspace; Hub unchanged.
- **After local accept**: proposal remains a normal local commit; user can
  supersede it through another proposal, not hidden reset.
- **After push before PR**: recover exact branch/commit and open the same PR.
- **During sync**: original local-main ref remains untouched until the candidate
  rebased tree validates; recovery resumes from manifest.
- **During filesystem migration**: canonical destinations are additive; original
  worktrees remain the rollback source.
- **During GitHub rename/config migration**: record old/new remote identity and
  launcher configuration before mutation; revert those exact settings if the
  canonical installation fails qualification.
- **During credential setup**: a failed first write leaves no credential; a
  failed explicit replacement preserves the previous file. Client
  configurations remain outside the mutation set for this slice.

## Complexity Tracking

No constitution violation or architecture exception is requested. The added
local lifecycle files split distinct responsibilities that already exist in the
product contract; they do not introduce a service, daemon or new dependency.
The owner explicitly approved global token persistence and masked length
feedback. The design bounds both behaviors to one exact credential and retains
environment precedence; actual client registration remains deferred.
