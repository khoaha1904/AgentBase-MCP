# 03 — Concept discovery

> Status: Candidate/guidance foundation and Capability 046 Discovery
> Seed/Inventory coverage are implemented.

High-level decision:
[How are concepts identified?](../../present/03-how-concepts-are-identified.md)

## Decomposition

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — current
  signal/schema baseline, gap and impact.
- [`01-candidate-discovery.md`](01-candidate-discovery.md) — create candidates
  from graph and source signals.
- [`02-concept-qualification.md`](02-concept-qualification.md) — identity and
  query value required for a concept.
- [`03-evidence-and-provenance.md`](03-evidence-and-provenance.md) — evidence,
  sources and claim limits.
- [`04-existing-concept-matching.md`](04-existing-concept-matching.md) — compare
  Published Hub and Local Draft.
- [`05-candidate-review.md`](05-candidate-review.md) — promote, keep a Question
  or discard a candidate.

## Current implementation delta

Initial Ingest guidance requires an identity basis, query/link value,
standalone/embedded disposition and exact owned observations. There is no
numeric confidence engine, candidate database or unrelated-Draft search.
Outcomes are reviewed in the current proposal; deep cross-repository matching
belongs to Domain Enrichment.

Runtime checks coverage before schema selection: every important discovery group
must map to a concept, embedded item, Question or ignored reason. This is a
private session/Receipt contract, not a candidate registry, UI or new public
tool.
