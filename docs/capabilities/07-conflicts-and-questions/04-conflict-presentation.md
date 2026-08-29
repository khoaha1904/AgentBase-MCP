# 07.04 — Conflict presentation

> Status: The technical design is settled; query composition in Section 10 is not yet implemented.

## Decision summary

A conflict is a successful knowledge result with uncertainty, not an ingest or
query failure. MCP presents the positions, provenance, Guidance and Question; it
does not invent a `final_value`.

## Human-readable response

The default response for a conflict should be concise and direct:

```text
⚠ TTL currently has multiple sources:
- 7 days — repository configuration, observed at commit abc…
- 30 days — repository documentation, observed at commit def…
- Maintainer Guidance: 7 days — human:khoa, reviewed 2026-08-22
Question: Needs Review — guidance conflicts with new evidence.
```

The user still sees Guidance clearly, but MCP does not claim that “TTL is
definitely 7 days.” For an observed value, snapshot/current-source/permission
state is presented under Section 08.

## Structured response semantics

Section 07 requires the query layer to provide bounded groups:

- subject/property or relation/identity candidate;
- distinct positions/observations;
- source role, reference, revision/time and freshness marker;
- applicable active or contested Maintainer Guidance;
- linked Question ID/state;
- limitations and omitted counts.

The exact MCP response schema belongs to Section 10. A conflict does not turn a
normal query into a tool error; the response succeeds with an explicit uncertainty marker.

## When to treat something as a conflict

- structured observations for the same subject/property have different normalized values;
- canonical relation/identity candidates compete with supporting evidence;
- new evidence contradicts active Guidance;
- an explicit Question records a semantic conflict that cannot be normalized safely.

MCP does not run NLP across the entire Hub to guess which prose conflicts. A
prose conflict becomes a governed conflict only when a proposal/Question retains
exact evidence and a bounded summary.

During repository discovery, source roles are not forced into a single winner:
code, configuration, API specifications and IaC can describe implemented or
desired technical state; README files and documentation can describe intent or
an older contract. A material conflict affecting behavior, ownership, relations
or operations creates a grouped Question. Minor differences can remain as
attributed claims/snapshots without blocking Init.

## Ordering, not truth ranking

Presentation order is deterministic for readability:

1. active or contested Maintainer Guidance, clearly labeled as human guidance;
2. observed implementation/config/provider positions; current-source evidence
   appears only when the user explicitly requests a current read;
3. documentation and other source-backed positions;
4. Question, limitation and history links.

This order is not a trust score. Recency, source role or human attribution does
not silently discard another position. Duplicate normalized observations can be
grouped while listing multiple provenance sources.

## Context boundaries

- Query shows only conflicts directly relevant to the current answer/traversal.
- Do not dump every Domain or Hub Question into one response.
- A bounded omitted count indicates additional sources/positions not shown.
- An explicit Question query can open the full current state and linked evidence.
- A Resolved Question still shows every competing position that remains current
  alongside the accepted resolution. Reviewed correction/removal moves old bytes
  into Git history.

## Hub documents and pull-request review

- Question Markdown retains a short positions/evidence summary for human Hub readers.
- A Concept can link to a Question but does not copy the entire conflict history.
- The pull-request summary groups Questions, conflicts, limitations and Guidance
  changes before the reviewer opens the raw Markdown diff.
- An Open Question is published normally when the proposal is truthful and valid.

## Failure/degraded cases

- Source access is lost: retain the Hub position/snapshot and mark it unavailable.
- Reference is stale/broken: retain the position with a marker; do not delete it.
- Too many positions: use a deterministic bound and omitted count; do not select
  a subset of sources according to model preference.
- A Question/cache index is corrupt: rebuild it from the exact Hub commit; do not
  return the private cache as authority.

## Baseline impact

Reuse Hub query summaries, evidence references, Question/Guidance Markdown and
freshness metadata. Do not add a scorer, confidence engine or persistent conflict
index; query can derive a bounded presentation from the exact Hub commit.
