# 03.02 — Concept qualification and identity

> Status: Identity/query-value qualification is implemented.

## Qualification

A candidate becomes a concept only with both stable identity and independent
query/link value. A schema role, source file or technology keyword cannot replace
either gate.

## Identity precedence

When matching a candidate:

1. exact canonical concept identity confirmed by source/provenance;
2. strong provider/source-native identity such as a Terraform address, API
   method+path, ARN or provider+account+region+resource type+resource ID;
3. repository-scoped logical identity with a stable contract/source anchor;
4. display name or semantic similarity creates only a candidate match and does
   not confirm the same entity.

Without strong identity, the Agent does not auto-merge. It may keep a separate
candidate/Question for later Domain Enrichment verification.

## Canonical path and technical identity

The Hub path is a logical human-readable identity, for example:

```text
resources/vehicle-events-queue
```

ARN, Terraform address, provider account/region or API route are attributed
metadata/references used for matching. They do not replace the canonical path or
create a provider-specific directory tree.

A logical resource may have multiple deployment identities by environment or
region; section 06 owns reconciliation/multi-region modeling and does not solve
it by stuffing every ARN into the canonical path.

## Guards

- The same name does not mean the same concept.
- A rename does not create a new concept automatically when strong identity/
  continuity remains.
- Two different strong identities are not auto-merged because their prose looks
  similar.
- An existing Published concept is enriched on a confident match; protected
  content is not rewritten merely because a new candidate has richer metadata.
