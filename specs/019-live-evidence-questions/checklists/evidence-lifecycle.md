# Evidence Lifecycle Requirements Checklist: Live Evidence Questions

**Purpose**: Review freshness, provenance and governed-question requirements before implementation

**Created**: 2026-08-17

**Feature**: [spec.md](../spec.md)

## Provenance and freshness

- [x] CHK001 Is a volatile source observation explicitly separated from a durable business policy or maintainer decision? [Clarity, AB-CLAIM-002/003]
- [x] CHK002 Does every live reference identify repository, normalized source, semantic target and authored source identity without storing the volatile scalar? [Completeness, AB-CLAIM-002]
- [x] CHK003 Is current repository authority explicit, with repository mismatch and dirty/ambiguous source behavior defined? [Coverage, AB-QUERY-006; Edge Cases]
- [x] CHK004 Does unavailable resolution forbid fallback to an earlier observed value? [Consistency, AB-QUERY-008]
- [x] CHK005 Are documentation, implementation/configuration and maintainer guidance always labeled separately when they disagree? [Clarity, AB-QUERY-007]
- [x] CHK006 Is automatic truth selection excluded across requirements, success criteria and qualification? [Consistency, AB-CLAIM-001; Non-Goals]

## Question lifecycle and recovery

- [x] CHK007 Is equivalent-question reuse defined without losing newly linked claims or missing-evidence descriptions? [Completeness, AB-QUESTION-001]
- [x] CHK008 Can unaccepted/rejected evidence avoid creating durable question state? [Recovery, Research §Admit questions]
- [x] CHK009 Does answering require explicit human attribution and stale-revision rejection? [Clarity, AB-QUESTION-003; Edge Cases]
- [x] CHK010 Is the answer durable as user evidence while shared Maintainer Guidance still requires normal inspect/accept? [Consistency, AB-QUESTION-004]
- [x] CHK011 Do process restart, incomplete ingest and source disappearance preserve claims, question history and guidance without implicit deletion? [Coverage, AB-QUESTION-005; AB-REFRESH-013]
- [x] CHK012 Is concurrent Hub/question mutation required to fail safely without losing the pending question or answer? [Recovery, Edge Cases]

## Scope and qualification

- [x] CHK013 Is the first implementation bounded to one explicitly admitted repository per MCP connection? [Scope, Assumptions; Plan]
- [x] CHK014 Are parser/evaluator, watcher, network discovery, source mutation and PR rebuild explicitly outside this slice? [Scope, Non-Goals; Plan]
- [x] CHK015 Can offline tests prove changed-source, unavailable-source, conflict, answer, restart and incomplete-ingest behavior without a model call? [Measurability, SC-001..007]
- [x] CHK016 Is V11 retained as 018 evidence while 019 qualification avoids requiring persisted numeric snapshots or a V12 run? [Consistency, AB-BENCH-042; Owner Decisions]

## Notes

All checks pass. The plan intentionally treats live value extraction as an
agent-orchestrated use of existing bounded MCP graph/snippet tools; it does not
introduce a universal source evaluator.
