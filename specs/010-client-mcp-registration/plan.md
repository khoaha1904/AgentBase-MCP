# Implementation Plan: Client MCP Registration

**Branch**: `010-client-mcp-registration` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-client-mcp-registration/spec.md`

## Summary

Turn the existing interactive multi-select installer into a real user-scope MCP
registrar for Codex and Claude Code. Keep terminal/token orchestration in the
existing installer and add one cohesive client-registration transaction owner.
That owner resolves exact supported client executables, compares normalized
provider-owned entries, preflights the complete selection, invokes official
client management commands without a shell, verifies every result and records
enough private non-secret state to roll back or resume an interrupted add.

## Technical Context

**Language/Version**: Node.js `>=24.12 <25` plus the existing Bash launcher

**Primary Dependencies**: Node standard library and the installed official Codex/Claude Code CLIs; no new package dependency

**Storage**: Existing optional token file plus one owner-private atomic `install-registration.json` recovery receipt and short-lived owner-private configuration snapshots

**Testing**: `node:test`, fake executable client CLIs, isolated HOME/XDG roots, focused installer tests and `npm run verify`

**Target Platform**: Local Linux/macOS-compatible terminal environment supported by the existing installer; Windows-native shell support is not introduced

**Project Type**: Modular-monolith local MCP application with a repository-root installation workflow

**Performance Goals**: One bounded preflight/add/get/remove sequence per selected client; no startup or network performance claim

**Constraints**: User scope only; exact entry name; absolute admitted checkout/runtime; no shell interpolation; no entry overwrite; no token in client config or receipt; no real client mutation in canonical verification; all-selected rollback; no metric-driven file fragmentation

**Scale/Scope**: Two client adapters, at most two selected clients, one current checkout and one recoverable registration transaction

## Constitution Check

### Pre-design gate

- **Evidence Before Abstraction — PASS**: current official product documentation and the installed CLI help establish the two concrete management surfaces. Only Codex and Claude Code are modeled; there is no generic speculative client plugin layer.
- **Local-First Explicit Authority — PASS**: the owner explicitly accepted machine user-scope mutation for selected clients. Selection is interactive, preflighted and reversible; non-interactive runs remain mutation-free.
- **Agent-Navigable Ownership — PASS**: terminal/dependency/token flow stays in `scripts/install.mjs`; client inspection and transaction recovery have one distinct owner in `scripts/client-registration.mjs` with colocated focused tests.
- **Cumulative Knowledge Without Implicit Destruction — PASS**: the feature does not touch Code Graph or Hub knowledge. Existing matching/conflicting/unrelated client state is preserved, and rollback owns only entries added by its transaction.
- **Specification and Deterministic Verification — PASS**: Capability 010 is active with stable `AB-INSTALL-007..017` IDs and offline success/failure/recovery evidence.

### Post-design gate

PASS. No dependency, daemon, model, network authority, Hub selection or broad
configuration writer is added. Provider-specific command shapes remain data in
one cohesive registration owner because they implement the same exact lifecycle
and share transaction invariants; further file splitting would create forwarding
fragments rather than independently evolving capabilities.

## Project Structure

### Documentation (this feature)

```text
specs/010-client-mcp-registration/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── client-registration.md
├── checklists/
│   ├── requirements.md
│   └── registration-safety.md
└── tasks.md
```

### Source Code (repository root)

```text
install.sh                         # stable shell entrypoint
scripts/
├── install.mjs                    # dependency, selection, token and result presentation
├── install.test.mjs               # complete interactive/non-interactive journeys
├── client-registration.mjs        # concrete adapters + preflight/transaction/recovery
└── client-registration.test.mjs   # isolated provider and recovery scenarios

docs/specs/installation.md         # current accepted installation contract
scripts/check-specs.mjs            # living AB-INSTALL ID coverage
README.md                           # supported install and conflict/recovery guidance
docs/handoff.md                     # current completion evidence
```

**Structure Decision**: Add one source/test pair for client registration because
provider entry normalization, mutation sequencing and rollback are one cohesive
responsibility distinct from terminal UI and credential entry. Keep both concrete
client descriptions in that file: they share one reason to change—the supported
installer contract—and are too small to justify client-per-file fragments. If a
review budget is exceeded while cohesion remains, use one exact reviewed warning
mark rather than splitting forwarding files.

## Design Phases

### Phase A — Exact expected entry and concrete clients

1. Resolve the current checkout, `src/cli.ts` and current Node executable to
   absolute real paths before asking a client to mutate state.
2. Represent one canonical stdio entry: name `agentbase`, runtime command and
   `[absolute src/cli.ts, "mcp"]` arguments, with no environment values.
3. Resolve `codex` and `claude` as actual executable files without shell aliases
   or functions. Admit their exact `mcp add/get/remove` help contract before use.
4. Use `codex mcp ...` at its documented global config and `claude mcp ...
   --scope user`; normalize only the exact named entry returned by supported
   management commands.

### Phase B — Complete preflight

1. Inspect every selected client before mutation. Classify its entry as
   `absent`, `exact` or `conflict`; unavailable/unsupported/uninspectable is a
   typed failure.
2. Capture bounded identities of the provider-owned configuration file and one
   owner-private snapshot without parsing or printing unrelated values.
3. Reject any conflict, invalid checkout, unsafe snapshot/receipt location or
   unfinished transaction that cannot be safely recovered before the first add.

### Phase C — Transactional add and verification

1. Atomically persist transaction intent before the first mutation. Exact entries
   are committed no-ops; absent entries become ordered add steps.
2. Invoke client CLIs shell-free, verify exit/output bounds, then re-read and
   compare the normalized named entry exactly.
3. On complete verification, mark committed, remove snapshots and receipt, and
   return per-client `already-registered`/`registered` results.

### Phase D — Rollback and retry recovery

1. On error/interruption, remove newly added entries in reverse order through
   the official client CLI and verify each becomes absent.
2. If compensating removal fails, restore a snapshot only when the current file
   identity equals the exact known post-add identity. Never replace concurrent
   bytes.
3. Preserve the non-secret receipt and snapshot on unresolved recovery. A later
   installer run must finish recovery before a new transaction.
4. Signal/EOF handling restores terminal state. SIGKILL/power loss is handled by
   next-run receipt recovery, not by an unprovable in-process guarantee.

### Phase E — Integration and documentation

1. Run registration after interactive selection and optional credential handling;
   credential outcome remains committed independently.
2. Replace `registration: deferred` with exact per-client results and secret-free
   conflict/recovery guidance. Keep non-interactive behavior mutation-free.
3. Update the living installation contract, specification ID checker, README,
   architecture narrative and handoff.
4. Run focused tests, architecture cohesion review and `npm run verify`. A real
   Codex/Claude registration smoke run requires a separate explicit owner action.

## Rollback Boundaries

- **Before transaction receipt**: no client mutation; dependency/token work may already be complete.
- **After intent, before first add**: remove only receipt/snapshots after verifying their identities.
- **After one or more adds**: compensate only entries classified absent at preflight and added by this transaction.
- **After concurrent change**: do not restore a full snapshot; retain bounded recovery state and identify the affected client.
- **After verified commit**: exact entries are normal user configuration. Later removal is a separate uninstall action, not rollback.

## Complexity Tracking

No constitution violation is requested. User-global configuration mutation is
the explicit subject of the owner-approved feature and is bounded by interactive
selection, exact preflight, official client commands, verification and recovery.
