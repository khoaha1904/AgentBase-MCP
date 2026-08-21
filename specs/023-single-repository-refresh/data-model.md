# Data Model: Single-Repository Refresh

## RefreshTarget

- canonical Repository ID and strong match evidence
- authorized checkout root, private only
- clean revision or dirty digest
- last successfully observed contribution state

Exactly one existing Repository match is required. New routes to Initial Ingest;
ambiguous requires owner choice.

## RefreshBaseline

- exact active local `main` commit
- admitted Published base plus accepted-local unpublished ancestry
- isolated complete lifecycle bundle, private only
- bounded continuity, known gaps and omitted counts

Unaccepted proposals are never selected implicitly. An explicit retry binds its
own repairable session and exact base. The full bundle never becomes model context.

## LifecycleIntent

- `action`: `remove-contribution`, `remove-concept`, `supersede` or `retract`
- affected concept and current-Repository source IDs
- bounded reason and exact revision/diff evidence
- replacement concept for `supersede`
- affected relationships and navigation

Omission, age or search absence alone is insufficient. Foreign sources and
protected content remain present. Whole-concept deletion is limited to mutable
AgentBase-owned content with no remaining foreign/protected value.

## RefreshCoverage

- `partial`: true exactly when limitations are non-empty
- bounded concrete limitations
- ordered changed-source, known-gap and discovery summaries

## RefreshResult

```text
prepared -> authored -> validated -> no_change
                                \-> reviewable_draft
prepared/authored/validated -> incomplete
```

Only `no_change` or `reviewable_draft` may report the new observed state.
