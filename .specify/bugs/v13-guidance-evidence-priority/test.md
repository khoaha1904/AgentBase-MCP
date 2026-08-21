# Bug Verification: Structured evidence priority

- **Slug**: v13-guidance-evidence-priority
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The exact Lambda/Table mapping collision no longer reproduces, multiple
structured mappings remain ambiguous and the complete offline gate has no
regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|---|---|---|---|
| Reproduction | Focused guidance regressions | pass | Exact structured mapping survives Event prose. |
| Public contract | MCP description regression | pass | Evidence priority and separate System rule are visible. |
| Focused suite | `node --test ...guidance.test.ts ...okf-schema-tools.test.ts ...benchmark-okf.test.mjs` | pass | 48/48. |
| Canonical gate | `npm run verify` | pass | 385/385 plus all repository checks. |

## Output Excerpts

```text
tests 385
pass 385
fail 0
```

## Residual Risks

- Semantic System assessment remains advisory and model-authored; the fix does
  not claim every qualifying repository will produce a System without a new
  external run.

## Recommendation

Close the deterministic bug. Keep capability 022 open for separately authorized
external owner-review qualification.
