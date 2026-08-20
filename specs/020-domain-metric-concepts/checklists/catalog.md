# Catalog Requirements Checklist

**Purpose**: Review schema-boundary requirements before implementation
**Created**: 2026-08-19

## Requirement Clarity

- [X] CHK001 Is the distinction between reusable schemas and repository instances explicit? [Clarity, Spec §AB-SCHEMA-025]
- [X] CHK002 Is the one-concrete-type rule explicit for every instance? [Consistency, Spec §AB-SCHEMA-025]
- [X] CHK003 Are Domain Entity promotion boundaries defined to avoid class-by-class ingestion? [Coverage, Spec §AB-SCHEMA-026]
- [X] CHK004 Does Metric distinguish a stable definition from a volatile observation? [Clarity, Spec §AB-SCHEMA-027]

## Compatibility and Failure Coverage

- [X] CHK005 Is specialization behavior consistent with existing fallback selection? [Consistency, Spec §AB-SCHEMA-028]
- [X] CHK006 Are older known and foreign unknown types both covered? [Coverage, Spec §AB-SCHEMA-029]
- [X] CHK007 Are the exact live-reference target kinds exhaustive? [Completeness, Spec §AB-CLAIM-004]
- [X] CHK008 Is the root/category index distinction unambiguous? [Clarity, Spec §AB-MVP-023]

## Scope

- [X] CHK009 Are plugin loading, EC2 specialization and multi-schema composition explicitly excluded? [Scope]
- [X] CHK010 Is external benchmark/publication work explicitly excluded? [Scope]
