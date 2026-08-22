# Verification: Hub Freshness Report

## Result

Capability 032 is complete. The local Hub CLI and MCP expose one shared,
read-only Repository freshness report with exact Hub commit/layer attribution,
known/unknown checkpoints, deterministic oldest-first ordering and no stale
threshold or source access.

## Evidence

- Focused query, MCP/CLI adapter and local-Hub lifecycle cases pass.
- Known, unknown, empty and future-clock inputs are covered without adding a
  top-level test case.
- Local-Hub evidence confirms freshness leaves HEAD and worktree unchanged.
- `npm run verify` passes: specification, TypeScript, dependency rules, Knip,
  Gitleaks, 50/50 tests and `git diff --check`.

## Deferred

Scheduled Hub CI, persisted Markdown reports, ordinary search/read freshness
marks and multi-source aggregation remain separate capabilities.

