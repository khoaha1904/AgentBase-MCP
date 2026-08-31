# Feature Specification: Refresh preflight topology

**Feature Branch**: `feature/refresh-change-accounting`

**Created**: 2026-08-31

**Status**: Complete

**Input**: Correct the two runtime gaps exposed by the Crawler C1 benchmark:
source-revision validation happened only at Finalize, and new standalone
Resources could remain isolated from the Domain projection.

## Contract Delta

- **Change classification**: bounded authoring-validation behavior.
- **Product Contract**: `docs/product/07-ai-sdlc-context.md` already requires
  sourced relationships useful to Feature Discovery impact views; no product
  scope changes.
- **Architecture Contract**: `docs/architecture/flows.md` retains the existing
  Prepare → Validate → Finalize ownership and adds no tool or state authority.
- **Capability Contract**:
  `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`,
  `docs/capabilities/09-ingest-and-refresh/02-refresh-and-change-detection.md`
  and `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`.
- **Stable requirements**: `AB-SCHEMA-056`, `AB-REFRESH-017..018`.
- **Baseline commit**: `c2fe125d91e6154891e37a8344abc719747ab71c`.
- **Supersedes**: no earlier requirement; this follows capability 066 evidence.

## Owner Decisions

- Keep the existing `validate_okf_changes` tool and add an optional prepared
  session binding; do not add another MCP tool.
- Session-bound validation must catch source revision/source-ID defects before
  the workflow spends its single Finalize call.
- A new known standalone concept must reach a Repository or Domain through an
  evidenced relationship admitted by its exact schema. For Resource, that path
  is `implemented-in -> Repository`; unsupported candidates may stay embedded
  or limited instead of broadening the schema.
- Do not change Published projection rules, Accept, Publish, provider access,
  source discovery breadth or Hub schema.
- After deterministic verification, use the same isolated C1 to expose and
  correct bounded preflight defects. Do not run C2 unless C1 passes lifecycle,
  feature recall and topology.

## User Scenarios & Testing

### User Story 1 - Repair before Finalize (Priority: P1)

As the Refresh author, I receive an actionable validation error for a reused
repository source ID before the one final proposal lock attempt.

**Independent Test**: Bind changed-set validation to a prepared Refresh session
whose changed concept moves one source to a new observed revision without a new
ID; validation fails, then succeeds after the ID is changed.

### User Story 2 - Keep important new nodes reachable (Priority: P1)

As a later AIT consumer, a newly promoted feature concept is structurally
reachable from its Repository/Domain instead of existing only as searchable
Markdown prose.

**Independent Test**: A new Resource without a structural path fails session
validation; adding an evidenced `implemented-in -> Repository` relation passes
and includes the Resource in the deterministic Domain projection.

## Requirements

- **FR-001**: `validate_okf_changes` MUST accept an optional prepared
  `session_id` without changing standalone validation behavior.
- **FR-002**: Session-bound validation MUST apply the same repository source
  revision/source-ID invariant that Finalize applies to the authored bundle,
  including when a reused ID also changes its source span.
- **FR-003**: Refresh validation MUST reject a new known standalone concept that
  has no evidenced structural path to a Repository or Domain.
- **FR-004**: Validation failure MUST leave the prepared workspace editable and
  MUST NOT consume or invoke Finalize.
- **FR-007**: Changed-set and session validation MUST both run before returning
  so one response exposes their combined repairable failures.
- **FR-005**: The packaged Refresh workflow MUST pass the prepared session ID to
  validation and still call Finalize at most once.
- **FR-006**: The change MUST add no tool, dependency, provider call, Accept,
  Publish, schema migration or broader discovery pass.

## Success Criteria

- **SC-001**: Focused regression tests reproduce and reject both C1 defects.
- **SC-002**: Corrected fixtures pass session validation and final validation.
- **SC-003**: The fresh C1 run calls Finalize once, recalls all three critical
  feature facts and gives both new Resources a structural Repository path.
- **SC-004**: `npm run verify` passes before the fresh model run.
