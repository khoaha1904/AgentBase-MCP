# 08 — Observed snapshots and source references

> Status: Snapshot-first behavior, AWS/SQS observation, local freshness reporting
> and read-only Hub CI are implemented.

## Short answer

The Hub stores a few small, useful values as **observed**, with their source
file, revision and observation time. AgentBase does not build a live-reference
engine for every symbol, function or configuration field.

```text
Observed values:
- TTL: 7 days
- Batch size: 100

Source: crawler-api / config/queue.ts
Observed: commit abc123 / 2026-08-22
```

One file reference may provide provenance for several observed values. The Hub
does not snapshot all configuration, source or provider responses.

## During a query

- A normal query returns the snapshot with revision/time and a freshness warning.
- Hub freshness returns warning-only Repository entries, prioritizing unknown and
  then oldest; it does not call source or trigger Refresh.
- If the user asks for the **current value** and source is local/workspace, the
  agent reads the file/Code Graph through normal MCP; it does not call a separate
  symbol resolver.
- Another source repository is read only through bounded MCP repository access with
  an MCP-managed token. The agent does not use `gh` or a separate credential.
- Without access or when source is unavailable, return the observed snapshot and
  state that the current value could not be verified.
- A broken file reference keeps the snapshot; Refresh or a maintainer may propose
  a shared Question through a reviewable proposal.

A snapshot must not be described as current truth. Exact age/revision is shown;
there is no TTL-threshold engine or automatic Refresh.

## When is a snapshot stored?

- The value is small, non-sensitive, readable and useful in Hub/query views.
- The value is directly present in code/config/docs that Ingest/Refresh can record.
- Canonical ARN/name/account/region belong in external identity metadata when
  provider evidence verifies them, not duplicated as snapshots. Only small
  operational scalars use observed values; provider CLI belongs to Domain Enrichment.
- A small detail with no query value is omitted rather than snapshotted for coverage.

## Authorization and sensitive data

The Hub is a shared trust boundary: anyone who can read it can read every snapshot.
Credentials, tokens, secrets, signed URLs, connection strings and equivalent
sensitive data must never be snapshotted or Published.

A reference may say that configuration uses a secret or Parameter Store path, but
it must not store or resolve the secret value. Excluding one value must not fail
other safe knowledge items. A Published secret must stop being returned, be
removed through a reviewed proposal and be rotated outside AgentBase when needed;
the MVP does not build incident management.

## Boundary

- A source reference is provenance/file navigation, not an executable locator.
- A snapshot is observed knowledge, not a second source of truth.
- Reading current source is a normal MCP source-reading action when needed.
- Provider lookup runs only inside confirmed Domain Enrichment, never in Ingest or
  ordinary Hub query.
