# Feature Specification: End-to-end AIT Qualification

**Status**: Runner implemented; pair `2026-08-29T05-45-00Z` is `needs_review` and owner review is pending.

## Objective

Compare a complete minimal AIT lifecycle from Feature to User Story to Tasks
with and without AgentBase, using identical inputs and a single AWS/Terraform
fixture.

## Requirements

- **FR-001**: Both arms receive the same Feature, permitted tracker context,
  prompt, model, output schema and pinned source revision.
- **FR-002**: Existing User Story `us:health-endpoint` is not read; each arm
  must draft its own User Story from the Feature.
- **FR-003**: Only the assisted arm receives bounded Published Hub and local
  Code Graph tools. It binds one clean repository and never mutates/publishes
  source or Hub.
- **FR-004**: Output contains Feature summary, User Story, ordered Tasks,
  questions, unknowns and traceable evidence references.
- **FR-005**: Critical/important/optional scoring and owner review remain
  separate from efficiency telemetry.
- **FR-006**: No public skill, MCP tool, context packet or query subsystem is
  added by this benchmark.

## Success criteria

Deterministic tests prove tool/input isolation and output traceability. A real
pair is retained as `needs_review`, `needs_revision` or `incomplete`; this one
fixture cannot claim universal AIT quality.
