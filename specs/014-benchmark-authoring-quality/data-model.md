# Data Model: Evidence-First Benchmark Readiness

## Authoring assessment

- `status`: `reviewable` or `invalid`
- `hardFailures`: stable ordered descriptions of deterministically proven
  lifecycle, structure, policy, provenance, relationship or contradiction errors
- `limitations`: what the benchmark cannot prove automatically
- `reviewable` means suitable for human review, never automatically accepted

## Reference classification

- `confirmedConcepts`: recognized authored identities whose concrete schemas
  agree with curated reference evidence
- `contradictedConcepts`: recognized identities with a known schema/fact conflict
- `unjudgedConcepts`: authored identities outside the non-exhaustive reference
- `missingReferenceConcepts`: reference identities not authored
- Equivalent confirmed/contradicted/unjudged/missing groups for relationships

An authored item belongs to exactly one classification. `unjudged` is not false.
`missing` is not an authoring error.

## Coverage diagnostics

- reference concept recall
- schema agreement among recognized identities
- expected metadata-field coverage
- expected provenance-path coverage
- expected relationship coverage
- unjudged concept/relationship counts as human review burden

Diagnostics never produce an automatic completeness threshold.

## Integrity evidence

- OKF conformance and draft/schema policy results
- non-empty concept count
- normalized repository source identity/path checks
- declared relationship target/link resolution
- relationship-kind agreement with known source schema guidance

Integrity failures feed `hardFailures`.

## Efficiency evidence

Existing elapsed time, token usage and activity remain unchanged. They are
reported beside, not inside, authoring assessment.

## State flow

```text
immutable arm artifacts
  -> load and validate
  -> classify against non-exhaustive reference
  -> compute coverage diagnostics
  -> derive reviewable or invalid
  -> report quality and efficiency separately
  -> human review remains required
```
