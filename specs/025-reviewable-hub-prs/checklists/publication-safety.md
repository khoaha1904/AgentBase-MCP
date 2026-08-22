# Publication Safety Requirements Checklist: Reviewable Hub Pull Requests

**Purpose**: Validate credential, identity and recovery requirement quality

**Created**: 2026-08-22

**Feature**: [spec.md](../spec.md)

## Authority and secrets

- [x] CHK001 Is the sole component allowed to push and create PRs explicitly defined? [Completeness, Spec §AB-PUBLISH-001]
- [x] CHK002 Are token arguments, storage and output exclusions explicit? [Clarity, Spec §AB-PUBLISH-005]
- [x] CHK003 Are merge, force-push, deletion and retarget operations explicitly excluded? [Coverage, Spec §AB-PUBLISH-008]

## Identity and compatibility

- [x] CHK004 Are repository, base, head and commit identity checks all specified? [Completeness, Spec §AB-PUBLISH-008]
- [x] CHK005 Is behavior for older commits without mode metadata defined? [Edge Case, Spec §US2]
- [x] CHK006 Is fallback from stack eligibility to existing batch behavior unambiguous? [Consistency, Spec §AB-PUBLISH-007]

## Recovery

- [x] CHK007 Is interrupted retry behavior defined for both branches and PRs? [Coverage, Spec §AB-PUBLISH-009]
- [x] CHK008 Is partial stack failure explicitly non-destructive and observable? [Clarity, Spec §AB-PUBLISH-009]
- [x] CHK009 Are conflicting and duplicate remote identities defined as failures? [Edge Case, Spec §AB-PUBLISH-008]
- [x] CHK010 Is canonical verification explicitly credential-free and offline? [Measurability, Spec §AB-PUBLISH-010]
