# Lifecycle Requirements Checklist: Local-first Hub Control

**Purpose**: Review configuration, recovery and release requirements before implementation
**Created**: 2026-08-23

## Requirement Completeness

- [x] CHK001 Are local-only creation boundaries specified for both mutating and read-only entrypoints? [Completeness, Spec §FR-001]
- [x] CHK002 Are identity, checkout and credential isolation requirements defined together? [Completeness, Spec §FR-002..004]
- [x] CHK003 Are both public and Enterprise GitHub origin requirements documented? [Completeness, Spec §FR-005]
- [x] CHK004 Are migration requirements present for existing drafts and recovery state? [Completeness, Spec §FR-011]

## Requirement Clarity and Consistency

- [x] CHK005 Is one-active-profile consistent with reusable inactive profiles and no simultaneous query? [Consistency, Spec §FR-003, Assumptions]
- [x] CHK006 Is local internal branch behavior distinct from configured remote target behavior? [Clarity, Spec §FR-006]
- [x] CHK007 Is read-only status clearly separated from explicit synchronization? [Clarity, Spec §FR-007..009]
- [x] CHK008 Are Published authority and remote candidate defined without overlapping ownership? [Clarity, Spec §Key Entities]

## Recovery and Security Coverage

- [x] CHK009 Are fetch, replay conflict and recovery preservation requirements all explicit? [Recovery, Spec §FR-009..011]
- [x] CHK010 Are missing credential, denied permission and unreachable remote represented as partial failures? [Exception, Spec §Edge Cases]
- [x] CHK011 Does the credential contract prohibit every model, tool, config and Git URL exposure path? [Security, Spec §FR-004]
- [x] CHK012 Is TLS trust responsibility explicit without permitting verification bypass? [Security, Spec §Assumptions]

## Acceptance and Scope

- [x] CHK013 Can profile isolation be objectively proven across repeated switching? [Measurability, Spec §SC-002]
- [x] CHK014 Can status resilience be objectively proven for each partial-failure class? [Measurability, Spec §SC-003]
- [x] CHK015 Are real, captured-provider and deferred qualification outcomes required to remain distinguishable? [Scope, Spec §FR-013, SC-007]
- [x] CHK016 Are daemon, hidden pull, concurrent multi-Hub query and cross-Hub merge explicitly excluded? [Boundary, Spec §FR-012, Assumptions]
