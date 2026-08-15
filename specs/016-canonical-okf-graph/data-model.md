# Data Model: Canonical OKF Graph

## Concept

- Identity: bundle-relative Markdown path without `.md`.
- Category: Domain, System, Component, Interface, Flow, Resource,
  Infrastructure, Deployment, Repository or an open-world type.
- Sources: bounded provenance records. Repository sources identify the
  contributing repository independently from concept path.
- Relationships: Markdown links, optionally accompanied by queryable typed
  relationship metadata.

One entity has one Concept identity. Directory containment is classification,
not ownership.

## Proposal

- Subject: logical review focus under an admitted canonical category.
- Source repository ID: evidence authority for this ingest.
- Base/tree/diff digests: unchanged optimistic-concurrency boundary.
- Changed paths: computed proposal diff and reviewed before one atomic accept.

`new` adds a not-yet-existing subject and selected concepts. `refresh` enriches
an existing subject. A refresh can update a mutable canonical concept outside
the subject subtree only when it cites the current source and preserves foreign
repository sources.

## Authoring assessment

- `validity`: conformant or invalid.
- `ownerReview`: useful or needs revision, with findings.
- `coverage`: non-exhaustive diagnostic against hidden probes.
- `telemetry`: calls, bytes, tokens and elapsed time; never a quality override.
