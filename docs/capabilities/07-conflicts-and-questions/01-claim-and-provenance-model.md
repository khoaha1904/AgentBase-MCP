# 07.01 — Claim and provenance model

> Status: Observed-value Question integration is implemented; broader claim enrichment is deferred.

## Decision summary

AgentBase does not create a universal claim database or an ID for every sentence.
Knowledge retains its natural identity; only an assertion that needs independent
referencing, conflict handling or lifecycle management receives a structured identity.

## Knowledge identities

| Knowledge | Identity/provenance |
|---|---|
| Concept overview | Concept path + inline/source citations. |
| Observed implementation/config value | Stable `AB-OBS-*` + exact file source/revision. |
| Canonical relation | Source concept + predicate + target + evidence IDs. |
| External resource identity | Provider-native match key + evidence IDs. |
| Relation/identity candidate | Stable candidate key inside a Question. |
| Maintainer answer | Human identity + Guidance document + Question revision. |
| Question | Stable Question ID + shared Question document. |

Prose does not receive an ID merely so the engine can manage it. When a prose
assertion becomes a conflict requiring review, the Question retains a bounded
summary and exact evidence/reference; it does not copy the entire source or turn
every paragraph into a record.

## Multiple sources and conflicts

- The same observation from multiple sources retains complete provenance; query
  can group equal normalized values without losing their sources.
- Two conflicting observations coexist. They are not overwritten, averaged or
  selected by recency, model confidence or Published status.
- A user answer is an attributed position and does not erase repository/provider evidence.
- Missing or ambiguous evidence creates a Question or limitation, not a placeholder claim.
- Evidence that no longer appears during Refresh does not automatically delete an accepted claim.

Source authority and freshness are presented for the reader to evaluate, not
converted into a numeric truth score. Exact evidence may be sufficient to propose
a correction or removal, but explicit intent and review are still required.

## Structured claims boundary

Keep `agentbase.observed_values` for bounded snapshots with queryable values. The
current source can be reread when needed through normal MCP file/graph tools;
there is no semantic live locator. Do not expand snapshots into storage for every
business fact, configuration dump or provider response.

Relations and external identities use the natural identities from Section 06. A
Question can reference claim IDs, relation/identity candidate keys or exact
evidence resources, so a candidate without a canonical claim can still be governed.

A typed Question reference is always sufficiently namespaced to resolve across repositories:

```text
owning concept identity
+ item kind/natural key
+ exact source ID or source resource
+ observed source/provider revision when available
```

A source ID alone is not a global identity and is insufficient as a shared
Question reference. No global evidence registry is needed; the resolver reads the
reference at the exact Hub commit.

## Question versus limitation

- Create a Question when there is a specific action/answer and its resolution
  would change useful knowledge, a relation, an identity or Guidance.
- Record only a limitation when a minor detail is missing, does not affect a
  useful answer or has no bounded action yet.
- A broken source-file reference creates a Question because repair/replacement is
  a specific action; a staleness warning alone does not create a Question.

## Query contract

Query returns:

- current knowledge and provenance;
- competing observations when relevant;
- applicable Maintainer Guidance with attribution;
- Open or Needs Review Questions and limitations;
- source age/revision when available.

Query does not invent a `final_value`. If a summary is needed, it states the
positions and which sources support each one.

## Reuse and impact

Reuse concept sources, observed-value identities, relation evidence, provider
observations and Git history. The primary runtime change allows Questions to
reference typed evidence/candidates instead of requiring claim IDs from one
repository. Do not add a database or global confidence engine.
