# 09.08 — OKF Freshness

> Status: Observation metadata, value age, the Repository report and warning-only CI are implemented.

## Boundary

OKF Freshness describes how long ago a repository/source contribution was
observed and at which revision. It is independent of Code Graph cache freshness
and does not judge whether knowledge is correct.

## Source contribution metadata

A successful Ingest/Refresh retains at least:

- canonical Repository ID;
- observed source revision or dirty digest;
- observed/refreshed time;
- partial/known limitations from the run.

A concept with multiple repository sources presents freshness per contribution
and does not assign one artificial timestamp to the entire concept.

## MCP query presentation

Query adds derived information beside the result without rewriting Markdown:

```text
observed 47 days ago at revision abc123
```

Ordinary snapshot query does not probe the source and returns `not-checked`. If
an explicit current-source/Refresh operation already has authorized source state,
the response may add:

- exact source match: observed revision still matches current source;
- source advanced: refresh may be useful;
- repository mismatch/unavailable: freshness comparison unknown; still show age.

There is no automatic action, result hiding or publication-state downgrade.

## Scheduled CI summary

The internal Hub CI boundary produces the structured Repository-level
projection in memory. Ordinary MCP/CLI query has no dedicated freshness action.
The projection reads admitted Published bytes and writes no report file.

GitHub Actions reuses that projection weekly and on Hub PR/main checks. It writes
only the ephemeral Actions Summary; freshness never changes the exit status.

A future capability may persist a derived output, for example:

```text
reports/okf-freshness.md
```

The report lists Repository ID/title, last observed time, age, revision and known
limitations, sorted oldest/unknown for maintainer review. The first version needs
no stale threshold; it always shows exact age instead of assigning an arbitrary label.

The report is not a source of truth and can be rebuilt. A GitHub Actions summary/
artifact is the simplest output. If the file is persisted to Hub Git, CI creates
a pull request; it does not push directly to `main` or trigger Refresh.

## Remaining gap

Persisted Markdown, ordinary-query freshness marks and multi-source contribution
aggregation are not implemented. Per-value snapshot query already exposes exact
age; the first Hub-wide report intentionally stays at the Repository Refresh checkpoint.
