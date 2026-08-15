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
