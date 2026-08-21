# Bug Verification: Duplicate category index entries pass validation

- **Slug**: v15-duplicate-index-entries
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The observed duplicate-target reproduction is rejected by the shared loader,
the restored proposal still completes Finalize, and the full repository gate
has no regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Existing Initial Ingest lifecycle test appends equivalent `publisher.md` and `./publisher.md` targets | pass | Raises actionable `duplicate index target`. |
| Updated test | `node --test --experimental-strip-types src/app/hub-okf/authoring/initial-ingest.test.ts` | pass | 1/1 passed and valid lifecycle completed after restoration. |
| Regression suite | `npm run verify` | pass | All 50 design-level tests passed. |
| Static/security gates | `npm run verify` | pass | Spec, typecheck, dependencies, Knip, Gitleaks and diff checks passed. |

## Output Excerpts

```text
✔ [AB-INGEST-004..006][AB-INGEST-008][AB-INGEST-011][AB-INGEST-013]
ℹ tests 50
ℹ pass 50
ℹ fail 0
```

## Residual Risks

- An agent may still attempt to append prepared navigation, but Finalize now
  rejects it rather than producing a misleading reviewable bundle.
- Sparse Domain usefulness remains an owner-review judgment; no word-count gate
  was added.

## Recommendation

Close the offline bug. A later owner-authorized sequential probe can qualify
model behavior; only a clean probe should proceed to a stability replica.
