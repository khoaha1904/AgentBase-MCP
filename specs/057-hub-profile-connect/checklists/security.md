# Security Requirements Checklist: AgentBase CLI Surface and Hub Connect

**Purpose**: Review credential authority, secret handling and failure recovery requirements before implementation
**Created**: 2026-08-29
**Feature**: [spec.md](../spec.md)

## Credential Authority

- [x] CHK001 Is token entry restricted to an owner-private masked terminal prompt? [Completeness, Spec §FR-007]
- [x] CHK002 Is blank-input reuse of the shared owner token unambiguous? [Clarity, Spec §FR-007]
- [x] CHK003 Are automatic login, token minting, scope changes and account selection explicitly excluded? [Coverage, Spec §Assumptions]
- [x] CHK004 Are GitHub CLI lookup and ambient credential fallback excluded? [Consistency, Spec §Owner Decisions]

## Secret Handling

- [x] CHK005 Are every forbidden token disclosure surface named, including chat, tool input, argv, output, errors, Git and shared files? [Completeness, Spec §FR-009]
- [x] CHK006 Is the credential storage authority bound to one owner-private shared default rather than Hub data? [Clarity, Spec §Key Entities]
- [x] CHK007 Can secret-safety acceptance be objectively measured as zero token matches? [Measurability, Spec §SC-004]
- [x] CHK008 Are authenticated URLs, arbitrary credential commands and token arguments explicitly out of scope? [Coverage, Contract §Forbidden inputs]

## Failure and Recovery

- [x] CHK009 Is activation ordered after credential, remote and Hub validation without ambiguity? [Clarity, Spec §FR-008]
- [x] CHK010 Does the spec distinguish reported failure rollback from uncatchable process termination? [Clarity, Spec §FR-008]
- [x] CHK011 Is retained credential behavior after uncatchable termination explicitly safe and bounded? [Recovery, Spec §Edge Cases]
- [x] CHK012 Does a failed replacement restore the previous shared token? [Safety, Spec §FR-008]
- [x] CHK013 Are non-interactive setup, missing token, malformed token, permission denial, invalid branch and invalid Hub all covered? [Exception Coverage, Spec §Edge Cases]

## Isolation and Non-Goals

- [x] CHK014 Is cross-profile draft/knowledge movement explicitly prohibited? [Consistency, Spec §FR-010]
- [x] CHK015 Are synchronization, publication, bootstrap and every knowledge mutation excluded from connect? [Scope, Spec §FR-010]
- [x] CHK016 Are storage migration, new MCP surface, dependency, daemon and crash journal explicitly excluded? [Scope, Spec §Assumptions]

## Notes

- Standard depth for security/PR review. All requirement-quality checks pass after clarifying abrupt-termination behavior.
