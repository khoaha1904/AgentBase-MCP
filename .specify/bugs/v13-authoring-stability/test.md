# Bug Verification: V13 authoring stability and benchmark identity

- **Slug**: v13-authoring-stability
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

The benchmark-only identity mismatch is deterministically fixed and all offline
gates pass. OKF/MCP exposes the missing authoring constraints, but model-facing
stability was not requalified and therefore is not claimed as verified.

## Checks Performed

| Check | Command / Action | Result | Notes |
|---|---|---|---|
| Benchmark identity reproduction | Durable-first selector and V13 run-artifact tests | pass | New V13 artifacts retain durable Hub identity; historical artifacts fall back. |
| Retained output read-only score | Score lifecycle-pass output with durable Hub Repository ID | pass | Validation passed and assessment became `reviewable`; retained artifact was not rewritten. |
| OKF/MCP contract exposure | Focused schema, Hub MCP and skill tests | pass | Candidate-local evidence and complete-Markdown rules are public. |
| Model stability reproduction | Another real three-run qualification | skipped | Requires separate owner authorization. |
| Regression suite | `npm run verify` | pass | 382 passed, 0 failed. |
| Static/security gates | Included in `npm run verify` | pass | TypeScript, dependency rules, Knip, Gitleaks and diff check passed. |

## Output Excerpts

```text
✔ [AB-BENCH-043] V13 scoring prefers durable Hub Repository identity with historical fallback
✔ [AB-INGEST-005] prepare schema states candidate-local evidence ownership
ℹ tests 382
ℹ pass 382
ℹ fail 0
```

## Residual Risks

- Tool descriptions guide the model but do not mechanically prevent a model
  from making another invalid first call.
- Official capability qualification remains failed until a separately
  authorized stable model run passes the existing lifecycle acceptance rule.

## Recommendation

Treat the benchmark-only defect as closed offline. Keep the OKF/MCP stability
portion pending real qualification; do not add more retry logic or run another
benchmark without owner authorization.
