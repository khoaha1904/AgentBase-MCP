# 03.04 — Existing concept matching

> Status: Bounded Hub/active-proposal matching is implemented for the current
> slice.

## Goal

Before creating a concept, the Agent runs one bounded match pass to avoid
duplicates. This is not multiple reasoning rounds or provider-wide discovery.

## Search scope

One pass compares:

1. candidates/concepts materialized in the current proposal;
2. the synchronized local Published Hub;
3. exact references/aliases/technical identities present in those results.

Unrelated Local Draft commits are outside ordinary match scope. The current
proposal deduplicates internally before Accept or Publish.

Ingest does not call a provider CLI or scan another repository to confirm an
indirect match. That belongs to Domain Enrichment.

## Outcomes

- Strong identity match: enrich the existing canonical concept.
- Same-run duplicate: combine evidence into one candidate/concept.
- Name/prose similarity only: keep a separate candidate or Question.
- No match: create a concept when the candidate passes qualification.

Match results never rewrite protected Published bytes. New evidence goes through
the normal proposal update/relation/Question flow.

## Efficiency boundary

Matching is a bounded Hub query by identity, alias and metadata, with preference
for confirmed Domain/current Repository scope. Do not repeat a full-Hub search
for every source line. Section 09 sets candidate and query budgets.
