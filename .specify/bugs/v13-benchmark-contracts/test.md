# Bug Verification: V13 benchmark contract failures

- **Slug**: v13-benchmark-contracts
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

The inspect schema/dispatcher mismatch no longer reproduces and the complete
offline suite passes. The exact-type guidance is present and contract-tested,
but its effect on the Shopping Cart model repair count was not re-benchmarked.

## Checks Performed

| Check | Command / Action | Result | Notes |
|---|---|---|---|
| Inspect reproduction (post-fix) | Focused MCP schema and routing test | pass | Public schema requires `proposal_id`; dispatcher invokes `inspect:p1` once. |
| Model repair reproduction | Real V13 Shopping Cart run | skipped | Requires separate owner authorization; no model run was performed. |
| New / updated tests | `node --test --experimental-strip-types src/app/hub-okf/mcp/mcp-tools.test.ts src/app/codebase-memory-mcp/okf-schema-tools.test.ts` | pass | 17 passed. |
| Skill/spec fixtures | `node --test scripts/checks/check-skills.test.mjs scripts/checks/check-specs.test.mjs` | pass | 15 passed across the two focused suites. |
| Regression suite | `npm run verify` | pass | 380 passed, 0 failed. |
| Static/security gates | Included in `npm run verify` | pass | TypeScript, dependency rules, Knip, Gitleaks and diff check passed. |

## Output Excerpts

```text
✔ [AB-INGEST-008] proposal inspection schema and dispatcher use proposal_id
ℹ tests 380
ℹ pass 380
ℹ fail 0
```

## Residual Risks

- Tool and skill wording cannot guarantee that every model execution avoids an
  extra validation attempt.
- Official V13 qualification remains 0/3 until an explicitly authorized run
  satisfies the immutable lifecycle gate and admits semantic scoring.

## Recommendation

Keep capability 022 in external-qualification-pending state. The deterministic
inspect defect is closed locally; re-test the model-facing guidance only in the
next owner-authorized qualification, without adding another reasoning loop or
lifecycle counter.
