# Foundation Requirements Checklist

**Purpose**: Review architecture-preservation, deletion and gate requirements
before implementation

**Created**: 2026-08-20

**Audience**: Owner and implementation reviewer

## Requirement Completeness

- [x] CHK001 Are all useful architecture behaviors preserved explicitly while
  every removed metric behavior is named? [Completeness, Spec §AB-FND-011..013]
- [x] CHK002 Are dead-code and secret-tool scopes, exclusions and missing-tool
  behavior defined? [Completeness, Spec §AB-FND-020..022]
- [x] CHK003 Is the absence of runtime, Hub, Code Graph and OKF changes explicit?
  [Scope, Spec §Non-Goals]

## Requirement Clarity and Consistency

- [x] CHK004 Is “public entrypoint” objectively defined as the target
  capability's `index.ts`? [Clarity, Verification Contract]
- [x] CHK005 Do the spec and plan consistently remove the custom registry and
  metric baseline without removing the architecture ownership document?
  [Consistency, Spec §Owner Decisions]
- [x] CHK006 Is native-tool ownership distinct from AgentStack repository
  dependency or copied engine code? [Clarity, Spec §Owner Decisions]

## Failure and Recovery Coverage

- [x] CHK007 Are parse failure, native-tool absence and individual gate failure
  specified as visible non-zero outcomes? [Coverage, Spec §Edge Cases]
- [x] CHK008 Is recovery non-mutating and tied to the exact pre-change
  checkpoint? [Recovery, Quickstart §Recovery]
- [x] CHK009 Are secret findings required to be redacted and never silently
  skipped? [Safety, Spec §AB-FND-021]

## Acceptance Quality

- [x] CHK010 Can cycle, reverse-layer, private-import and allowed-public-import
  behavior be independently demonstrated? [Measurability, SC-002]
- [x] CHK011 Can removal of the custom engine be verified by exact absent files
  and absence of replacement metrics? [Measurability, SC-003]
- [x] CHK012 Does the canonical success criterion require the complete offline
  gate rather than individual tools alone? [Coverage, SC-005]
