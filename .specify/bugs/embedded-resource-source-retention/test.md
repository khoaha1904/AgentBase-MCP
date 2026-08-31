# Bug Verification: Embedded resource evidence is not retained in frontmatter

- **Slug**: embedded-resource-source-retention
- **Tested**: 2026-08-31
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

Embedded resource sources now survive skeleton creation and Finalize repair.
Focused and full MCP verification pass without regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Remove `queue-resource` from an authored parent before Finalize | pass | Frozen Receipt restores it exactly once. |
| Updated test | `node --test --experimental-strip-types src/app/hub-okf/authoring/receipt-authoring.test.ts` | pass | 1/1 passed. |
| Regression suite | `npm run verify` | pass | 158/158 passed. |
| Static/security gates | `npm run verify` | pass | Specs, typecheck, dependencies, Knip, Gitleaks and diff checks passed. |

## Output Excerpts

```text
tests 158
pass 158
fail 0
```

## Residual Risks

- Already-published documents require an explicit data repair; runtime code
  does not mutate Published Hub history automatically.
- Provider-neutral rows whose kind remains generic `resource` are still omitted
  by visualization policy as intended.

## Recommendation

Close the runtime bug after the existing Crawler data is repaired and its
Published projection shows no unresolved retained-resource evidence.
