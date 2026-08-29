# 01 — Baseline and impact checkpoint

> Status: The current baseline is implemented; new workspace routing awaits
> audit.

## Current baseline

AgentBase-MCP already has the primitives required to read one repository:

- an owned Codebase Memory session for exactly one local repository;
- index, architecture, graph search, trace and exact source snippets;
- source identity, freshness receipt and explicit refresh;
- bounded evidence bundles with source paths and line spans;
- checks that the provider does not mutate the repository during a graph round;
- public `agentbase-query`, `agentbase-ingest`, `agentbase-refresh` and related
  batch/domain workflows;
- internal `use-codebase-memory` for Code Graph and `agentbase-okf` for
  authoring.

Baseline sources:

- [Repository OKF boundary](../../../src/app/repository-okf/README.md)
- [Graph round](../../../src/app/repository-okf/graph/graph-round.ts)
- [Evidence preparation](../../../src/app/repository-okf/evidence/prepare-evidence.ts)
- [Owned graph skill](../../../.agents/skills/use-codebase-memory/SKILL.md)
- [OKF authoring skill](../../../.agents/skills/agentbase-okf/SKILL.md)

## Current gap

Public skills already coordinate Hub, Code Graph and authoring. After reviewing
all 12 sections, the only remaining audit gap is host-level routing: when the
caller stands in a parent directory containing multiple Git repositories, the
Agent must select an explicit or uniquely reasonable repository before invoking
the graph; if it remains ambiguous, ask the user.

MCP runtime does not need to understand workspace semantics, select concepts or
maintain a new registry. A graph round continues to receive exactly the
repository and task focus selected by the workflow.

## Impact

**Contained change.** Reuse the current provider, MCP tools, freshness, evidence
and public skills. Do not add a graph engine, background worker, model SDK,
workflow database, combined graph or workspace registry.

If a later design requires MCP to discover an entire repository through a fixed
pipeline without Agent coordination, the impact becomes a broad change and
conflicts with the current high-level decision.
