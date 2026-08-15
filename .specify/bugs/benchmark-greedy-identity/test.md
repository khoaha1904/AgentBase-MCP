# Bug Verification: Greedy semantic identity misassignment

- **Slug**: benchmark-greedy-identity
- **Tested**: 2026-08-15
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original collision no longer reproduces. The unchanged real MCP bundle now
maps Lambda and Event to their correct expected concepts, while the focused and
combined benchmark suites remain green.

## Checks Performed

| Check | Command / Action | Result | Notes |
|---|---|---|---|
| Reproduction (post-fix) | Read-only re-score of pair `2026-08-14T184644Z` MCP bundle | pass | Schema changed from erroneous 40/40 to 80/80; relationships from 50 to 100. |
| New test | `node --test scripts/benchmark-okf.test.mjs` | pass | 15 passed. |
| Benchmark regression | `node --test scripts/benchmark-agent.test.mjs scripts/benchmark-okf.test.mjs` | pass | 23 passed. |
| Historical wrong-schema behavior | Existing requirement-linked test | pass | Wrong schema remains visible. |

## Output Excerpts

```text
concept: 80 / 80
schema: 80 / 80
metadata: 75
provenance: 71
relationships: 100
readiness: failed (metadata and provenance only)
```

## Residual Risks

- The retained comparison artifacts still contain the pre-fix deterministic
  score. They are not overwritten silently; the corrected read-only result is
  documented in capability verification.
- The authored bundle still omits the expected Business Flow, so readiness
  correctly remains failed.

## Recommendation

Close this scoring bug. Address the remaining authoring gap through a new
immutable prompt identity and obtain owner approval before another expensive
real pair.
