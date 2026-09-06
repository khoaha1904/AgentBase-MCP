# 03 — Baseline and impact checkpoint

> Status: Identity/query-value gates and Group 5's independent reading boundary
> are implemented. The G5-C2 semantic critic is deferred and inactive; no
> numeric scoring is used.

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

Repository-local evidence now has a default dossier outcome and standalone
promotion requires independent reading value. A fresh-context critic may be
reconsidered only if observed ingest defects justify product-integrated review.

## Implementation result

A lightweight evidence-bearing boundary was added through skill, MCP input and
validation without a model runtime or scoring subsystem.

Building a deterministic discovery/scoring engine that understands every
language/provider remains a **Near rewrite** and is unnecessary. The current
release keeps the Agent as reasoning layer and MCP's implemented deterministic
guards; it adds no critic packet/report workflow.
