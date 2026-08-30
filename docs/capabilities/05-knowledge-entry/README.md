# 05 — Knowledge entry

> Status: Proposal/template, Published-only query, remote-required OKF
> authority and exact profile isolation are implemented.

Product Contract:
[Knowledge lifecycle](../../product/03-knowledge-lifecycle.md)

## Contract map

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — baseline, gap and
  the decision to keep proposal/change set as publication unit.
- [`01-knowledge-item-model.md`](01-knowledge-item-model.md) — identities of
  concepts, claims, relations, Questions, evidence and proposals.
- [`02-overview-boundary.md`](02-overview-boundary.md) — what enters the Hub and
  what remains in source.
- [`03-local-draft-storage.md`](03-local-draft-storage.md) — map Local Draft,
  In Review and Published onto the current Git lifecycle.
- [`04-source-references.md`](04-source-references.md) — references from
  knowledge items back to source.
- [`05-layer-reconciliation.md`](05-layer-reconciliation.md) — synchronize,
  recognize Published proposals and retain pending work.
- [`06-runtime-requirements.md`](06-runtime-requirements.md) — current OKF,
  schema, live-claim and Initial Ingest `AB-*` requirements.

## Implementation delta

Git-backed proposals, exact Markdown skeleton/template, Local Draft commits,
inspection and publication receipts exist; there is no database or raw graph
store. Ordinary query is Published-only. Without remote configuration, only
Code Graph works; each normalized remote URL + branch keeps separate
Published/Draft state.
