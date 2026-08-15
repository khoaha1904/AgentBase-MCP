# Verification: Canonical OKF Graph

## Result

Capability 016 is complete offline. The implementation satisfies the approved
canonical-identity, cross-source lifecycle, useful-unit authoring and V5
assessment requirements without implementing the deferred question ledger or
cloud authority.

## Requirement evidence

| Requirement | Evidence |
|---|---|
| AB-SCHEMA-016–018 | Catalog 4.0.0, canonical path guidance, optional Domain and useful-unit selection tests |
| AB-LOCAL-HUB-012–013 | Logical canonical subjects, current-source cross-root refresh, foreign-source and protected-byte preservation tests |
| AB-BENCH-036–037 | Separate validity and `ownerReview`, hidden semantic probes, pinned source checks, substance/limitations/fragmentation findings and production metadata rejection |
| AB-BENCH-038 | Sequential frontend, backend and infrastructure Hub lifecycle test retaining one system identity and all sources |

Convergence found and closed two partial V5 gaps: shared manifest evidence can
no longer substitute for semantic anchors, and boundary schemas requiring a
Limitations section surface its absence to owner review.

## Verification command

`npm run verify`

Final result: specification checks, TypeScript, architecture checks and all 313
offline tests passed. Architecture reported only the seven retained review
warnings and no errors.

## Explicit limitations

- The first real V5 Shopping Cart run was useful for owner review but invalid
  because its root index used unsupported hyphen bullets. Immutable V6 corrects
  that prompt ambiguity; its rerun passed conformance but replaced an evidenced
  Business Flow with a Lambda and omitted one Limitations section. Immutable V7
  adds the general behavior-boundary and recommended-section rules. V7 run
  `2026-08-15T102132Z` is conformant, reviewable and useful for owner review;
  incomplete coverage remains diagnostic.
- Reference coverage remains non-exhaustive and cannot prove semantic truth.
- Question persistence, `/abs-questions`, AWS CLI authority and cloud resource
  enrichment remain future capabilities.
- Human review remains required before accepting generated OKF knowledge.
