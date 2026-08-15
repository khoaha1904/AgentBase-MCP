# Current capability

Active capability: [`018-confirmed-domain-navigation`](018-confirmed-domain-navigation/spec.md).

Most recent completed: [`017-scalable-hub-navigation`](017-scalable-hub-navigation/spec.md).

Capability 017 keeps AgentBase-Hub as the only durable knowledge store. It adds
canonical evidenced relationships, ordered cross-repository flow steps,
progressive Domain/System navigation, domain-scoped deterministic search,
bounded traversal and changed-set re-ingest validation. Generated qualification
covers ten domains and one thousand concepts without sending the full Hub to an
agent call. The real V9 Shopping Cart bundle is published, unmerged, as Hub PR
#7 for human review. It explicitly adds no embeddings, vector database, daemon,
durable derived graph or question ledger.

Capability 018 adds explicit owner-confirmed Domain context to repository
authoring and prevents a repository proposal from replacing the shared Hub or
category index identity. It does not change new/refresh lifecycle semantics.

## Review breakpoint

Implementation is committed through `3bbbb9d` and the last full offline
verification passed 339 tests. The real Shopping Cart qualification was bounded
to two attempts:

- V10 run `2026-08-15T171650Z` found all eight reference concepts but was
  structurally invalid because generated index entries used `-` instead of the
  OKF-required `*`. The failed evidence is retained in commit `68a00a8`.
- The generic index-marker instruction was corrected in commit `3bbbb9d`. V11
  run `2026-08-15T172701Z` then succeeded, passed OKF validation and was assessed
  as reviewable: 100% reference concept coverage, 100% recognized schema
  agreement, 88% metadata completeness, 82% provenance coverage and 86%
  reference relationship coverage.
- V11 still needs owner revision because the authored OKF does not expose the
  conflicting cart-retention TTL claims with their source evidence in a
  `Limitations` section. Conflict visibility means retaining incompatible source
  claims as explicit uncertainty; it does not mean guessing which claim is
  correct.

The V11 result directory is intentionally uncommitted at
`benchmark/results/aws-serverless/aws-serverless-shopping-cart/2026-08-15T172701Z/`.
Open Hub PR #7 is unchanged and still represents the earlier V9 proposal; it has
not been rebuilt or merged. No V12, prompt correction, proposal rebuild or PR
replacement is authorized at this checkpoint.

The next session must review V11 first and choose whether to accept it as the
qualification evidence or approve one bounded, generic improvement for honest
conflict retention. Only after that decision should it commit the V11 evidence,
rebuild the Hub proposal, replace PR #7 and complete capability 018. Question
management and exact init-versus-refresh semantics remain separate future work.
