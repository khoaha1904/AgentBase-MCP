# Feature Specification: AgentBase CLI Surface and Hub Connect

**Feature Branch**: `main`

**Created**: 2026-08-29

**Status**: Complete — public CLI and shared-token connect implemented and verified

**Input**: Replace the confusing internal `okf hub` command surface with one
small `abs` CLI for the few owner actions; keep detailed lifecycle work behind
skills/MCP and make Hub connect a one-command flow.

## User Scenarios & Testing

### User Story 1 - Understand the CLI (Priority: P1)

As an AgentBase owner, I run `abs --help` and see only the small set of actions
I actually need, using AgentBase language rather than OKF implementation terms.

**Why this priority**: The current command list exposes internal authoring,
proposal and recovery steps and makes the product look more complicated than it
is.

**Independent Test**: Run help and verify it contains only the public commands
and does not list `okf`, proposal phases, provider runners or benchmark actions.

### User Story 2 - Connect or switch Hub (Priority: P1)

As an AgentBase owner, I provide a Hub URL and branch and, when needed, enter
one owner-private token in a masked prompt. Leaving the token blank reuses the
existing shared token. I receive either a validated active Hub profile or a
clear failure that leaves my previous Hub unchanged.

**Why this priority**: Hub connection is the only public action that needs
credential and remote authority; one shared owner token keeps setup simple
across the repositories the owner controls.

**Independent Test**: With deterministic masked-input and Hub doubles, connect a
new profile with an entered token, reconnect with blank input to reuse it, and
exercise reported failures without token disclosure or profile mixing.

**Acceptance Scenarios**:

1. **Given** no shared token exists, **when** the owner enters a token in the
   masked connect prompt, **then** it is stored privately, the Hub is validated
   and the destination becomes active.
2. **Given** a shared token already exists, **when** the owner leaves the token
   prompt blank, **then** that token is reused for the new URL/branch.
3. **Given** the owner enters a replacement token and remote or Hub validation
   fails, **when** the command returns an error, **then** the previous active
   profile and previous shared token remain unchanged.
4. **Given** the owner runs `abs hub sync`, **when** synchronization is
   requested explicitly, **then** the configured Hub is pulled without changing
   the public command surface or copying knowledge between profiles.

### Edge Cases

- `abs` is unavailable or invoked with an unknown command.
- The terminal is non-interactive and no shared token exists.
- The entered token is empty, malformed or lacks permission.
- The token lacks permission for the destination repository or branch.
- The destination URL, branch or Hub content is invalid.
- An uncatchable process termination occurs after credential admission; the
  private token may remain for safe reuse, but the previous active Hub remains.

## Requirements

### Functional Requirements

- **FR-001 / AB-CLI-001**: The user-facing executable MUST be named `abs`, and
  `abs --help` MUST describe AgentBase operations without using OKF as a command
  namespace.
- **FR-002 / AB-CLI-002**: Public help MUST expose only `status`, `hub connect`
  and `hub sync` in this MVP.
- **FR-003 / AB-CLI-003**: The `mcp` launcher MUST remain available for client
  registration but MUST NOT be presented as an ordinary user workflow.
- **FR-004 / AB-CLI-004**: Ingest, Refresh, Batch, Enrichment, Query, Accept,
  Publish, Question review, validator, benchmark and proposal phases MUST stay
  skill/MCP or developer/internal routes.
- **FR-005 / AB-CLI-005**: Existing internal routes MAY remain as hidden
  compatibility paths during migration, but README, skill instructions and
  public help MUST use only `abs` commands.
- **FR-006 / AB-CLI-006**: CLI renaming MUST NOT change MCP tool names, Hub data,
  local storage identity, Published/Draft state or authorization boundaries.
- **FR-007 / AB-HUB-SETUP-030**: `abs hub connect` MUST accept only a
  credential-free HTTPS repository URL and exact branch. A token may be entered
  only through an owner-private masked terminal prompt; blank input reuses the
  existing shared owner token. The same token is usable across configured Hub
  repositories and branches, subject to ordinary remote permission checks.
- **FR-008 / AB-HUB-SETUP-031**: Connect MUST activate only after validation;
  reported failure MUST preserve the prior profile and previous shared token.
  An uncatchable termination MUST NOT activate the destination; a staged private
  replacement token may remain for safe recovery.
- **FR-009 / AB-HUB-SETUP-031**: Token bytes MUST never enter chat, MCP inputs,
  arguments, output, errors, Git data, Hub files or shared knowledge records.
- **FR-010 / AB-HUB-SETUP-031**: Connect MUST NOT synchronize, publish, copy
  drafts or merge knowledge across profiles; `abs hub sync` remains explicit.

### Key Entities

- **Public command**: A documented `abs` operation available to owners.
- **Internal route**: A hidden compatibility/developer operation used by skills,
  MCP or verification, not shown in public help.
- **Hub profile identity**: Exact normalized host, repository and branch owning
  isolated checkout and configuration; credential is shared at owner scope.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `abs --help` lists exactly three public commands — `status`,
  `hub connect` and `hub sync` — and no OKF,
  proposal or benchmark internals.
- **SC-002**: An owner connects a valid new Hub with one command and one masked
  token entry when no shared token exists; later connects need only URL/branch.
- **SC-003**: All tested reported failures leave the previous active profile and
  previous shared token unchanged.
- **SC-004**: Secret-safety checks find zero token bytes in arguments, output,
  errors, Git configuration or repository content.
- **SC-005**: Existing internal workflows and MCP tool names continue to run
  without changing Hub knowledge or local profile identity.

## Assumptions

- `abs` is the only public terminal name; `node src/cli.ts` remains an internal
  development invocation until packaging exposes the executable.
- The owner supplies a token with the required repository permissions. AgentBase
  does not login, mint tokens, change scopes or select accounts.
- Public CLI has no direct Ingest/Refresh/Publish command because skills/MCP
  already own those workflows.
- Existing internal routes are migrated gradually and hidden from help; no
  compatibility removal occurs in this slice.
- Existing per-profile credential files are legacy input only. When no shared
  token exists, a blank connect may promote the active profile's legacy token to
  the shared owner-private credential; conflicting inactive legacy tokens are
  not copied.
- No new dependency, Hub schema, storage format, daemon or crash journal is
  introduced.

## Owner Decisions

- Use `abs`, not `okf`, as the user-facing command name.
- Keep only `status`, `hub connect` and `hub sync` public in this MVP.
- Keep MCP tools and skill names unchanged.
- Treat `okf hub`, the token helper and any GitHub CLI shortcut as internal
  migration/testing paths, not product vocabulary.
