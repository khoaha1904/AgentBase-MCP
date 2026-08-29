# 03.05 — Candidate review

> Status: Candidate state is intentionally transient; a dedicated review UI is
> outside the MVP.

## Lifecycle

Candidates exist only during Ingest/Refresh proposal preparation and review:

```text
candidate
  ├─ qualified + evidenced → concept/relation/evidence update
  ├─ useful but unresolved → Question
  └─ no independent value  → discard
```

A candidate is not an OKF concept type, publication item or Hub entity. There is
no candidate database, Published Candidate or candidate migration.

## Review outcome

- Promote creates only a knowledge item that passed schema/evidence validation.
- Question retains the exact ambiguity, candidate references and next
  verification action.
- Discard leaves no Hub content; run diagnostics may count or summarize discard
  reasons but do not publish raw candidate inventory.
- Discarding in one run does not create an ignore/suppression record; new source
  or a later Refresh may bring the candidate back.
- Until review completes, the candidate stays in the mutable proposal workspace;
  Accept includes only outcomes materialized as valid knowledge items.

## Recovery

An interrupted run can rebuild candidates from source/graph. Candidates do not
need recovery as durable business data. Only validated proposal outcomes require
exact recovery under the Hub lifecycle.
