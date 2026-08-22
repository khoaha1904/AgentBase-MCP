# Bug Verification: Legacy Hub attach requires README

- **Slug**: hub-legacy-readme-attach
- **Tested**: 2026-08-22
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The legacy no-README fixture and the real existing AgentBase-Hub both attach
successfully through MCP. The full offline gate passes with no regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | MCP `configure_hub` against existing AgentBase-Hub | pass | Remote `main` admitted; pending count was zero. |
| Updated E2E | `node --test src/app/hub-okf/workspace/local-only-e2e.test.ts` | pass | Valid OKF without README attaches. |
| Type checking | `npm run typecheck` | pass | No TypeScript errors. |
| Canonical regression | `npm run verify` | pass | 50/50 tests, specs, architecture, Knip and Gitleaks pass. |

## Output Excerpts

- Existing Hub status: `kind: remote`, `pendingCount: 0`.
- Tests: `50 passed, 0 failed`.
- Gitleaks: `no leaks found`.

## Residual Risks

- README remains optional only for attaching an existing Hub; machine-readable
  OKF root validation remains the admission gate.

## Recommendation

Close the bug. The exact production reproduction and canonical offline gate
both pass.
