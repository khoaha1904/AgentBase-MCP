# Feature Specification: Correct Tool Guidance

**Feature Branch**: `042-correct-tool-guidance`

**Created**: 2026-08-24

**Status**: Complete

**Input**: Improve the current MCP tool surface without removing or adding any
released tool.

## User Scenarios & Testing

### User Story 1 - Trust public Code Graph guidance (Priority: P1)

As an agent, I receive tool descriptions and safety hints that match the
released AgentBase behavior, so I do not attempt a removed action or treat a
read-only query as destructive.

**Independent Test**: The official MCP listing contains 42 tools, no public
descriptor names a missing tool, and all eight Code Graph query/read actions
are identified as read-only and non-destructive.

**Acceptance Scenarios**:

1. A graph coverage/status response never directs the agent to `query_graph`.
2. Search, trace, snippet, architecture, text search, status, coverage and
   change-detection tools advertise read-only, non-destructive behavior.
3. Repository indexing remains a private-state mutation and is not advertised
   as a read-only action.

### User Story 2 - Review Questions through one public owner (Priority: P1)

As a maintainer, I can use the existing public Hub workflow to list Questions
and turn one explicit exact-revision answer into a reviewable proposal.

**Independent Test**: The released Hub skill names both existing Question
actions, requires explicit maintainer input, inspects the resulting proposal
and preserves the existing Accept boundary.

**Acceptance Scenarios**:

1. An ordinary knowledge question remains owned by `agentbase-query` and does
   not mutate Question state.
2. An explicit Question-review request routes through `agentbase-hub`, lists
   bounded Questions and answers only the exact selected revision.
3. Answering creates a proposal for inspection; it does not implicitly Accept
   or Publish it.

### Edge Cases

- Upstream graph metadata remains incorrect: AgentBase's curated public
  descriptor wins without changing the pinned provider drift check.
- A Question revision changes before answer: the existing stale-revision
  failure remains visible and no accepted knowledge changes.
- A client ignores annotations: descriptions and skill boundaries remain
  sufficient guidance.

## Requirements

### Functional Requirements

- **FR-001**: The released MCP catalog MUST remain exactly 42 tools: 29 Hub,
  four schema/authoring and nine Code Graph actions.
- **FR-002**: No released public descriptor MUST direct an agent to an absent or
  retired AgentBase tool.
- **FR-003**: The eight non-indexing Code Graph actions MUST advertise
  read-only, non-destructive and idempotent behavior; `index_repository` MUST
  remain non-read-only and non-destructive.
- **FR-004**: Curated public metadata MUST NOT weaken exact pinned-provider
  schema drift validation or change forwarded arguments/results.
- **FR-005**: `agentbase-hub` MUST own `list_hub_questions` and
  `answer_hub_question` as an explicit review workflow.
- **FR-006**: Question answering MUST preserve exact revision, human
  attribution, proposal inspection and explicit Accept/Publish boundaries.
- **FR-007**: `agentbase-query` MUST remain read-only and MUST NOT resolve a
  Question.
- **FR-008**: The change MUST add no tool, dependency, model call, persistence,
  provider action or test case.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Official MCP listing reports 42 tools and zero references to the
  seven retired tool names.
- **SC-002**: All eight graph query/read descriptors have correct safety hints;
  indexing retains its distinct mutation hint.
- **SC-003**: All 42 released tools have a named released skill owner.
- **SC-004**: Canonical offline verification passes with the existing 50-test
  inventory and no model benchmark.

## Assumptions

- Tool annotations are advisory client metadata, not an authorization layer.
- The public Hub workflow is the smallest existing owner for Question review;
  no ninth released skill is needed.
- Preview/action and recovery tools remain separate because their current
  safety boundaries are intentional, not redundant.
