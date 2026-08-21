# Implementation Plan: Single-Repository Refresh

**Branch**: `main` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Add one public Refresh skill that reuses canonical Repository preflight, managed
Code Graph, catalog-7 guidance, Hub continuity, authoring sessions and proposal
inspection. Extend Refresh with an explicit baseline, bounded change/gap context
and typed lifecycle actions. Replace legacy whole-subject omission deletion,
validate changed repository sources at Finalize, and return no-change, a
reviewable Local Draft or Incomplete. Do not Accept or publish.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing `@modelcontextprotocol/server@2.0.0`,
`codebase-memory-mcp@0.10.1` and `yaml@2.9.0`; no new dependency

**Storage**: Existing local Hub Git checkout, proposal/session directories and
OKF Markdown; bounded Refresh metadata in owned proposal/session state only

**Testing**: `node:test` focused design-contract and lifecycle scenarios;
canonical `npm run verify`; model qualification separately authorized

**Target Platform**: Existing local stdio MCP server on Node.js

**Project Type**: TypeScript modular monolith with packaged host-agent skills

**Performance Goals**: One repository connection, one bounded normal Refresh,
one optional retryable guidance correction and one independent content repair;
separately qualified model run under 10 minutes

**Constraints**: one authorized checkout; offline deterministic gate; no full
scan requirement, provider CLI, credentials, clone, remote mutation, automatic
Accept/Publish or raw graph/source copy

**Scale/Scope**: Existing 64 changed-concept/question envelope and bounded Hub
continuity; normal Refresh only

## Constitution Check

- **Evidence Before Abstraction — PASS**: Change and lifecycle actions retain
  exact source revision/path evidence; absence and age cannot become deletion.
- **Local-First Explicit Authority — PASS**: One explicit checkout and local
  Hub are sufficient. No credentials, network, provider process or hidden clone.
- **Agent-Navigable Ownership — PASS**: The Refresh skill owns orchestration;
  `core/knowledge` owns contribution/lifecycle policy; `app/hub-okf/authoring`
  owns transaction state; MCP exposes the bounded public contract.
- **Cumulative Knowledge — PASS**: Foreign/human/protected content is retained.
  Destructive intent is typed, evidenced and review-only.
- **Specification and Verification — PASS**: `AB-REFRESH-001..012` map to
  deterministic success, no-change, partial, destructive and recovery scenarios.
- **Dependency/schema/architecture gate — PASS**: No dependency, daemon,
  provider, credential boundary or OKF schema migration is added.

Post-design re-check: **PASS**. The plan changes a lifecycle boundary and MCP
contract but remains within the current modular monolith and proposal storage.

## Design Decisions

### 1. Keep orchestration in a small Refresh skill

Create `agentbase-refresh` beside `agentbase-ingest`. It performs preflight,
reads bounded Refresh context, uses graph/direct source, authors and validates
once, and presents the result. Do not create a workflow engine, candidate
database or model integration.

### 2. Build one explicit Refresh baseline

Resolve the canonical Repository first. Use active local `main`, which already
combines the Published base with locally accepted unpublished commits. Never
select an unaccepted proposal implicitly; explicit retry resumes/replaces only
its own repairable session. Return bounded current-source concepts, known gaps,
last observed source state and omitted counts. Never serialize the full Hub into
model context.

### 3. Keep change discovery semantic but ordered

The host investigates source changes, known gaps, then a small discovery pass.
MCP returns bounded facts and validates outcomes; it does not infer architecture,
demand completeness or run a full scan. Dirty source uses an exact digest and
explicit limitation.

### 4. Replace omission deletion with typed lifecycle intent

Remove `subjectRemovalEntries` as an omission-based authorization path. Refresh
Finalize declares contribution removal, supersession or retraction with reason
and exact current-repository evidence alongside the final authored bytes.
Validation checks ownership, retained foreign sources, affected
relations/navigation and replacement identity.

For a multi-source concept, preserve its existing prose and ordinary metadata.
Only merge or remove structured source/claim/relation entries whose evidence IDs
prove current-Repository ownership; ambiguous edits become a visible conflict.
Do not add paragraph-level ownership parsing.

This is the material baseline correction: current code can delete an entire
mutable subject when authored output omits it. The approved high-level design
rejects that shortcut. The surrounding proposal/diff/inspection code is reused.

### 5. Use no-change as a first-class result

If the validated authored tree equals its Refresh baseline and there are no
Question/limitation attachments, Finalize returns `no_change` rather than
persisting a duplicate proposal.

### 6. Reuse bounded recovery from Initial Ingest

The skill may correct one retryable stateless guidance request and separately
repair content once after changed-set validation. Prepare and Finalize are not
blindly retried. Unsafe failures stop Incomplete with owned repair state retained
only when safe.

### 7. Validate all changed current-repository evidence

Generalize Finalize source-span validation from newly created Initial Ingest
concepts to every added or modified current-repository source in Refresh. Do not
dereference foreign repositories. Only successful output records the new
observed revision/time inside the proposal.

## Project Structure

```text
.agents/skills/
├── agentbase-refresh/SKILL.md
└── agentbase-okf/SKILL.md

src/core/knowledge/
├── proposals/                       # explicit lifecycle intent
└── query/                           # bounded Refresh baseline/gaps

src/app/hub-okf/
├── authoring/
│   ├── authoring-session.ts         # baseline/result/source validation
│   └── refresh.ts                   # contribution reconciliation
├── review/inspect.ts                # grouped preview
└── mcp/                             # public Refresh adapter
```

**Structure Decision**: Extend existing ownership boundaries. Add no generic
workflow layer and no new top-level runtime capability.

## Complexity Tracking

No constitution violation or exception.
