# Application lifecycle requirements

> Status: Implemented and verified for application bytes, stable launcher and
> local lifecycle state. G2-C3 now composes client/skill integration into it.
>
> Release evidence: Required

Product Contract:
[Scope and authority](../../product/00-scope-and-authority.md)

Architecture Contracts:
[Runtime boundaries](../../architecture/runtime.md),
[State and trust boundaries](../../architecture/state-and-trust.md), and
[Flows](../../architecture/flows.md)

## Boundary

This capability owns installed application bytes, release selection, the
stable launcher, application lifecycle locking and crash recovery. It consumes
an already built release and never builds, downloads or discovers one. The
separate client/skill capability reuses this lock and commit decision without
moving integration ownership into application-byte management.

`current` and `previous` are owner-private regular pointer files, not links.
That makes selection atomic on both supported platforms and keeps the target
name inspectable without resolving an attacker-controlled filesystem link.

## Requirements

- **AB-LIFECYCLE-001** — Installation uses explicit absolute `AGENTBASE_HOME`
  or `~/.agentbase`, validates owner-controlled regular paths and creates only
  the defined `bin/`, `runtime/`, `state/installation/` and `tmp/` application
  paths. It never derives identity from the current repository directory.
- **AB-LIFECYCLE-002** — The transaction admits only a fully verified extracted
  release or a local archive with matching adjacent outer checksum. It checks
  target platform, manifest/file/SBOM closure, native provider identity and CLI
  smoke before mutating installed state.
- **AB-LIFECYCLE-003** — One create-exclusive owner-private installation lock
  serializes install, upgrade, rollback and uninstall. A live owner blocks; a
  stale lock is removed only after its recorded local PID is proven absent.
- **AB-LIFECYCLE-004** — Before mutation, a durable receipt records operation,
  target and exact prior pointers plus installer-owned file identities. Invalid
  or unresolved recovery state blocks a new operation.
- **AB-LIFECYCLE-005** — Initial install stages an immutable release below
  `runtime/releases/<release-id>/`, installs recovery control outside selected
  releases, writes the stable launcher and user command link, verifies the
  complete staged state, then atomically selects `current`.
- **AB-LIFECYCLE-006** — `abs upgrade --bundle <file>` stages and verifies one
  explicit local bundle with a strictly newer semantic version, leaves `current`
  unchanged until commit, then moves the old current identity to `previous`. It
  never edits Hub content or runs a knowledge/profile migration.
- **AB-LIFECYCLE-007** — `abs rollback` verifies both retained releases before
  atomically swapping `current` and `previous`. Exactly those two release
  payloads are retained after a successful upgrade or rollback.
- **AB-LIFECYCLE-008** — `abs uninstall` removes only unchanged installer-owned
  command link, launcher, lifecycle control, pointers and release payloads.
  Conflicting paths fail visibly. `config/`, `hubs/` and `state/` are preserved;
  there is no implicit purge mode.
- **AB-LIFECYCLE-009** — Failure before commit removes only new staging. Failure
  during or after installer-owned mutation replays the receipt and restores the
  exact prior pointer/file state; recovery is idempotent after interruption.
- **AB-LIFECYCLE-010** — The stable launcher resolves normal CLI/MCP calls only
  through verified `current`; lifecycle commands route to recovery control
  outside the selected release. Missing, malformed or drifting state fails
  without falling back to a checkout or `PATH` implementation.
- **AB-LIFECYCLE-011** — Application compatibility preflight may read declared
  profile/state metadata but cannot edit a Hub, Draft, Published checkout,
  configuration credential or workflow state. Application rollback is not a
  knowledge rollback.
- **AB-LIFECYCLE-012** — Focused isolated-home tests cover install, exact rerun,
  upgrade, rollback, uninstall, live/stale lock, corruption, collision and
  injected interruption recovery without touching real user or client state.

## Integration boundary

[`12-client-and-skill-integration-requirements.md`](12-client-and-skill-integration-requirements.md)
extends the same transaction with one-time legacy checkout registration
migration and versioned product-skill activation. It reuses this stable launcher,
lock and receipt decision; it creates no second application lifecycle and
changes no Hub knowledge.

## Acceptance evidence

Requirement-linked tests use isolated homes to exercise install, exact rerun,
strictly newer upgrade, rollback, uninstall, stable launcher dispatch, live and
stale locks, managed-path conflict, pre-commit rollback and committed-uninstall
recovery. Release qualification also runs the generated `install.sh`, invokes
the installed launcher and uninstalls the real packaged payload.
