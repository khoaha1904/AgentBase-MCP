# Verification: Client MCP Registration

**Date**: 2026-08-13

## Canonical evidence

`npm run verify` passed after implementation and documentation updates:

- specification route and `AB-INSTALL-001..017` coverage passed;
- TypeScript typecheck passed;
- architecture check completed with zero errors and only the six existing
  visible warnings; no Capability 010 fragmentation or baseline mark was added;
- the full offline repository test suite passed;
- `git diff --check` passed.

## Focused evidence

`node --test scripts/client-registration.test.mjs scripts/install.test.mjs`
passed 15 scenarios covering:

- Codex-only, Claude-only and both-client selection;
- exact rerun, moved checkout, inherited environment and same-name conflict;
- unavailable-client preflight with zero mutation;
- second-client add failure and verification mismatch rollback;
- concurrent change, failed rollback, guarded snapshot restore, unsafe receipt
  rejection and next-run recovery;
- masked credential preservation, interruption and non-interactive behavior.

All canonical client tests used isolated homes and deterministic fake
executables. They did not read or mutate installed Codex/Claude configuration.

## Isolated official-client qualification

The installed Codex and Claude Code binaries were exercised against one
disposable HOME/CODEX_HOME, not the user's real configuration. First registration
returned `registered` for both clients; the immediate rerun returned
`already-registered` for both. The resulting disposable Codex and Claude config
files were regular mode `0600`. No token or Hub was used.

## Accepted limitations

- The configured checkout is intentionally not relocatable; moving it creates a
  conflict that requires deliberate removal and re-registration.
- Installing/upgrading either coding client and uninstalling AgentBase-MCP are
  separate capabilities.
- A real user-global registration smoke action remains separately authorized.
