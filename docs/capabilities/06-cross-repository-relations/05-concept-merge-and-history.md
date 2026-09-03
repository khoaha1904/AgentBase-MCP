# 06.05 — Published concept merge boundary

> Status: Explicitly deferred beyond MVP; this file is not an implementation
> contract.

## MVP decision

- Duplicates in the current proposal may be coalesced before Accept.
- A new candidate may enrich a Published canonical concept when it does not
  require deleting another Published identity.
- When both concepts are Published, retain both and create a Question/merge
  candidate with strong duplicate-identity evidence.
- Provider verification does not merge, Accept or Publish automatically.
- MVP has no redirect document, automatic canonical selection or Hub-wide link
  rewrite.

Same name, schema or model confidence is insufficient to treat two concepts as
one. A Question retains exact identities, evidence and the reason for suspecting
a duplicate so it can be handled later without losing provenance.

## When to revisit

Open a separate capability only when the real Hub contains Published duplicates
that require handling. The design must then decide canonical selection, history,
old-path behavior, relationship rewrites and rollback before implementation. The
old detailed redirect draft is no longer current authority.
