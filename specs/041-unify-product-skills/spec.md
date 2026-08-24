# Feature Specification: Unify Product Skills

**Feature Branch**: `041-unify-product-skills`

**Created**: 2026-08-24

**Status**: Complete

**Input**: Standardize AgentBase's released skills into clear public and
internal groups, and give ordinary questions one public entrypoint that chooses
Published Hub knowledge, authorized local code or both.

## User Scenarios & Testing

### User Story 1 - Ask AgentBase without choosing a source (Priority: P1)

As a user, I ask one natural-language question without choosing Hub search,
concept read or Code Graph, and AgentBase selects the smallest sufficient
read-only route.

**Independent Test**: Representative knowledge, implementation and combined
questions select the expected existing primitives and return separately
attributed evidence without any knowledge or remote mutation.

**Acceptance Scenarios**:

1. A purpose, ownership, cross-repository or known-value question starts from
   synchronized Published Hub search/read and stops when that answer is enough.
2. An exact implementation, caller/callee, impact or current-code question uses
   the authorized local Code Graph.
3. A question requiring intent plus implementation uses both sources only when
   necessary and keeps Published knowledge separate from current source.
4. Missing Hub or graph access produces a truthful partial answer or one short
   scope clarification, never a guessed answer or implicit mutation.

### User Story 2 - Choose from a coherent public skill catalog (Priority: P1)

As a user, I see product skills organized by goals rather than technical
subworkflows, so I know whether to Ask, Ingest, Refresh, Batch, Enrich or manage
the Hub.

**Independent Test**: A clean selected client receives the exact catalog of six
public workflows and two supporting workflows, with descriptions that do not
compete for ordinary user intent.

**Acceptance Scenarios**:

1. The public catalog contains `agentbase-query`, `agentbase-ingest`,
   `agentbase-refresh`, `agentbase-batch-ingest`,
   `agentbase-domain-enrichment` and `agentbase-hub`.
2. `use-codebase-memory` and `agentbase-okf` are identified as internal support,
   not alternative public goals.
3. Repository-development `speckit-*` skills remain excluded.

### User Story 3 - Invoke the same canonical skill across clients (Priority: P2)

As a Codex or Claude Code user, I receive the same skill identity while using
the explicit invocation syntax supported by my client.

**Independent Test**: Installation documentation and UI metadata show
`$agentbase-query` for Codex and `/agentbase-query` for Claude Code without
claiming a portable slash alias.

**Acceptance Scenarios**:

1. Canonical skill names remain `agentbase-*`; no `abs-*` duplicate is
   installed.
2. Natural-language matching remains enabled for public skills.
3. Client-specific invocation syntax is described accurately without changing
   the underlying workflow identity.

### Edge Cases

- A Hub Repository reference does not identify one exact authorized local
  checkout: query remains Hub-only or asks one short repository clarification.
- Hub and source disagree: both positions retain provenance; query does not
  select a winner, Refresh or create a Question.
- A client exposes an internal support artifact in its selector: its metadata
  identifies it as support and directs ordinary questions to `agentbase-query`.
- Bounded Hub search returns no match: the answer says no match was found in
  that bounded search, not that the knowledge cannot exist.

## Requirements

### Functional Requirements

- **FR-001**: The released catalog MUST contain exactly six public user-goal
  skills and two internal supporting skills with the names in User Story 2.
- **FR-002**: `agentbase-query` MUST own ordinary read-only question routing and
  MUST choose Hub-first, Code-Graph-first or combined behavior from user intent
  without asking the user to select a source mode.
- **FR-003**: Hub routing MUST use only synchronized Published search/read,
  follow exact concept links when useful and preserve the snapshot-default
  stopping rule.
- **FR-004**: Code routing MUST use only one exact authorized local repository
  through the existing bounded graph workflow; it MUST NOT scan a workspace,
  clone a repository or treat a Hub reference as source authorization.
- **FR-005**: Query MUST NOT authorize Ingest, Refresh, Question resolution,
  Accept, Publish, Sync, provider CLI or any other knowledge/remote mutation.
- **FR-006**: Combined answers MUST keep Hub commit/path attribution and local
  source attribution separate, label synthesis as inference and present
  conflicts without choosing a truth winner.
- **FR-007**: `use-codebase-memory` MUST own only the reusable Code Graph
  subworkflow; `agentbase-okf` MUST own only prepared-workspace authoring and
  validation. Neither description may compete for ordinary public questions.
- **FR-008**: Codex and Claude Code MUST receive the same canonical skill names.
  Product documentation MUST describe `$name` for Codex and `/name` for Claude
  Code and MUST NOT claim a portable `abs-*` alias.
- **FR-009**: Interactive installation MUST install only the fixed eight-skill
  product allowlist and remain transactional, conflict-safe and no-op on an
  exact rerun.
- **FR-010**: The MCP tool surface MUST remain exactly 42; this capability MUST
  add no question router, model runtime, dependency, Hub state or provider call.

## Non-goals

- Hiding internal skills through unsupported client-specific mechanisms.
- A universal MCP answer tool, classifier, result DTO or model call.
- Remote repository reading, automatic Hub synchronization or Local Draft query.
- Renaming existing canonical skills, adding client-specific duplicate commands
  or running a model benchmark.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A clean Codex and Claude Code installation each contains exactly
  eight AgentBase product skills: six public and two internal, with zero
  `speckit-*` or `abs-*` entries.
- **SC-002**: A requirements-linked routing matrix covers Hub-first,
  Code-Graph-first, combined, degraded and conflicting-answer scenarios with no
  mutating tool authorization.
- **SC-003**: Public skill descriptions have one unambiguous owner for ordinary
  questions and exact distinct owners for the other five user goals.
- **SC-004**: Canonical verification passes with the 42-tool MCP inventory
  unchanged and without increasing the design-level test inventory.

## Assumptions

- Skill selection remains host-agent orchestration; MCP stays deterministic.
- Internal means a supporting workflow rather than a user-goal entrypoint. Some
  clients may still show the artifact in a technical selector.
- Public skills may activate from natural language; explicit invocation is an
  optional client affordance.
