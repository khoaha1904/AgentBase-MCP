# Ingest Requirements Checklist: Single-Repository Initial Ingest

**Purpose**: Review evidence, safety, cutover and recovery requirement quality before implementation
**Created**: 2026-08-20
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 Are all five Initial Ingest stages and their entry/exit boundaries explicitly defined? [Completeness, Spec §AB-INGEST-003]
- [x] CHK002 Are the user confirmation, AI warning and final Domain authority responsibilities separated? [Completeness, Spec §AB-INGEST-002]
- [x] CHK003 Are stable identity and independent query/link value both required for every promoted candidate? [Completeness, Spec §AB-INGEST-005]
- [x] CHK004 Are valid partial, valid no-change and unsafe Incomplete outcomes each specified? [Completeness, Spec §AB-INGEST-007..008]

## Requirement Clarity

- [x] CHK005 Is “exact evidence” defined through an authorized repository reference rather than a graph summary? [Clarity, Spec §AB-INGEST-004]
- [x] CHK006 Is the one-repair limit objectively distinguishable from explicit later retry? [Clarity, Spec §AB-INGEST-003]
- [x] CHK007 Is the boundary between generic schema role and provider/source-tool metadata unambiguous? [Clarity, Spec §AB-SCHEMA-030..034]
- [x] CHK008 Is an observed snapshot explicitly non-current, optional and bounded? [Clarity, Spec §AB-CLAIM-005]

## Requirement Consistency

- [x] CHK009 Do Repository identity rules consistently treat path, name, remote and root commit as hints rather than canonical identity? [Consistency, Spec §AB-LOCAL-HUB-016]
- [x] CHK010 Does open-world foreign-type compatibility remain consistent with strict rejection of only the retired AgentBase authoring types? [Consistency, Spec §AB-SCHEMA-035]
- [x] CHK011 Are proposal preview and the explicit non-goals consistent about excluding Accept, Publish and provider CLI access? [Consistency, Spec §AB-INGEST-008, Non-Goals]

## Scenario and Edge-Case Coverage

- [x] CHK012 Are rename/transfer, fork ambiguity and weak same-name matching all addressed? [Coverage, Spec §Edge Cases]
- [x] CHK013 Are unsupported graph coverage and direct-source fallback distinguished from source mutation or cleanup uncertainty? [Coverage, Spec §User Story 3]
- [x] CHK014 Are absent/contradictory/future-facing documentation and Domain mismatches addressed before investigation? [Coverage, Spec §User Story 1, Edge Cases]
- [x] CHK015 Are unsupported provider mapping and Terraform indirection outcomes defined without invented metadata? [Coverage, Spec §AB-SCHEMA-031..033]

## Acceptance Criteria Quality

- [x] CHK016 Can exact-source coverage, deterministic repeatability, catalog/profile coverage and failure outcomes be measured independently? [Measurability, Spec §SC-001..004]
- [x] CHK017 Is real elapsed-time qualification separated from the deterministic offline gate with an exact run count and threshold? [Measurability, Spec §SC-005..006]

## Dependencies and Assumptions

- [x] CHK018 Is the clean-cutover assumption tied to the explicit absence of Published concepts and owner removal of obsolete proposals? [Assumption, Spec §Owner Decisions, Assumptions]
- [x] CHK019 Are existing graph/Hub primitives described as reusable but not allowed to override the newly approved product contract? [Assumption, Spec §Owner Decisions, Assumptions]
- [x] CHK020 Are pre-state guidance correction and post-state content repair specified as independent, single-use budgets? [Clarity, Spec §AB-INGEST-003]
- [x] CHK021 Does the contract distinguish sparse ambiguity from retryable input defects and fatal trust/state failures? [Coverage, Spec §AB-INGEST-003/007]

## Notes

- Review depth: formal pre-implementation owner/PR gate.
- Focus: evidence authority, generic catalog cutover, non-destructive proposal
  boundary and recoverable partial/failure behavior.
- All 21 requirement-quality questions pass against the current spec and plan.
