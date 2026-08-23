# Implementation Plan: Local-first Hub Control

**Branch**: `037-local-first-hub-control` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

## Summary

Replace the single mutable remote baseline with isolated Hub profiles and one
stable Published boundary. Keep local authoring on internal `main`, derive
GitHub.com/Enterprise transport from each profile, return partial status under
failure, and make sync the only explicit operation that admits remote updates.

## Technical Context

**Language/Version**: TypeScript on Node.js 24 with erasable syntax  
**Primary Dependencies**: Existing MCP, YAML and GitHub/Git providers only  
**Storage**: Owner-private JSON profiles, per-profile credential files and Git checkouts  
**Testing**: Native Node tests, disposable Git, fake GitHub HTTP, opt-in real Hub  
**Target Platform**: Local developer environments and GitHub Enterprise clients  
**Project Type**: Modular-monolith stdio MCP/CLI  
**Performance Goals**: Local status remains immediate; remote status stays bounded by existing request limits  
**Constraints**: 50 tests, no new dependency/daemon/background pull, no secret in tools/config/output  
**Scale/Scope**: One active profile, bounded saved profiles, one remote branch per profile

## Constitution Check

- Evidence Before Abstraction: pass; GitHub.com and Enterprise-shaped fake HTTP
  exercise the same provider with explicit host differences.
- Local-First Explicit Authority: pass; first authoring is local, remote status
  is read-only and sync remains explicit.
- Agent-Navigable Ownership: pass; current configuration, workspace,
  publication and provider owners remain responsible.
- Cumulative Knowledge: pass; Published ref and transactional replay prevent
  implicit draft loss.
- Specification/Verification: pass; living requirements precede implementation
  and the existing 50 journey tests remain the canonical gate.

Post-design re-check: pass with no dependency, architecture exception or
irreversible migration. Legacy migration preserves bytes and stops on ambiguity.

## Project Structure

```text
.agents/skills/agentbase-hub/               setup/status/sync workflow
src/core/hub/                               host-aware identity and Published state
src/providers/github-hub/                   host-derived Git/API transport
src/app/hub-okf/configuration/              profiles and per-profile credentials
src/app/hub-okf/workspace/                  lazy local setup, attach and admission
src/app/hub-okf/publication/                Published-ref sync/recovery
src/app/hub-okf/query/                      partial status composition
src/app/hub-okf/mcp/                        bounded public tool contracts
src/app/hub-okf/*test.ts                    journey-level qualification
```

**Structure Decision**: Reuse existing capability owners and tests; add only one
product skill and no generic profile/service abstraction.

## Implementation Slices

1. Introduce host-aware identity, isolated profile/credential persistence and
   safe migration of the active legacy profile.
2. Establish/migrate `refs/agentbase/published`; make pending/status/sync use it
   instead of mutable remote tracking.
3. Add lazy local authoring, profile activation and configured-branch transport.
4. Compose resilient status plus bounded remote head/open-PR inspection.
5. Package the Hub control skill and qualify released journeys sequentially.

## Complexity Tracking

No constitution violation. Multiple saved profiles are bounded files plus one
active pointer, not a multi-Hub runtime or database.
