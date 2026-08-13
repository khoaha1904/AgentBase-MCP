# Security and Recovery Checklist: AgentBase Hub PR Lifecycle

**Purpose**: Review the credentialed Git/GitHub boundary before implementation

**Created**: 2026-08-12

## Authority

- [x] CHK001 Is Hub identity fixed outside user command input? [Spec FR-001]
- [x] CHK002 Are token permissions and forbidden operations explicit? [Spec FR-002, FR-011]
- [x] CHK003 Are prepare and submit separate authorization boundaries? [Spec FR-003, FR-009]
- [x] CHK004 Are target writes, force push, merge and remote deletion prohibited? [Spec FR-010–011]

## Secret handling

- [x] CHK005 Is token persistence forbidden in URLs, args, files, Git config, logs and receipts? [Spec FR-002]
- [x] CHK006 Does the plan identify bounded credential injection and cleanup? [Plan Decision 2]
- [x] CHK007 Do acceptance tests use canary secrets across every captured surface? [Spec SC-004]

## Git safety

- [x] CHK008 Are effective remote identity, hooks, submodules, dirty trees and URL rewrites covered? [Spec FR-004, Edge Cases]
- [x] CHK009 Is every proposal bound to an exact target commit and complete tree/diff digest? [Spec FR-005]
- [x] CHK010 Are concurrent proposals isolated by worktree/manifest? [Spec Edge Cases; Plan Decision 3]

## External lifecycle and recovery

- [x] CHK011 Is push-success/PR-failure represented as a durable non-secret phase? [Spec FR-012]
- [x] CHK012 Does retry require the same branch and exact commit? [Spec FR-012–013]
- [x] CHK013 Are duplicate/existing PR and conflicting remote states distinguishable? [Spec US3]
- [x] CHK014 Are cancellation and false-success prevention specified? [Spec FR-014]

## Knowledge preservation

- [x] CHK015 Are `new` and `refresh` preconditions distinct? [Spec FR-006–007]
- [x] CHK016 Are reviewed, unknown and ambiguously owned bytes protected? [Spec FR-007]
- [x] CHK017 Is layered Google OKF/schema validation required before submit? [Spec FR-008]

## Evidence boundary

- [x] CHK018 Is canonical verification credential-free and offline? [Spec FR-015]
- [x] CHK019 Does real GitHub qualification require separate explicit authority? [Spec FR-015]
- [x] CHK020 Are no new dependency, daemon or architecture exception planned? [Plan Constitution Check]
