# Verification: AgentBase-Hub CI

## Result

Capability 033 is complete offline. One command validates Hub integrity and
obvious sensitive content while reporting Repository freshness as warning-only
context. New Hubs include the exact read-only workflow; existing Hubs receive it
only through an explicit, recoverable workflow-only PR.

## Evidence

- Valid, empty and custom-type fixtures pass; broken index, unsafe path/content
  and drifted workflow fixtures fail deterministically.
- New-Hub setup commits the exact workflow with read-only permission, pinned
  action commits and no MCP token or write-capable event.
- Disposable Git and fake GitHub prove missing/current upgrade preview, exact
  workflow-only PR creation, retry recovery, remote-main preservation and
  rejection of a branch containing extra bytes.
- MCP list/call coverage includes freshness and CI preview/submit without token,
  branch-name or workflow-byte arguments.
- `npm run verify` passes: specification, TypeScript, dependency rules, Knip,
  Gitleaks, 50/50 tests and `git diff --check`.

## Release qualification

The workflow intentionally pins public AgentBase-MCP tag `v0.1.0-rc.1` and has
no fallback to `main`. Real GitHub Actions qualification and an actual Hub CI
upgrade PR wait until that tag is explicitly created and pushed.

## Deferred

Persisted freshness reports/artifacts, ordinary-query freshness marks, provider
source probes and automatic Refresh remain separate capabilities.
