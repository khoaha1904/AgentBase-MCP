# AgentDocks Architecture Reference

- **Studied repository:** `/home/khoa/workspace/AgentDocks`
- **Evidence reviewed:** `AGENTS.md`, the constitution,
  `docs/ARCHITECTURE.md`, module registry, architecture/workflow checks, test
  discovery, verification scripts and Feature 019 architecture artifacts
- **Purpose:** preserve the useful agent-first design evidence locally without
  making AgentDocks a runtime or documentation dependency

## Why the repository is efficient for agents

AgentDocks does not rely on an agent remembering a large architecture. It turns
repository navigation and change discipline into a short deterministic path:

```text
AGENTS.md
  -> architecture ownership index
  -> affected living requirement
  -> capability public entrypoint
  -> requirement-linked focused tests
  -> smallest responsible private file
```

This path minimizes broad repository reads. A capability can normally be
understood from its public surface and tests before private implementation is
opened.

The repository reinforces that path with executable controls:

- a machine-readable registry gives every authored source/test file exactly one
  capability owner;
- root composition files are explicit exceptions, not an unowned dumping area;
- cross-capability imports may target only registered public entrypoints;
- dependency direction, cycles, unknown ownership, overlapping ownership and
  stale exceptions fail verification;
- recursively discovered tests live beside the capability they prove;
- deterministic shared fixtures remain private under capability-owned
  `test-support/` directories;
- source and test review budgets are measured separately;
- approved hotspots have exact ceilings and become stale when resolved;
- workflow gates expose dirty work, forbidden paths, undeclared slice files and
  repository drift before commit or release;
- new authored files require a present responsibility, consumer and ownership
  decision rather than speculative reuse.

## Documentation and work lifecycle

AgentDocks separates three kinds of context:

| Context | Location | Agent use |
|---|---|---|
| Session routing and authority | `AGENTS.md`, constitution | Always small and loaded first |
| Current product contract | `docs/specs/` | Read only for affected behavior |
| Historical change record | `specs/<number>-<feature>/` | Read only for the active route or historical investigation |

`docs/ARCHITECTURE.md` is an ownership locator rather than an implementation
manual. Feature artifacts do not silently override living requirements.
Verification, work-start, commit, clean-status and release-readiness commands
make the work lifecycle reproducible across agent sessions.

## AgentBase adaptation

AgentBase should adopt the same navigation properties while keeping its own
domain map:

```text
AGENTS.md
docs/
  ARCHITECTURE.md
  specs/                         # living AgentBase requirements
  decisions/                     # accepted architecture decisions
  research/                      # time-bound evidence
specs/
  CURRENT.md
  <number>-<capability>/          # active, then historical change record
src/
  core/
    code-intelligence/
    observations/                # added only by its own active capability
    knowledge/                   # added only by its own active capability
  providers/
    fake-code-intelligence/
    codebase-memory/             # added only after provider acceptance
  app/                           # explicit composition and user flows
scripts/
  module-boundaries.*
  architecture-baseline.*
  check-architecture.*
```

The first foundation slice should create only `code-intelligence`, the fake
provider and one application composition flow. Future folders remain documented
boundaries until their own capability is active.

The AgentBase architecture checker should prove at least:

1. exhaustive, non-overlapping source and test ownership;
2. public-only cross-capability imports;
3. `core` never imports a provider or application module;
4. providers never import application modules;
5. dependency cycles fail with an exact path;
6. root composition files are allowlisted explicitly;
7. newly exceeded review budgets fail, while exact owner-approved hotspots are
   visible, non-growing and removable when resolved;
8. missing or stale registry and baseline entries fail.

## Patterns not copied blindly

- Runtime and dependency choices must be selected for AgentBase requirements;
  AgentDocks using Node.js is evidence, not the decision.
- AgentDocks module names, thresholds and dependency zones do not define the
  AgentBase domain or initial baseline.
- Scripts, feature artifacts and source files are not bulk-copied. AgentBase
  should reimplement the smallest checks with its own requirement IDs.
- AgentDocks-specific credential, Telegram, deployment and provider rules do
  not belong in AgentBase unless a later product contract requires them.
- Background services, external downloads and automatic installation require an
  explicit AgentBase product decision.
