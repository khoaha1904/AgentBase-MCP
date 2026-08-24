# Implementation Plan: Install Product Skills

**Branch**: `039-install-product-skills` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

## Summary

Add one installation-owned copier with a fixed seven-name allowlist. Preflight
selected user-scope destinations, copy missing skill directories, treat exact
copies as no-op, and roll back only newly copied skills if MCP registration
fails. Reuse the existing interactive client selection and transaction.

## Technical Context

- Node.js 24 standard library only; no new dependency or persistent registry.
- Owner: `scripts/installation/`; product skill sources remain
  `.agents/skills/<name>/`.
- Codex destination: `$CODEX_HOME/skills` with `~/.codex/skills` fallback.
- Claude Code destination: `~/.claude/skills`.
- Tests use temporary isolated homes and never mutate real client state.

## Implementation Slices

1. Record installation requirements and activate capability 039.
2. Add exact allowlist, tree comparison, preflight, copy and bounded rollback.
3. Compose skill installation with existing interactive MCP registration.
4. Verify isolated clients, exclusion, conflicts, reruns and rollback.
5. Update user-facing installation docs and close the capability.

## Constitution Check

The feature is local, explicit and offline; adds no dependency, provider,
credential access or background lifecycle. It preserves conflicting user state
and leaves non-interactive behavior unchanged.
