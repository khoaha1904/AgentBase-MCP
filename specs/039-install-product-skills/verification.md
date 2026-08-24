# Verification: Install Product Skills

## Outcome

Capability 039 is complete. Interactive setup copies exactly seven AgentBase
product skills into every selected client's supported user scope before MCP
registration. Development-only `speckit-*` skills are excluded by a fixed
allowlist and are never installed.

## Evidence

- Fresh isolated Codex and Claude Code homes each receive the same seven product
  skill directories and no `speckit-*` directory.
- Exact reruns are no-op; a different same-name skill blocks all skill copying
  before mutation.
- Selecting Codex alone leaves Claude Code unchanged.
- Failed MCP registration removes newly copied skills while preserving an exact
  skill that existed before the run.
- Non-interactive setup remains dependency-only.

## Gate

`npm run verify` passes specification checks, generated Hub validator parity,
TypeScript, dependency rules, unused-code checks, Gitleaks, `git diff --check`
and all 50 design-level tests. No production dependency or MCP tool was added.
