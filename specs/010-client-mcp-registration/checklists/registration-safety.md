# Registration Safety Requirements Checklist: Client MCP Registration

**Purpose**: Review whether machine-configuration, coexistence and recovery requirements are complete and unambiguous
**Created**: 2026-08-13
**Feature**: [spec.md](../spec.md)

## Authority and Scope

- [x] CHK001 Is user-global scope specified for both clients while project/team scopes are explicitly excluded? [Completeness, Spec §Owner Decisions/FR-001]
- [x] CHK002 Is installer ownership limited to the exact `agentbase` entry newly added by its transaction? [Clarity, Spec §Assumptions]
- [x] CHK003 Are unselected clients and non-interactive runs explicitly mutation-free? [Coverage, Spec §US1/FR-001/FR-010]
- [x] CHK004 Is checkout movement defined as a visible conflict rather than implicit repointing? [Edge Case, Spec §US2]

## Existing and Concurrent Configuration

- [x] CHK005 Are exact, absent, conflicting and uninspectable entry states defined with distinct outcomes? [Completeness, Spec §US2/FR-004]
- [x] CHK006 Is exact comparison bounded to effective launcher, arguments, transport and scope? [Clarity, Spec §Owner Decisions/Key Entities]
- [x] CHK007 Are unrelated client settings required to survive success and rollback? [Consistency, Spec §US2/FR-007]
- [x] CHK008 Is snapshot restore forbidden unless current state matches the known post-mutation identity? [Recovery, Spec §FR-007]

## Failure and Recovery

- [x] CHK009 Does preflight cover every selected client before the first mutation? [Completeness, Spec §FR-003]
- [x] CHK010 Is all-selected transactional behavior consistent across add failure, verification failure and interruption? [Consistency, Spec §US3/FR-006]
- [x] CHK011 Is next-run recovery specified for interruption that cannot be handled in-process? [Recovery, Spec §US3/FR-008]
- [x] CHK012 Are malformed, unsafe, stale and checkout-mismatched receipts addressed? [Edge Case, Spec §Edge Cases/FR-008]
- [x] CHK013 Is unresolved rollback required to preserve concurrent bytes and expose bounded recovery guidance? [Safety, Spec §US3/SC-004]

## Secrets and Verification

- [x] CHK014 Is the token explicitly excluded from launcher entries, receipts and error output? [Security, Spec §FR-009/FR-010]
- [x] CHK015 Is credential persistence explicitly independent from client-registration rollback? [Clarity, Spec §Owner Decisions/FR-010]
- [x] CHK016 Does canonical evidence cover every selection and failure/recovery class without real client mutation? [Measurability, Spec §FR-011/SC-005]
- [x] CHK017 Is a real machine-wide smoke action explicitly outside the canonical gate and separately authorized? [Boundary, Spec §Explicit Non-goals/SC-005]

## Architecture Quality

- [x] CHK018 Is the new responsibility boundary justified by an independent reason to change rather than a line-count target? [Architecture, Plan §Project Structure]
- [x] CHK019 Does the plan state when to retain a cohesive file with an exact reviewed mark instead of producing forwarding fragments? [Architecture, Plan §Structure Decision]
