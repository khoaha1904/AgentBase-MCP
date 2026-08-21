# Bug Fix: Flow endpoint guidance permits embedded labels

- **Slug**: v15-flow-endpoint-guidance
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Flow guidance now says that both endpoints must resolve to supplied concept
identities and explicitly excludes embedded knowledge and free text.

## Changes

| File | Change | Notes |
|------|--------|-------|
| Flow schema definition/profile | modified | Added one additive endpoint rule. |
| Existing catalog test | modified | Pins the rule without a new test case. |
| OKF skill/current contracts | modified | Prevents promotion solely for Flow completion. |

## Tests Added or Updated

- Existing AB-SCHEMA catalog test asserts concept-only endpoints and exclusions.

## Local Verification

- Focused catalog tests: 5/5 pass.
- `npm run typecheck`: pass.
- `git diff --check`: pass.

## Deviations from Assessment

The existing OKF skill reference was also clarified because host authoring reads
it directly. No runtime scope expanded.

## Follow-ups

- Run the complete offline gate. A model benchmark requires separate approval.
