# 10.04 — Conflict-aware responses

> Status: Published Question/Guidance and conflict presentation are orchestrated
> by the public `agentbase-query` skill through current query primitives.

## Outcome

A conflict is a successful knowledge result with uncertainty. Query returns the
positions, provenance, applicable Maintainer Guidance and Question; it does not
create a `final_value`, trust score or select a winning source automatically.

## What becomes a conflict group

Query groups by exact governed subject and property or a natural relation/identity
candidate key. It creates a conflict group when:

- observed values have the same subject/property but different exact typed scalars;
- governed relation/resource identity candidates compete;
- new evidence conflicts with active Maintainer Guidance;
- a Shared Question records a bounded semantic conflict.

`7`, `"7"` and `"7 days"` are not automatically normalized into one value. MCP
does not run NLP across the entire Hub, convert units or infer prose conflicts.
Prose participates only when a Question retains a bounded summary and exact evidence.

## Position model

Each position retains:

- subject/property or candidate identity;
- exact value/relation/identity statement;
- knowledge kind and source role;
- source reference, source/Hub revision and observed time/age when available;
- Published Hub or transient current-source position and exact attribution.

Positions with the same exact typed value/statement can be grouped to reduce
repetition, but every source/provenance remains. Different positions are not
overwritten, averaged or collapsed based on recency, source role, human
attribution or publication state.

## Guidance and Questions

- Active Maintainer Guidance is shown as attributed human direction with exact
  scope and Question revision; it is not absolute truth.
- `Needs Review` Guidance is labeled `contested` and keeps new evidence beside it.
- An `Open`/`Needs Review` Question clearly shows the missing action.
- A `Resolved` Question can still accompany competing current positions; resolved
  only means no maintainer action is pending at that revision.
- A conflict without a Question is labeled `untracked conflict`; query does not
  create a Question/proposal automatically.
- A Question with missing evidence but no answer remains useful knowledge; query
  does not create a placeholder position.

Exact Question-scoped Guidance is clearly labeled as human direction. A broader
decision resides in evidenced Domain/System knowledge, not in a broad Guidance
scope engine.

## Snapshot-default and current source

For a volatile value:

1. add every relevant Hub snapshot to positions first;
2. only when the user explicitly asks for current state or the task genuinely
   needs exact code, add the current-source result as a separate position with
   current source state/access;
3. if current source differs from the snapshot/Guidance, retain all and mark a conflict;
4. when source is unavailable, retain the snapshot and reason without discarding the old position.

A current read does not mutate an observation, Question or Guidance. A later
Refresh or resolution must still create a Local Draft and pass review.

Age, conflict, a Question or source availability does not trigger a current read
automatically. Query also does not read source merely to select a winning position.

## Human-readable default

The response presents a short answer first, then detail/provenance:

```text
⚠ TTL currently has multiple sources:
- 7 days — configuration snapshot, repository commit abc…, observed 5 days ago
- 30 days — documentation snapshot, repository commit def…, observed 12 days ago
- Maintainer Guidance: 7 days — human:maintainer, subject/property scope
Question: Needs Review — new evidence conflicts with Guidance
```

The Agent can say “Guidance currently directs use of 7 days,” but cannot say
“TTL is definitely 7 days.”

## Structured composition

Existing query primitives remain separate. Host composition uses a bounded
semantic envelope rather than a new universal answer tool:

```text
status: ok
uncertainty: none | conflict | missing-evidence
subject / property
positions[]
guidance[]
questions[]
limitations[]
omitted_count
```

Every position/guidance/question retains its own layer and provenance. Combined
Published/current-source results may visually group identical positions but
never erase attribution. Bounded truncation follows the underlying query limits
and reports `omitted_count`; the model does not choose which conflicting source
to hide by preference.

## Current versus Git history

- Default query uses Published positions plus relevant Question/Guidance.
- Reviewed correction/removal changes the Published bytes after merge.
- Prior bytes remain in Git history; MVP has no per-item retired state/query.
- Local Draft changes remain visible through proposal inspection and PR review,
  not ordinary query.

## Failure boundaries

- Invalid reference in one position does not promote another position to truth;
  mark the invalid/broken provenance and preserve safe siblings.
- Shared Question index/cache failure must rebuild from exact Hub documents;
  private ledger/cache never becomes authority.
- Source permission failure returns Hub positions plus degradation reason.
- Unsafe value is redacted per position without hiding the whole conflict.
- Query never changes lifecycle state, answers a Question or publishes Guidance.

## Minimal implementation impact

Host response rules live in `agentbase-query` using current primitives. No
scorer, confidence engine, conflict database, universal query tool or new
dependency is justified.
