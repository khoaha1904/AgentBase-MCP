# Verification: Readable Hub README

## Result

Capability 036 is complete. The shared README renderer now gives people a
concise introduction to AgentBase-MCP, canonical Hub navigation, the OKF
boundary, representative layout, reviewed publication and Hub CI.

## Evidence

- `npm run verify` passes specification and artifact checks, TypeScript,
  dependency boundaries, Knip, Gitleaks, 50/50 tests and `git diff --check`.
- Focused assertions preserve the AgentBase-MCP link, canonical `index.md` link
  and explicit not-a-source/Code-Graph-copy boundary.
- MCP's dedicated Hub token created
  [Hub PR #15](https://github.com/khoaha1904/AgentBase-Hub/pull/15) from exact
  remote `main`. It changes only `README.md`, is mergeable and its
  [Hub CI run](https://github.com/khoaha1904/AgentBase-Hub/actions/runs/32615175066)
  succeeds.

## Deliberate limit

README remains onboarding rather than a generated catalog. Existing custom
READMEs are still preserved automatically; this production update was an
explicit reviewed PR.
