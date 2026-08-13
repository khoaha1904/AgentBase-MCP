# Feature Specification: Explicit Observation Command

**Feature Branch**: `main`

**Created**: 2026-08-12

**Status**: Complete

**Input**: The owner requires Code Intelligence graph behavior to follow Codebase Memory and OKF creation to remain a separate explicit user command.

## Owner Decisions

- Codebase Memory remains the graph authority. AgentBase does not build a parallel graph model or reinterpret provider nodes and edges as a new canonical graph.
- Observation collection and OKF creation are separate user actions.
- Observation collection never creates, changes, validates or applies `okf/`.
- The first observation surface is task-directed code-relationship evidence for one explicitly selected repository and symbol.
- Output is deterministic provenance-bearing JSON suitable for local redirection or later explicit OKF use.

## User Scenarios & Testing

### User Story 1 - Collect code observations without creating OKF (Priority: P1)

A coding agent explicitly asks AgentBase to observe one symbol in one repository and receives bounded evidence derived from the managed Codebase Memory graph.

**Why this priority**: It establishes the bridge between disposable graph queries and later knowledge work without coupling the two product parts.

**Independent Test**: Run the observation command with a fake/captured provider result and prove it emits a normalized evidence bundle while all OKF bytes and workflows remain untouched.

**Acceptance Scenarios**:

1. **Given** an explicit repository and symbol, **When** the user runs the observation command, **Then** AgentBase obtains task-directed evidence through Codebase Memory and emits one provenance-bearing JSON bundle.
2. **Given** observation collection succeeds, **When** the command exits, **Then** no OKF proposal, validation or apply action has occurred.
3. **Given** invalid arguments or provider failure, **When** the command exits, **Then** it reports a visible bounded error and emits no partial successful bundle.

### User Story 2 - Select OKF schemas from repository evidence (Priority: P2)

During a separate explicit OKF workflow, an authoring agent asks MCP which
AgentBase concept schemas match the repository evidence, reads the chosen
schemas and validates authored Markdown before proposing it.

**Independent Test**: List the versioned catalog, select schemas for API and
database signals, validate a known type, and prove an unknown Google OKF type
remains conformant.

**Acceptance Scenarios**:

1. **Given** repository evidence signals, **When** the agent requests schema selection, **Then** MCP returns only matched recommendations plus the repository root concept.
2. **Given** a known AgentBase type, **When** the agent validates it, **Then** Google OKF, draft and type-specific failures are reported together.
3. **Given** an unknown non-empty OKF type, **When** it passes base conformance, **Then** AgentBase does not reject it for missing catalog registration.

### Edge Cases

- Missing repository or symbol returns usage without starting the provider.
- Provider and source-integrity failures remain distinct from invalid arguments.
- Reordered equivalent provider evidence normalizes to identical bytes apart from explicitly non-deterministic capture timestamps; the stable digest excludes no declared evidence field.

## Requirements

### Functional Requirements

- **FR-001 / AB-OBS-001**: Observation collection MUST be an explicit command with one repository and one symbol.
- **FR-002 / AB-OBS-002**: The detailed graph, indexing, node/edge meaning and query behavior MUST remain owned by the exact managed Codebase Memory provider.
- **FR-003 / AB-OBS-003**: AgentBase MUST emit only normalized, provenance-bearing evidence; provider-private graph records MUST NOT become a second AgentBase graph schema.
- **FR-004 / AB-OBS-004**: Observation collection MUST NOT create, modify, validate or apply OKF. OKF work MUST require a separate explicit `okf` command.
- **FR-005 / AB-OBS-005**: Equivalent input evidence MUST normalize with stable ordering and a deterministic digest.
- **FR-006 / AB-OBS-006**: Invalid input, provider failure, source mutation and cleanup failure MUST return no partial successful observation bundle.
- **FR-007 / AB-OBS-007**: The command MUST preserve the existing exact managed-provider, private-cache, bounded-process and clean-cleanup boundaries.
- **FR-008 / AB-SCHEMA-001..006**: MCP MUST expose a versioned, advisory AgentBase schema catalog and layered validation while preserving Google OKF open-world type compatibility.

### Key Entities

- **Observation bundle**: Local evidence containing source identity, exact engine/analyzer identity, query inputs, facts, source references, completeness, limitations and digest.
- **OKF command**: A separate user-authorized knowledge proposal/validation/diff/apply action; it is not a consequence of observation collection.

## Success Criteria

- **SC-001**: One command produces a complete observation bundle for the accepted fixture and cites no more than three source files.
- **SC-002**: Five normalizations of equivalent input produce the same digest and ordering.
- **SC-003**: Automated acceptance proves zero OKF workflow calls and unchanged OKF bytes during observation collection.
- **SC-004**: Canonical verification passes and a real opt-in run leaves no standing provider process.
- **SC-005**: MCP lists 11 initial schemas, selects evidence-relevant schemas deterministically and validates known/unknown types as specified.

## Assumptions

- The existing managed Codebase Memory provider and repository evidence normalization are reused.
- Output is written to stdout; the user or host agent chooses whether and where to retain it locally.
- Observation collection is not automatic, scheduled or watcher-driven.
