# Bootstrap Safety Requirements Checklist

**Purpose**: Review requirement quality for lazy authority, direct-main bootstrap and partial-failure recovery
**Created**: 2026-08-13
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 Are no-Hub behaviors specified separately for installation, Code Graph and Hub-dependent OKF actions? [Completeness, Spec FR-001..003]
- [x] CHK002 Are both existing-Hub and new-local-Hub setup outcomes fully defined? [Completeness, Spec FR-004..008]
- [x] CHK003 Are both first-publication modes and the zero-knowledge variant specified? [Completeness, Spec FR-010..012]
- [x] CHK004 Are active-configuration replacement and multi-Hub switching explicitly bounded? [Scope, Spec Non-goals]

## Identity and Authority Clarity

- [x] CHK005 Is base identity distinguished from proposal/knowledge identity without positional inference? [Clarity, Spec FR-007]
- [x] CHK006 Is the accepted GitHub URL authority exact and credential-free? [Clarity, Spec FR-004/FR-009]
- [x] CHK007 Is the only direct-remote-main exception limited to an explicit first bootstrap of an empty repository? [Consistency, Spec FR-009..012]
- [x] CHK008 Are token location, single-token use and prohibited disclosure surfaces explicit? [Security, Spec FR-015]

## Exception and Recovery Coverage

- [x] CHK009 Are clone/init interruption outcomes defined before configuration admission? [Recovery, Spec FR-005/FR-006]
- [x] CHK010 Are empty-remote race and populated-remote behavior defined before push? [Coverage, Spec FR-009/Edge Cases]
- [x] CHK011 Are every post-main-push retry invariant and drift rejection specified? [Recovery, Spec FR-013/FR-014]
- [x] CHK012 Are read, contents and pull-request permission failures recoverable without local knowledge loss? [Coverage, Spec US5/FR-015]

## Acceptance Quality

- [x] CHK013 Can every setup state and transition be objectively observed? [Measurability, SC-001..003]
- [x] CHK014 Can exact base/knowledge remote refs and PR counts prove both modes? [Measurability, SC-004]
- [x] CHK015 Can retry idempotence and zero changed-main repush be measured at all checkpoints? [Measurability, SC-005]
- [x] CHK016 Are safety fixtures bounded to offline/fake authority for the canonical gate? [Consistency, SC-006/SC-007]
