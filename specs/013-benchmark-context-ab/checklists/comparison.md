# Paired Comparison Requirements Checklist: Benchmark Context A/B

**Purpose**: Review fairness, measurement, failure and interpretation requirements before implementation
**Created**: 2026-08-15
**Feature**: [spec.md](../spec.md)

## Comparison Fairness

- [x] CHK001 Are all common inputs that must match across arms named explicitly? [Completeness, Spec §AB-BENCH-009]
- [x] CHK002 Is the only permitted investigation-workflow difference between arms clear? [Clarity, Spec §AB-BENCH-010/011]
- [x] CHK003 Is the comparison described as complete-workflow evidence rather than isolated graph evidence? [Consistency, Spec §Assumptions]

## Measurement Semantics

- [x] CHK004 Are all expected token categories defined without treating missing data as zero? [Completeness, Spec §AB-BENCH-013]
- [x] CHK005 Is elapsed time required independently from token usage? [Completeness, Spec §AB-BENCH-012]
- [x] CHK006 Is observed investigation activity distinguished from complete source-read volume? [Clarity, Spec §AB-BENCH-014]
- [x] CHK007 Are quality and efficiency prohibited from collapsing into an unapproved winner score? [Consistency, Spec §AB-BENCH-015]

## Failure and Reproducibility

- [x] CHK008 Does one-arm failure retain both arms' available evidence? [Recovery, Spec §AB-BENCH-016]
- [x] CHK009 Are timeout, malformed usage, source drift and missing output covered? [Coverage, Spec §Edge Cases]
- [x] CHK010 Are fixture, AgentBase, agent and prompt identities sufficient to interpret a later run? [Traceability, Spec §AB-BENCH-012]

## Scope and Acceptance

- [x] CHK011 Is real paired execution explicitly excluded from canonical verification? [Consistency, Spec §AB-BENCH-017]
- [x] CHK012 Are prompt/schema/scorer improvements and provider comparison excluded from this capability? [Scope, Spec §Non-goals]
- [x] CHK013 Can a fake executable prove arm isolation and complete/incomplete comparison behavior? [Measurability, Spec §SC-001-004]
- [x] CHK014 Is one real `aws-health-aware` pair framed as bounded evidence rather than a universal claim? [Interpretation, Spec §SC-005]
