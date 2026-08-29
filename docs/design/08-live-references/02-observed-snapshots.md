# 08.02 — Observed snapshots

> Status: Repository observed snapshots are implemented.

## Outcome

A Concept retains a few small, useful values for immediate understanding by Hub
readers, without turning the Hub into a copy of configuration/source.
`agentbase.observed_values` is the only authority; the Markdown section is only a
view rendered from the same data.

## Authoring boundary

A value is snapshotted only when all of the following hold:

- it is non-sensitive and passes the shared sensitive-value guard;
- it is scalar/single-line and within the bounds from Section 08.01;
- it has clear query or review value;
- it is attributable to an admitted Repository/provider source and exact
  source-kind-specific observation state;
- it helps explain an important operation, integration or behavior of the concept.

Do not snapshot for coverage, copy an entire configuration/provider response or
create a placeholder for a missing value. Direct source evidence can be recorded
during Ingest/Refresh; provider-derived values enter only a confirmed Domain
Enrichment proposal.

## Human-readable view

If a concept has observed values, the renderer creates a short section:

```markdown
<!-- agentbase:observed-values:start -->
## Observed values

| Property | Observed value | Role | Source | Observed at |
|---|---:|---|---|---|
| `session_ttl_days` | `7` | configuration | `config/queue.ts` | `abc123`, 2026-08-22 |
<!-- agentbase:observed-values:end -->
```

The table is not a second authority: the renderer derives it from structured
entries, the validator rejects manual drift and Refresh regenerates only this
owned section. A value must remain labeled `Observed`; the table does not use the
word `current`. A source can be a shared file reference for multiple rows. Renderer displays normalized property
and literal scalar; it does not invent labels, units or formatting.

The two comments delimit one renderer-owned section. When structured entries
exist, normalization replaces exactly one prior owned section or appends one;
when none exist it removes that section. An unmarked manual `## Observed values`
heading is rejected to avoid two competing views. Rows sort by ID. Cells use
literal normalized property/role, JSON scalar text, repository path without the
URI prefix and full RFC3339 time; backslash and pipe are escaped for a Markdown
table. Renderer never shortens commit/time in persisted bytes—the abbreviated
example above is presentation-only.

## Refresh behavior

- An exactly matched stream retains its ID and receives value/source state/time
  updates through a reviewed Refresh proposal.
- Missing evidence preserves the prior snapshot and may add a limitation;
  absence does not automatically delete it or change its status.
- Different sources for one subject/property remain separate entries and follow
  Part 07 conflict presentation.
- File move is an explicit source repair that keeps the stream ID.
- No query or source read writes back to Hub; only an accepted proposal does.

## Acceptance boundary

- Maximum 64 entries per concept and existing concept/bundle size limits remain.
- Snapshot section is omitted when no useful values exist.
- Secret-like input is rejected before rendering and publication review remains
  the final safety gate.
- Snapshot age affects presentation only; it never turns value into truth,
  deletes it or schedules Refresh.
