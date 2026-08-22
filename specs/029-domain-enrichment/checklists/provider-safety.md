# Requirements Checklist: Provider Authority and Recovery

**Purpose**: Review requirement quality at the AWS/provider trust boundary

**Created**: 2026-08-22

**Feature**: [spec.md](../spec.md)

## Authority Completeness

- [x] CHK001 Are user-owned login and explicit session/account/region
  confirmation distinguished from MCP authority? [Completeness, AB-ENRICH-002]
- [x] CHK002 Are credentials, profile/config mutation and CLI defaults explicitly
  excluded as knowledge inputs? [Coverage, AB-ENRICH-002]
- [x] CHK003 Is account mismatch behavior specified before any resource access?
  [Exception, AB-ENRICH-003]
- [x] CHK004 Are remote Hub token authority and provider CLI authority kept
  separate? [Consistency, Spec §Owner Decisions]

## Invocation Clarity

- [x] CHK005 Are released operation, typed input, fixed argv and read-only bounds
  unambiguous? [Clarity, AB-ENRICH-003]
- [x] CHK006 Are account/service/region enumeration and arbitrary command/flag
  execution explicitly prohibited? [Coverage, AB-ENRICH-003]
- [x] CHK007 Are regional and global-resource scope rules distinguishable, with
  no fallback to an implicit region? [Clarity, AB-ENRICH-002/005]
- [x] CHK008 Is the initial supported provider/resource surface exact rather than
  implying AWS-wide support? [Scope, Spec §Assumptions/Non-Goals]

## Data Safety

- [x] CHK009 Are the minimum normalized observation fields and integrity binding
  specified? [Completeness, AB-ENRICH-004]
- [x] CHK010 Are raw output, credential context and secret-like values excluded
  from proposal, Hub and diagnostics? [Coverage, AB-ENRICH-004]
- [x] CHK011 Is all-or-nothing admission defined for malformed, oversized or
  unsafe provider output? [Recovery, AB-ENRICH-004/010]
- [x] CHK012 Are provider observations explicitly time-bound evidence rather than
  timeless current truth? [Consistency, Spec §Assumptions]

## Matching and Human Authority

- [x] CHK013 Are endpoint identity and interaction evidence specified as
  independent requirements? [Clarity, AB-ENRICH-005]
- [x] CHK014 Are name-only and same-name cross-account/region collisions covered
  without false canonical joins? [Edge Case, SC-003]
- [x] CHK015 Are automatic factual outcomes separated from semantic human
  decisions and Maintainer Guidance? [Authority, AB-ENRICH-007]
- [x] CHK016 Is automatic concept merge excluded even after a strong provider
  identity match? [Scope, AB-ENRICH-008]

## Failure and Recovery

- [x] CHK017 Are unresolved knowledge and failed attempts distinguished with
  objective terminal/retry behavior? [Clarity, AB-ENRICH-006/010]
- [x] CHK018 Are partial-run visibility, explicit retry and membership revision
  requirements complete? [Recovery, AB-ENRICH-006/008]
- [x] CHK019 Are base, evidence, manifest and Question revision drift addressed
  before proposal mutation? [Exception, AB-ENRICH-009]
- [x] CHK020 Are real-provider and model qualification separated from the
  deterministic offline acceptance gate? [Dependency, SC-007]
