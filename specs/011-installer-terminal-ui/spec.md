# Feature Specification: Installer Terminal UI

**Feature Branch**: `011-installer-terminal-ui`

**Created**: 2026-08-13

**Status**: Complete

**Input**: Replace the crude numeric client picker with a polished AgentBase-MCP terminal setup experience inspired by modern coding CLIs. Show product identity, setup actions and next steps; use arrow-key navigation, Space multi-select and Enter to continue with one primary color while preserving all installation, credential and recovery behavior.

## Owner Decisions Treated as Settled

- The installer begins with visible AgentBase-MCP identity and explains the short setup flow.
- Cyan/teal is the primary accent. Selection and focus remain understandable without color.
- Client selection uses Up/Down arrows, Space to toggle and Enter to continue. Number shortcuts may remain as an undocumented compatibility convenience.
- Codex and Claude Code are independent multi-select items; at least one is required.
- The implementation remains dependency-free and works in the current raw terminal flow.
- Existing masked token, non-interactive, registration, rollback and secret-safety behavior must not change.

## User Scenarios & Testing

### User Story 1 - Understand and Navigate Setup (Priority: P1)

A user runs `./install.sh` and immediately sees which application is running, what setup will do and a familiar keyboard-driven multi-select list.

**Why this priority**: The current numeric prompt is visually unclear and does not communicate focus, selection or the remaining setup actions.

**Independent Test**: In a fake interactive terminal, navigate both clients with arrow keys, toggle them with Space and continue with Enter while captured output exposes product identity, focus, selection and keyboard help.

**Acceptance Scenarios**:

1. **Given** an interactive terminal, **When** setup begins, **Then** it displays AgentBase-MCP branding, a short purpose line, the current Clients action and the remaining setup sequence.
2. **Given** the client list, **When** Up/Down is pressed, **Then** the visible focus moves and selection does not change.
3. **Given** a focused client, **When** Space is pressed, **Then** its visible selected state toggles without advancing.
4. **Given** one or more selected clients, **When** Enter is pressed, **Then** setup advances with the selected client IDs in stable display order.
5. **Given** no selected client, **When** Enter is pressed, **Then** the same screen remains active and shows a concise actionable validation message.

---

### User Story 2 - Follow Progress and Finish Clearly (Priority: P1)

The user can distinguish optional GitHub access, registration progress and final outcomes without exposing a token or reading raw implementation-oriented status text.

**Why this priority**: A polished picker alone still leaves the rest of installation feeling fragmented and unclear.

**Independent Test**: Complete setup with created, skipped and preserved credential fixtures plus registered/already-registered client results and assert clear step/result copy with no token bytes.

**Acceptance Scenarios**:

1. **Given** client selection completes, **When** optional token input is needed, **Then** the UI labels the GitHub access action, explains Enter-to-skip and keeps one `*` per accepted character.
2. **Given** an existing credential, **When** replacement was not requested, **Then** setup reports it as preserved without prompting for or printing it.
3. **Given** registration succeeds, **When** setup finishes, **Then** each selected client has a readable registered/already-registered result and the UI explains that the MCP is ready for a new client session.
4. **Given** interruption, EOF or failure, **When** setup exits, **Then** raw mode is restored and existing safety/recovery behavior is unchanged.

### Edge Cases

- Arrow-key escape bytes arrive together or across multiple input chunks.
- The terminal is narrow, declares `TERM=dumb` or sets `NO_COLOR`.
- Unicode/color support is unavailable even though input/output are TTY streams.
- Enter is pressed repeatedly with no selection.
- Selection is toggled multiple times before continuing.
- Token input contains paste, Backspace, control characters or interruption.
- A client registration failure occurs after the richer progress UI is shown.
- Non-interactive execution must emit stable plain text without cursor control.

## Requirements

### Functional Requirements

- **FR-001 / AB-INSTALL-018**: Interactive setup MUST present AgentBase-MCP identity, a concise purpose and an ordered summary of the Clients, optional GitHub access and Registration actions before selection.
- **FR-002 / AB-INSTALL-019**: The client picker MUST support Up/Down focus movement, Space multi-selection and Enter continuation, require at least one selection and return clients in stable display order.
- **FR-003 / AB-INSTALL-020**: Focus, selected state, validation and outcomes MUST use text/symbol differences in addition to color so meaning never depends on cyan rendering.
- **FR-004 / AB-INSTALL-021**: Interactive rendering MUST remain readable in narrow and no-color terminals; non-interactive output MUST contain no ANSI cursor/color sequences and retain its existing mutation-free behavior.
- **FR-005 / AB-INSTALL-022**: Token and registration phases MUST have user-oriented action labels, bounded progress/result copy and a final next-step message that distinguishes `registered` from `already-registered` per client.
- **FR-006 / AB-INSTALL-023**: The UI change MUST preserve masked character observability, Backspace, Enter-to-skip, terminal restoration, credential independence, transactional registration and secret-free failures.
- **FR-007 / AB-INSTALL-024**: Canonical verification MUST cover chunked arrow input, multi-select toggling, empty validation, no-color/narrow rendering, token states, completion states and non-interactive plain output without touching real clients.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can select both clients using only Down, Space, Up, Space and Enter, with every focus and selection state visible in captured output.
- **SC-002**: All interactive screens identify AgentBase-MCP and the current action; successful completion reports every selected client and one next step.
- **SC-003**: No-color and 40-column fixtures retain 100% of required labels, key instructions and state meaning without relying on ANSI sequences.
- **SC-004**: Existing token, interruption, non-interactive and registration safety tests continue to pass with zero secret bytes exposed.

## Assumptions

- The initial UI targets ANSI-capable Unix-like terminals used by Codex CLI and Claude Code; it provides plain fallbacks rather than adding a cross-platform TUI framework.
- Redrawing only the client selection region is sufficient; setup is not a full-screen alternate-buffer application.
- English remains the product UI language in this capability.

## Explicit Non-goals

- A full-screen dashboard, mouse input, animations or an alternate screen buffer.
- Installing a third-party prompt/TUI dependency.
- Changing which clients, credentials or Hub behaviors are supported.
- Live log streaming or progress bars for dependency installation.
- Hot-reloading MCP processes in Codex or Claude Code.
