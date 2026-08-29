# 01.03 — Source evidence resolution

> Status: The exact local source/reference boundary is implemented.

## Decision

Code Graph finds candidates; exact source supports claims. The Hub stores
knowledge, bounded provenance and references, not source or a second graph.

```text
graph candidate
      ↓
exact snippet/config/docs read
      ↓
knowledge claim + source reference
      ↓
optional small observed snapshot
```

## Required evidence

An attributed claim must resolve to repository identity, source revision and a
relative file path; a line span is an optional evidence hint. A graph summary
without exact source is only a discovery signal and cannot become a claim.

When exact source cannot be resolved, the Agent retains a limitation, candidate
or Question. It does not copy a raw snippet into the Hub to compensate for a
weak reference.

## Small snapshots

A snapshot is optional and keeps Markdown useful when read directly by a person:

- a value visible directly in code/config/docs can be recorded immediately;
- retain only a small scalar or identifier with knowledge value;
- always include the source revision and observed time;
- wording must say `observed`, not claim it is the current value;
- never snapshot a secret, raw source, config dump, provider response or graph.

A resource name, ARN, region or account ID may be useful identity/metadata, but
is recorded only when source or provider evidence verifies it.

## Provider evidence

Ingest/Refresh does not call a provider CLI merely to fill missing data. If a
name, ARN or non-sensitive value requires AWS/Azure CLI, Ingest retains a
reference/candidate or Question and continues.

After multiple repositories exist, Domain Enrichment:

1. uses a provider skill after the user logs into the CLI;
2. resolves bounded candidates for the batch;
3. adds observed snapshots, identity or relation evidence;
4. puts every change into a separate Domain Enrichment Draft for
   review/publication.

## Baseline gap

The current runtime supports optional bounded snapshots but still carries live-
target semantics. Section 08 cleanly cuts over to file-level observed values; it
does not grant permission to store arbitrary source content.
