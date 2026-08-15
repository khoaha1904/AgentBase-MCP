# Implementation Plan: Confirmed Domain Navigation

**Branch**: `main` | **Date**: 2026-08-16 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing Hub prepare contract with one optional, exact
owner-confirmed Domain context and return its deterministic guidance resource to
the author. Persist that context in the private authoring session so finalization
can require the expected Domain concept/provenance. Tighten new-proposal index
diff admission by reusing the refresh rule that accepted nonblank lines remain
exact and ordered. Qualify the result with an immutable V10 Shopping Cart run
and a replacement unmerged Hub PR.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript

**Primary Dependencies**: Existing standard library, YAML parser and local Hub
composition; no new dependency

**Storage**: Existing private session JSON and Git-backed Markdown Hub only

**Testing**: `node:test`, disposable Hub fixtures, benchmark scorer and opt-in
real Codex qualification

**Target Platform**: Local AgentBase-MCP stdio/CLI runtime

**Project Type**: Modular monolith and MCP server

**Performance Goals**: Domain context adds constant-size input/output and no
additional whole-Hub model payload

**Constraints**: no Domain inference, question ledger, lifecycle semantic
change, daemon, vector store, migration or root auto-rewrite

**Scale/Scope**: One confirmed Domain per repository authoring session; existing
multi-domain retrieval remains unchanged

## Constitution Check

- **Evidence Before Abstraction — PASS**: owner guidance has an explicit stable
  resource distinct from repository source evidence.
- **Local-First Explicit Authority — PASS**: Domain is explicit bounded input;
  no network, credentials or background runtime is added.
- **Agent-Navigable Ownership — PASS**: Hub app owns session/tool composition;
  core knowledge continues to own Markdown/schema validation.
- **Cumulative Knowledge — PASS**: accepted index lines become stricter and can
  only be extended, never silently replaced.
- **Specification and Verification — PASS**: AB-SCHEMA-024,
  AB-LOCAL-HUB-015 and AB-BENCH-041 receive focused tests and the canonical
  offline gate.

Post-design re-check: **PASS**. The design extends existing values and
validators without a dependency, process, persistence engine, migration or
architecture exception.

## Project Structure

### Documentation

```text
specs/018-confirmed-domain-navigation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/mcp.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/app/hub-okf/
├── mcp-tools.ts                 # confirmed Domain input contract
├── runtime-actions.ts           # selection and returned authoring context
├── authoring-session.ts         # private context continuity
├── prepare.ts                   # new-proposal validation and index protection
├── refresh.ts                   # confirmed Domain validation on refresh
└── *.test.ts                    # requirement-linked tests

src/core/knowledge/
└── confirmed-domain.ts          # bounded value/provenance validation

benchmark/
├── prompts/*-v10.md
└── repos/aws-serverless/manifest.json
```

**Structure Decision**: Reuse the current knowledge and Hub owners. One small
core value prevents MCP/session/finalize layers from inventing different Domain
normalization or evidence rules.

## Complexity Tracking

No constitution violation or approved exception.
