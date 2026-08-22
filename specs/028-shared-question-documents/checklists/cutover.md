# Cutover Requirements Checklist: Shared Question Documents

**Purpose**: Reviewer gate for authority replacement and recovery requirements

**Created**: 2026-08-22

**Feature**: [spec.md](../spec.md)

## Authority and Atomicity

- [x] CHK001 Is there exactly one durable Question authority after cutover? [Consistency, AB-QUESTION-001/005]
- [x] CHK002 Does the specification forbid dual-write and permanent compatibility state? [Scope, Owner Decisions]
- [x] CHK003 Is Answer specified as one proposal rather than an early private mutation plus later Accept? [Clarity, AB-QUESTION-004]
- [x] CHK004 Are Question revision and Hub-head races covered without introducing a lock service? [Coverage, Edge Cases]

## Recovery and Preservation

- [x] CHK005 Is recovery from deleted machine-private state explicitly required? [Recovery, SC-001]
- [x] CHK006 Is accepted orphan Guidance blocked rather than silently discarded? [Recovery, AB-QUESTION-005]
- [x] CHK007 Are unaccepted private Questions explicitly excluded from migration? [Scope, Non-Goals]
- [x] CHK008 Are existing Git proposal recovery semantics reused? [Dependency, AB-QUESTION-004]

## Simplicity

- [x] CHK009 Are database, daemon, event ledger and universal claim model explicitly excluded? [Scope, Non-Goals]
- [x] CHK010 Is the existing lifecycle test reused instead of adding a test matrix? [Measurability, SC-004]
