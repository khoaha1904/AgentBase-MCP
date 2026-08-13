# Requirements Checklist: Local Hub Lifecycle and Migration

**Purpose**: Review whether lifecycle, schema and two-repository migration requirements are complete before implementation
**Created**: 2026-08-12
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 Are the boundaries between prepare, accept, query, publish and synchronize specified as separate user authorizations? [Completeness, Spec FR-003/FR-011]
- [x] CHK002 Are local active knowledge, remote accepted base and unaccepted workspace defined without overlap? [Clarity, Spec FR-002..FR-005]
- [x] CHK003 Are pending proposal identity, ordering, ancestry and publication states fully specified? [Completeness, Spec FR-004/FR-010]
- [x] CHK004 Are both Code Graph and Hub query responsibilities documented, including questions that legitimately use both? [Coverage, Spec FR-014]
- [x] CHK005 Are concrete schema selection, repeated instances, unused schemas and unknown existing types covered? [Completeness, Spec FR-006..FR-009]

## Requirement Clarity

- [x] CHK006 Is “dependency-safe selection” narrowed to an objectively testable rule for the initial implementation? [Clarity, Spec FR-011; Plan Phase D]
- [x] CHK007 Is “most specific admitted type” backed by deterministic catalog specificity and evidence criteria? [Clarity, Spec FR-009]
- [x] CHK008 Is the meaning of “queryable immediately” tied to accepted local commits and exclusion of workspace bytes? [Clarity, Spec FR-005]
- [x] CHK009 Are official product identity and source-subject identity distinguished so an explicitly named source repository is not incorrectly rejected? [Clarity, Spec FR-001/FR-015]

## Consistency and Authority

- [x] CHK010 Do local-main acceptance requirements remain consistent with the prohibition on direct remote-main writes? [Consistency, Spec FR-003/FR-011]
- [x] CHK011 Do publication and synchronization requirements preserve the constitution's proposal/review and no-implicit-destruction rules? [Consistency, Constitution IV]
- [x] CHK012 Are remote rename, local directory creation, launcher cutover and cleanup consistently separate authorization scopes? [Consistency, Spec FR-015/FR-016]
- [x] CHK013 Does the living-spec supersession plan distinguish corrected behavior from historical Capability 007 evidence? [Traceability, Plan Product corrections]

## Scenario and Recovery Coverage

- [x] CHK014 Are dirty local Hub, wrong remote, symlink, destination collision and ambiguous ancestry behaviors specified before mutation? [Coverage, Spec Edge Cases/FR-017]
- [x] CHK015 Are PR failure, closed-without-merge, merge commit, cherry-pick equivalence and remote drift addressed or explicitly deferred? [Coverage, Spec Edge Cases]
- [x] CHK016 Are synchronization conflict and interruption requirements sufficient to prove zero dropped local proposal commits? [Recovery, Spec FR-013/SC-004]
- [x] CHK017 Is an exact rollback source defined for every filesystem, remote and MCP configuration migration step? [Recovery, Contract repository-migration]
- [x] CHK018 Are manual Hub edits given an explicit admissible path or a clear fail-closed requirement? [Edge Case, Spec Assumptions]

## Acceptance Criteria Quality

- [x] CHK019 Can the zero-remote-write local acceptance outcome be objectively measured? [Measurability, SC-001]
- [x] CHK020 Can multi-repository pending selection and one-PR publication be verified without GitHub network access? [Measurability, SC-002/SC-007]
- [x] CHK021 Can the schema fixture prove both concrete-type selection and absence of placeholder output? [Measurability, SC-005]
- [x] CHK022 Can naming checks distinguish active accidental identities from historical evidence and explicit source names? [Measurability, SC-006]

## Dependencies and Assumptions

- [x] CHK023 Is the assumption of one serialized local Hub owner reflected in concurrency and locking requirements? [Assumption, Spec Assumptions]
- [x] CHK024 Is the absence of an AgentBase-MCP remote treated as a preflight finding rather than silently solved? [Dependency, Contract repository-migration]
- [x] CHK025 Is preservation of the dirty legacy Hub worktree mandatory throughout canonical clone creation? [Dependency, Spec FR-015]
- [x] CHK026 Is the first concrete catalog explicitly bounded so legacy schema breadth cannot silently expand implementation scope? [Scope, Spec FR-007/Assumptions]
