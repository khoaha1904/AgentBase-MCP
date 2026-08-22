# Implementation Plan: AgentBase-Hub CI

**Branch**: `033-hub-ci` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Compose existing OKF validators, obvious-sensitive guards and freshness into one
offline filesystem command. Generate one pinned read-only workflow for new Hubs,
and add a dedicated preview/submit PR path for existing Hubs. Do not put policy,
credentials or persisted reports in AgentBase-Hub.

## Technical Context

**Language/Version**: Node.js 24 TypeScript executed directly; GitHub Actions YAML

**Primary Dependencies**: Existing Node standard library, `yaml@2.9.0`, Git/GitHub provider

**Storage**: Hub workflow file; exact remote branch/PR is sufficient retry state

**Testing**: Existing core query, local-Hub and fake-GitHub lifecycle cases; `npm run verify`

**Target Platform**: GitHub Actions and local AgentBase-MCP

**Project Type**: Modular-monolith MCP/CLI with GitHub transport

**Performance Goals**: One bounded pass over a normal Hub checkout

**Constraints**: No new dependency/test count, no CI secret, no `main` mutation, no freshness failure threshold

**Scale/Scope**: One workflow and one upgrade PR per Hub

## Constitution Check

- Evidence Before Abstraction: passes; composes released validators and exact fixture evidence.
- Local-First Explicit Authority: passes; validator is offline and upgrade submit is explicit.
- Agent-Navigable Ownership: passes; knowledge owns validation, Hub app owns workflow/setup, GitHub provider owns transport.
- Cumulative Knowledge: passes; CI is warning/read-only and upgrade changes only workflow bytes through PR.
- Specification and Verification: passes; stable AB-HUB-CI requirements and existing test journeys precede real qualification.

Post-design check: all gates pass. The new external lifecycle is bounded to one
fixed file/branch and uses existing token/Git/GitHub boundaries.

## Project Structure

```text
src/app/hub-okf/ci/validation.ts          offline validation/report
src/app/hub-okf/ci/workflow.ts           exact workflow bytes/version
src/app/hub-okf/ci/upgrade.ts            preview and workflow-only PR
src/app/hub-okf/workspace/setup.ts       new-Hub installation
src/app/hub-okf/cli.ts                    offline CI command
src/app/hub-okf/mcp/                     existing-Hub preview/submit tools
```

**Structure Decision**: Add one small `ci/` owner because filesystem validation,
workflow generation and remote upgrade change together and do not belong to
knowledge query or ordinary knowledge publication. It composes core validators
only through their public entrypoint.

## Complexity Tracking

| Change | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Dedicated workflow-upgrade PR | Existing real Hub needs CI without direct main write | Silent setup mutation and manual unmanaged copy violate reviewed MCP authority |
