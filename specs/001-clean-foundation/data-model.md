# Data Model: Foundation Code Intelligence Contract

These entities describe the provider-neutral public model. They do not prescribe
the fake provider's private storage or a future engine schema.

## Repository identity

- `repositoryId`: stable opaque identity within one AgentBase installation;
- `displayName`: human-readable repository label;
- `revision`: exact fixture/source revision label represented by a snapshot.

Repository identity contains no engine cache path or provider-private ID.

## Snapshot identity

- `snapshotId`: opaque identifier selected by the provider;
- `repositoryId`: repository the snapshot describes;
- `revision`: source revision represented;
- `completeness`: `complete` or explicitly `partial`;
- `limitations`: ordered provider-neutral diagnostic strings.

Capability 001's fake supplies complete snapshots only, but the contract cannot
mislabel a future partial result as complete.

## Code node

- `id`: stable within the snapshot;
- `kind`: provider-neutral category such as file, module, symbol or declaration;
- `name`: display name;
- `file`: repository-relative authored file path;
- `location`: optional one-based line/column range;
- `language`: optional normalized language identifier.

## Code edge

- `id`: stable within the snapshot;
- `kind`: provider-neutral relationship such as contains, imports or calls;
- `source`: source node ID;
- `target`: target node ID;
- `evidenceFile`: repository-relative file containing the relationship evidence.

Every edge endpoint must exist in the returned node set or be declared as a
boundary reference by a later contract version. Capability 001 permits only
complete endpoints.

## Repository map

- snapshot identity;
- ordered nodes;
- ordered edges;
- ordered diagnostics.

Normalization sorts by stable IDs and rejects duplicate node or edge IDs.

## Neighborhood query

- `snapshotId`;
- `subjectId`;
- `maxDepth`: bounded non-negative traversal depth;
- optional provider-neutral relationship-kind filter.

## Neighborhood result

A closed result union:

- `found`: snapshot identity, subject ID, completeness, ordered nodes, ordered
  edges and diagnostics;
- `snapshot-not-found`: requested snapshot ID;
- `subject-not-found`: known snapshot ID and requested subject ID;
- `invalid-query`: stable diagnostic code and safe message.

A known subject with zero neighbors is a successful `found` result with a
complete empty relationship set. It is not `subject-not-found`.

## Validation invariants

- IDs are non-empty and unique within their entity collection.
- Paths are repository-relative, normalized with `/` and contain no `..`
  segment.
- Every edge references existing nodes.
- Ordering is deterministic and independent of provider insertion order.
- Public entities contain no fake-provider or engine-private record.
