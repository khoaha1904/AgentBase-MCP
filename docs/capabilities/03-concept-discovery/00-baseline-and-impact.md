# 03 — Baseline and impact checkpoint

> Status: Two qualification gates are decided; no numeric scoring is used.

## Implemented baseline

- The authoring skill requires a concept to have stable identity and
  independent query, contract, lifecycle, ownership or graph value.
- Initial Ingest passes evidence-bearing candidates/observations; free-form
  signals remain only as legacy/fine-grained aids outside the new preparation
  path.
- Hub prepare allows a new concept only with a selected schema and a repository
  source reference.
- Schema, concept and relationship validators run after the Agent writes
  Markdown.
- The local Published Hub and current proposal find existing concepts; unrelated
  Local Drafts are outside ordinary discovery query.

Baseline sources:

- [Concept authoring rules](../../../.agents/skills/agentbase-okf/references/concepts.md)
- [Schema selector](../../../src/core/knowledge/schemas/catalog.ts)
- [Hub proposal preparation](../../../src/app/hub-okf/authoring/prepare.ts)

## Remaining gap

Runtime has the candidate contract and ownership validation. There is
intentionally no persistent candidate registry or review UI; the Agent remains
the reasoning layer in a bounded skill workflow.

## Implementation result

A lightweight evidence-bearing boundary was added through skill, MCP input and
validation without a model runtime or scoring subsystem.

Building a deterministic discovery/scoring engine that understands every
language/provider would be a **Broad change/Near rewrite** and is unnecessary:
the Agent is already the reasoning layer, while MCP should keep bounded tools
and deterministic guards.
