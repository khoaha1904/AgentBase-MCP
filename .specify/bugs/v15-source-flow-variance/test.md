# Bug Verification: V15 source and Flow selection variance

- **Slug**: v15-source-flow-variance
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

Released guidance now exposes both source priority and the independent Flow
endpoint boundary. Focused and full offline gates pass with no regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Guidance reproduction | Inspect released Flow schema guidance | pass | Single contained Function is explicitly insufficient. |
| Updated tests | `node --test --experimental-strip-types src/core/knowledge/schemas/catalog.test.ts src/core/knowledge/schemas/guidance.test.ts` | pass | 13/13 passed. |
| Regression suite | `npm run verify` | pass | 50/50 design-level tests passed. |
| Static/security gates | `npm run verify` | pass | Spec, typecheck, dependencies, Knip, Gitleaks and diff checks passed. |

## Output Excerpts

```text
✔ [AB-SCHEMA-030][AB-SCHEMA-038][AB-SCHEMA-044]
ℹ tests 50
ℹ pass 50
ℹ fail 0
```

## Residual Risks

- Guidance cannot prove that the model inspected every supported source; a real
  sequential probe remains necessary.
- Independently evidenced external boundaries may still justify a Flow around a
  single runtime, as intended.

## Recommendation

Close the offline bug and run one sequential probe. Run a stability replica only
after a clean probe.
