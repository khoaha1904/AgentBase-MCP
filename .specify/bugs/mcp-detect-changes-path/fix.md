# Bug Fix: MCP detect_changes loses required system PATH

- **Slug**: mcp-detect-changes-path
- **Fixed**: 2026-08-12T15:21:32+07:00
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The managed provider child now receives a fixed Linux system executable path
while caller-controlled identity and executable paths remain cleared. This lets
the provider's `detect_changes` pipeline resolve `sort` without changing how
AgentBase admits or launches the package-private provider binary.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/providers/codebase-memory/provider-environment.ts` | added | Owns the fixed child-process environment policy. |
| `src/providers/codebase-memory/provider-environment.test.ts` | added test | Pins the fixed path and caller-authority stripping. |
| `src/providers/codebase-memory/session.ts` | modified | Uses the environment policy when constructing stdio transport. |

## Tests Added or Updated

- `provider-environment.test.ts` — proves `PATH` is exactly `/usr/bin:/bin`
  even if the caller supplies another value, and that caller `HOME`, identity,
  shell and terminal values remain unavailable.

## Local Verification

- `node --test src/providers/codebase-memory/provider-environment.test.ts src/providers/codebase-memory/session.test.ts` → 9/9 pass.
- `npm run architecture:changed` → 0 errors; two pre-existing file-size warnings, with `session.ts` retained at 250 lines.
- `npm run typecheck` → pass.
- Real MCP reproduction → `detect_changes` returned the actual dirty paths and no `sort: not found`; provider cleanup was clean.

## Deviations from Assessment

The environment policy and its test were split into focused new files instead
of growing the already baselined 250-line `session.ts` and its test. The runtime
change remains the same and within the existing provider owner.

## Follow-ups

- Treat `/usr/bin:/bin` as the currently exercised Linux boundary; require a
  separate portability decision before supporting a host with different system
  utility locations.
