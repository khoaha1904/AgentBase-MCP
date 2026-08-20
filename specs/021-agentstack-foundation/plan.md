# Implementation Plan: AgentStack Foundation

**Branch**: `main` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

## Summary

Replace the custom architecture checker and metric baselines with native
dependency-cruiser rules, add bounded knip and redacted gitleaks gates, and
compose them into the existing offline verification command. Preserve the
current modular-monolith direction and public-entrypoint behavior without a
second ownership registry or shared AgentStack runtime dependency.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: `dependency-cruiser@18.2.0`, `@swc/core@1.16.0` and
`knip@6.32.2` as exact development dependencies; machine-managed
`gitleaks@8.30.1`

**Storage**: Repository configuration only; no runtime state or migration

**Testing**: Native tool runs, one focused dependency-rule conformance test,
existing `node:test` suite and `npm run verify`

**Target Platform**: Local Node.js development/CI checkout; gitleaks is an
explicit native prerequisite

**Project Type**: TypeScript modular monolith and MCP server

**Performance Goals**: One bounded source dependency scan, one repository
dead-code scan and one redacted working-tree secret scan per canonical verify

**Constraints**: offline gate; no auto-install/download; no line/byte/import
budgets; no production dependency; no AgentStack runtime dependency

**Scale/Scope**: Existing `src/`, `scripts/` and package configuration only;
four legacy architecture files removed and three native tool configs added

## Constitution Check

- **Evidence Before Abstraction — PASS**: mature native tools replace one
  duplicated in-house engine; config retains only proven dependency rules.
- **Local-First Explicit Authority — PASS**: gates run locally and never mutate
  source, access credentials, call a model/network or install missing tools.
- **Agent-Navigable Ownership — PASS**: `docs/ARCHITECTURE.md` remains the
  ownership index; public boundaries and dependency direction stay mechanically
  checked without a duplicate registry.
- **Cumulative Knowledge — PASS**: no graph, OKF, Hub or user data changes.
- **Specification and Verification — PASS**: amended `AB-FND-*` requirements
  receive focused native-tool and composed-gate evidence.
- **Dependencies/native binaries — PASS**: Node tools are exact lockfile-backed
  dev dependencies; gitleaks 8.30.1 is reviewed in `machine/packages.tsv`, and
  a missing binary fails rather than auto-installs.
- **Review-size exception rule — PASS**: no review-size gate or exception
  remains, so there is no broad or implicit exception to track.

Post-design re-check: **PASS**. No production dependency, architecture
exception, data migration, provider, credential or process lifecycle is added.

## Project Structure

### Documentation

```text
specs/021-agentstack-foundation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/verification.md
├── checklists/requirements.md
├── checklists/foundation.md
├── quickstart.md
└── tasks.md
```

### Repository files

```text
.dependency-cruiser.cjs        # cycles, layer direction, public boundaries
knip.json                      # explicit source/test/script entrypoints
.gitleaks.toml                 # default rules and redacted native scan config
package.json                   # native tool scripts and composed gate
package-lock.json              # exact resolved development tools

scripts/
└── dependency-rules.test.mjs  # smallest config behavior check

docs/ARCHITECTURE.md           # retained human/agent ownership map
docs/contracts/foundation.md   # amended living requirements
AGENTS.md                      # remove obsolete registry/metric instructions
```

Removed after replacement passes:

```text
scripts/check-architecture.mjs
scripts/check-architecture.test.mjs
scripts/architecture-baseline.json
scripts/module-boundaries.json
```

**Structure Decision**: Keep native configs at repository root using native
tool names. Add one conformance test for the dependency rule data; do not build
an apply engine, shared-config loader or replacement architecture scanner.

## Complexity Tracking

No constitution violation or approved exception.
