# Verification: Correct Tool Guidance

Verified on 2026-08-24.

- Official listing remains exactly 42 tools; all 42 are named by one of the
  eight released skills and no public descriptor names a retired tool.
- `index_repository` remains non-read-only/non-destructive/idempotent. The
  other eight graph actions are read-only/non-destructive/idempotent.
- `agentbase-hub` passes skill validation and owns bounded Question listing plus
  exact-revision answer-to-proposal review.
- Focused MCP and product-skill installer tests pass without adding a test case.
- `npm run verify` passes specification checks, Hub-validator parity,
  TypeScript, dependency rules, Knip, Gitleaks, `git diff --check` and 50/50
  tests.

No model benchmark or external operation ran.
