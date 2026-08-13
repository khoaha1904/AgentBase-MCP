# Feature Specification: Client MCP Registration

**Feature Branch**: `010-client-mcp-registration`

**Created**: 2026-08-13

**Status**: Complete

**Input**: Complete the interactive AgentBase-MCP installer so a user can register the local MCP in Codex, Claude Code or both at user scope. Registration binds to the current absolute AgentBase-MCP checkout, preserves matching entries, refuses conflicting entries and treats all selected clients as one recoverable transaction.

## Owner Decisions Treated as Settled

- Registration uses the absolute path of the AgentBase-MCP checkout from which the installer runs. Moving the checkout requires rerunning installation.
- The stable MCP server name is `agentbase` in both supported clients.
- Registration is user-global, not repository-local or team-shared.
- An existing exact `agentbase` entry is accepted as already installed. An existing differing entry is never silently replaced.
- Selecting both clients creates one transaction: if either client cannot be safely registered and verified, every client entry newly added by that run is rolled back.
- GitHub token entry remains an independent optional installer action. A registration failure does not erase a separately accepted credential update.

## User Scenarios & Testing

### User Story 1 - Register Selected Coding Clients (Priority: P1)

A user runs the interactive installer, selects Codex, Claude Code or both, and finishes with AgentBase-MCP available from every project in each selected client.

**Why this priority**: Installation is incomplete until the selected coding client can actually start the local MCP without manual configuration.

**Independent Test**: Use isolated client homes and deterministic client doubles, select each supported combination, then prove that only the selected user-scoped clients contain the exact `agentbase` launcher and that the launcher exposes the AgentBase-MCP tools.

**Acceptance Scenarios**:

1. **Given** Codex is available with no `agentbase` entry, **When** the user selects Codex, **Then** one user-global exact entry is added and verified while Claude Code remains unchanged.
2. **Given** Claude Code is available with no `agentbase` entry, **When** the user selects Claude Code, **Then** one user-global exact entry is added and verified while Codex remains unchanged.
3. **Given** both clients are available, **When** the user selects both, **Then** both receive equivalent user-global entries bound to the current checkout and the result reports each verified client.
4. **Given** installation runs non-interactively, **When** dependencies finish, **Then** no client is selected or mutated and no ambient credential is persisted.

---

### User Story 2 - Rerun Without Damaging Existing Configuration (Priority: P1)

A user can rerun installation safely. Matching AgentBase entries are left unchanged, other MCP entries remain untouched, and a conflicting `agentbase` definition blocks registration with a clear corrective message.

**Why this priority**: A machine-wide installer must coexist with the user's existing coding setup and cannot claim ownership of an entry it did not create.

**Independent Test**: Seed isolated client homes with unrelated entries, exact matching entries and conflicting `agentbase` entries, then prove byte-preservation where no mutation is authorized and idempotent results for exact matches.

**Acceptance Scenarios**:

1. **Given** a selected client already has the exact expected `agentbase` entry, **When** installation runs, **Then** the entry is reported as already registered and its configuration is not rewritten.
2. **Given** a selected client has an `agentbase` entry with a different launcher, arguments, transport or scope, **When** preflight runs, **Then** installation stops before any client mutation and explains that the user must remove or rename the conflicting entry deliberately.
3. **Given** selected clients contain unrelated MCP entries and settings, **When** registration succeeds or is rolled back, **Then** those unrelated values remain unchanged.
4. **Given** the registered checkout has moved, **When** installation is rerun from the new location, **Then** the old entry is treated as a conflict rather than silently repointed.

---

### User Story 3 - Recover All Selected Clients Together (Priority: P1)

If registration fails, is interrupted or cannot be verified after one selected client changed, the installer restores the selected clients to their admitted pre-run AgentBase state and leaves actionable recovery evidence if automatic rollback cannot finish.

**Why this priority**: Partial installation across Codex and Claude Code is confusing and can leave one client starting a stale or unintended MCP.

**Independent Test**: Inject missing executables, add failures, verification mismatches, interruptions and rollback failures at each transaction phase using isolated homes; prove all-or-nothing selected-client state and deterministic retry/recovery.

**Acceptance Scenarios**:

1. **Given** any selected client executable is unavailable or unsupported, **When** preflight runs, **Then** no selected client configuration changes.
2. **Given** the first selected client is newly registered and the second add or verification fails, **When** rollback runs, **Then** the first new entry is removed and both clients match their admitted pre-run AgentBase state.
3. **Given** installation is interrupted after a client mutation, **When** installation is retried, **Then** it recovers the exact unfinished transaction before starting a new one.
4. **Given** automatic rollback cannot safely complete, **When** installation exits, **Then** it reports the affected client and owner-private recovery location without printing secrets or overwriting unrelated concurrent changes.

### Edge Cases

- A supported client exists during preflight but disappears or changes version before mutation.
- A client reports an entry in a shape the installer cannot compare exactly.
- Codex and Claude Code resolve from aliases, shell functions or different executable locations.
- The checkout path contains spaces, Unicode or shell metacharacters.
- The checkout or MCP entrypoint is missing, relative, symlinked outside the admitted checkout or changes during registration.
- A client command succeeds but the resulting entry is absent or differs from the expected launcher.
- An interruption occurs after add but before verification or after rollback begins.
- A concurrent process changes the same client configuration during registration or recovery.
- A prior recovery receipt is malformed, unsafe, stale or belongs to a different checkout.
- Token input is skipped, preserved or replaced while client registration later fails.

## Requirements

### Functional Requirements

- **FR-001 / AB-INSTALL-007**: Interactive installation MUST register the `agentbase` stdio MCP at user-global scope in exactly the selected available clients and MUST leave unselected clients unchanged.
- **FR-002 / AB-INSTALL-008**: The registered launcher MUST bind to the current absolute AgentBase-MCP checkout and admitted runtime entrypoint without shell interpolation, repository-current-directory dependence or Hub configuration.
- **FR-003 / AB-INSTALL-009**: Registration MUST preflight every selected client, checkout entrypoint and existing `agentbase` definition before the first client mutation.
- **FR-004 / AB-INSTALL-010**: An exact existing entry MUST be treated as idempotent success without rewrite; a differing or uninspectable same-name entry MUST fail before mutation and MUST NOT be replaced automatically.
- **FR-005 / AB-INSTALL-011**: Registration MUST use each client's supported user-scope management contract and MUST verify the persisted entry independently after mutation.
- **FR-006 / AB-INSTALL-012**: All selected clients MUST participate in one transaction. Failure or interruption after mutation MUST remove every entry newly added by that transaction and preserve entries that existed before it.
- **FR-007 / AB-INSTALL-013**: The installer MUST preserve unrelated client configuration. Automatic rollback MAY restore a captured client file only when its current identity exactly matches the installer-known post-mutation state; otherwise it MUST stop with visible recovery guidance rather than overwrite concurrent changes.
- **FR-008 / AB-INSTALL-014**: Registration MUST keep owner-private, non-secret pre-state and phase evidence sufficient for deterministic recovery, MUST reject unsafe or mismatched recovery state and MUST clear the receipt only after verified commit or verified rollback.
- **FR-009 / AB-INSTALL-015**: Missing/unsupported clients, command failures, verification mismatches, conflicts, concurrency and rollback failures MUST remain distinguishable without exposing credentials, unrelated configuration values or authenticated URLs.
- **FR-010 / AB-INSTALL-016**: Existing masked token, replacement and non-interactive behavior MUST remain intact; credential persistence is independent from the client transaction and installation MUST never add the token to either MCP entry.
- **FR-011 / AB-INSTALL-017**: Canonical verification MUST cover every client selection, exact rerun, conflict, unavailable client, partial failure, interruption, rollback and concurrency path using isolated homes and deterministic doubles without mutating real Codex or Claude Code configuration.

### Key Entities

- **Expected Client Entry**: The canonical `agentbase` stdio definition for one supported client, including user scope, admitted executable and absolute AgentBase-MCP entrypoint arguments.
- **Client Pre-state**: Whether the selected client had no AgentBase entry or an exact matching entry before mutation, plus bounded identities needed to detect concurrent change without retaining secrets.
- **Registration Transaction**: One selected-client set, checkout identity, ordered phases and per-client results for a single installer run.
- **Recovery Receipt**: Owner-private, non-secret evidence describing newly added entries and verified transaction phases so rollback or retry can resume safely.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All three interactive selections—Codex, Claude Code and both—finish with exactly the selected clients reporting one verified user-global `agentbase` entry bound to the initiating checkout.
- **SC-002**: Across exact rerun and conflict fixtures, 100% of pre-existing matching, conflicting and unrelated configuration bytes remain unchanged unless an exact new entry is authorized.
- **SC-003**: Every injected failure or interruption after the first client mutation returns all automatically recoverable selected clients to their admitted pre-run AgentBase state before exit or next-run recovery.
- **SC-004**: Every simulated concurrent-change or rollback-failure case preserves the concurrent bytes and leaves one bounded actionable recovery record with zero credential values in output or state.
- **SC-005**: Non-interactive and fixture-based canonical verification causes zero writes to real user Codex/Claude configuration and passes the full repository gate without a new production dependency or metric-driven file fragmentation.

## Assumptions

- The selected client command is already installed and exposes its supported MCP management surface; installing Codex or Claude Code itself is out of scope.
- The installer owns only the exact `agentbase` entry it newly creates during the current recoverable transaction.
- User-global scope is the appropriate machine installation scope; project-local and team-shared MCP configuration remain user-managed.
- The current checkout remains installed after registration. Moving or deleting it invalidates the launcher and requires deliberate removal/re-registration.
- Client configuration formats are provider-owned. The installer uses supported client commands for normal inspection/add/remove and treats raw configuration snapshots only as guarded recovery evidence.

## Explicit Non-goals

- Installing, upgrading or authenticating Codex or Claude Code.
- Silently replacing, renaming or merging a conflicting `agentbase` entry.
- Registering project-scoped/team-shared MCP configuration.
- Selecting or creating AgentBase-Hub during installation.
- Adding the GitHub token or Hub URL to a client MCP definition.
- Automatically updating registration when the checkout moves or changes version.
- Performing a real machine-wide registration as part of the canonical test gate.
