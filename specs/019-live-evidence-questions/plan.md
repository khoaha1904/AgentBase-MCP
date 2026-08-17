# Implementation Plan: Live Evidence and Governed Questions

**Branch**: `main` | **Date**: 2026-08-17 | **Spec**: [spec.md](spec.md)

## Summary

Represent change-prone configuration and implementation claims as validated
source references in accepted OKF instead of timeless scalar values. A combined
agent query reads those references from Hub, verifies the explicitly admitted
repository identity and uses the existing bounded graph/snippet tools to observe
current source. Add one private, atomic question ledger beside Hub runtime state;
questions enter it only with an accepted proposal, and an attributed answer
creates a reviewable Maintainer Guidance proposal without deleting source claims.

## Technical Context

**Language/Version**: Node.js 24 and TypeScript 5.9

**Primary Dependencies**: Existing Node standard library, YAML parser, Hub
proposal lifecycle and Codebase Memory MCP gateway; no new dependency

**Storage**: Git-backed portable OKF for source references and accepted guidance;
private atomic JSON for governed question workflow state

**Testing**: `node:test`, disposable Git/Hub fixtures, fake provider sessions and
the canonical offline `npm run verify` gate

**Target Platform**: Local AgentBase-MCP stdio/CLI runtime

**Project Type**: Modular monolith and MCP server

**Performance Goals**: Bounded reference/question results (maximum 100 records),
no whole-Hub model payload and no background refresh

**Constraints**: no truth ranking, scalar cache, arbitrary source parser, daemon,
watcher, network access, new credential, automatic source mutation or implicit
deletion; live observation requires one explicitly indexed repository per MCP
connection

**Scale/Scope**: Source conflicts within one admitted repository; a concept may
carry at most 64 live claims, a question at most 64 linked claim IDs and 64
history events

## Constitution Check

- **Evidence Before Abstraction — PASS**: every live claim points to an existing
  normalized repository source and carries its observed source identity; query
  output labels the current observation and its limitations.
- **Local-First Explicit Authority — PASS**: resolution reuses the repository
  explicitly bound by `index_repository`; no background or network work is added.
- **Agent-Navigable Ownership — PASS**: core knowledge owns reference validation,
  the Hub app owns question/proposal state, and the MCP app only composes Hub and
  graph capabilities.
- **Cumulative Knowledge — PASS**: accepted Markdown, linked claims and question
  history are preserved unless an explicit reviewed proposal changes them.
- **Specification and Verification — PASS**: AB-CLAIM-001..003,
  AB-QUESTION-001..005, AB-QUERY-006..008, AB-REFRESH-013 and AB-BENCH-042 map to
  focused failure/recovery tests and the offline gate.

Post-design re-check: **PASS**. The design reuses current files, mutation locks,
atomic JSON and safe MCP tools. It adds no provider, dependency, process,
credential boundary, migration or architecture exception.

## Project Structure

### Documentation

```text
specs/019-live-evidence-questions/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/mcp.md
├── checklists/evidence-lifecycle.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/core/knowledge/
├── live-claims.ts               # bounded OKF extension and validation
└── live-claims.test.ts

src/app/hub-okf/
├── questions.ts                 # private ledger, identity and transitions
├── questions.test.ts
├── question-recovery.ts         # reconcile accepted proposal attachments
├── guidance-proposal.ts         # one-answer Maintainer Guidance proposal
├── guidance-proposal.test.ts
├── authoring-session.ts         # staged question declarations
├── accept.ts                    # commit-coupled question admission
├── query.ts                     # structured claim/reference extraction
├── mcp-tools.ts                 # question and evidence contracts
└── runtime-actions.ts           # Hub workflow composition

src/app/codebase-memory-mcp/
├── server.ts                    # compose current repository identity with Hub
└── server.test.ts               # combined live-resolution workflow contract

.agents/skills/agentbase-okf/
└── SKILL.md                     # agent-side resolution/presentation procedure
```

**Structure Decision**: Keep live scalar interpretation in the host agent using
the already exposed graph and exact-snippet tools. AgentBase owns stable reference
validation, source-binding checks, question state and proposal governance; it does
not introduce a language-specific evaluator.

## Complexity Tracking

No constitution violation or approved exception.
