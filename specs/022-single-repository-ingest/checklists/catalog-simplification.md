# Catalog Simplification Requirements Checklist

**Purpose**: Validate catalog-7 boundary and migration requirements before implementation
**Created**: 2026-08-21
**Feature**: [spec.md](../spec.md)

## Boundary clarity

- [x] CHK001 Is technology detection explicitly separated from concept promotion and rendering? [Clarity, AB-SCHEMA-031..036]
- [x] CHK002 Is standalone promotion defined by independent query/operational/contract value rather than resource existence? [Clarity, AB-INGEST-005, AB-SCHEMA-037]
- [x] CHK003 Are Lambda/function and EC2/workload boundaries specified independently? [Coverage, AB-SCHEMA-033, AB-SCHEMA-038]
- [x] CHK004 Are SQS, SNS, event-bus, data and hosting resources embedded by default? [Completeness, AB-SCHEMA-037]

## Output and recovery

- [x] CHK005 Is embedded knowledge required to remain searchable, human-readable and provenance-bearing without becoming a graph node? [Completeness, AB-SCHEMA-039]
- [x] CHK006 Is later promotion allowed without implicit deletion or automatic demotion of accepted knowledge? [Consistency, Constitution IV]
- [x] CHK007 Are ambiguous or unsupported promotion decisions required to remain limitations/questions rather than invented concepts? [Recovery, AB-SCHEMA-036]

## Compatibility and qualification

- [x] CHK008 Is the clean catalog cutover justified by the absence of Published catalog-6 concepts? [Assumption]
- [x] CHK009 Are unsafe automatic aliases from Queue/Server/Table to Resource explicitly excluded? [Migration]
- [x] CHK010 Does qualification measure required concepts and embedded knowledge without enforcing one file per cloud resource? [Measurability, SC-007]

## Notes

- All owner-visible decisions are settled; no clarification marker remains.
- This is a major authoring cutover, not a prompt-only correction.
