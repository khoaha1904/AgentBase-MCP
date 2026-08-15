# Data Model: Scalable Hub Navigation

## Concept summary

- Exact accepted Hub commit.
- Canonical concept identity and Markdown path.
- Type, title and description.
- Direct canonical relationships.
- Reachable Domain and System identities derived from `part-of` edges.
- Repository source identities derived from `sources[].resource`.

Summaries are request results, not durable files.

## Canonical relationship

- `source`: canonical concept identity.
- `kind`: one AB-SCHEMA-019 predicate.
- `target`: canonical concept identity.
- `evidence`: one or more stable source IDs from the source concept.

Only one direction is stored. Inbound traversal derives the reverse view.

## Business flow step

- `order`: positive unique integer within the flow.
- `source`: canonical participating concept identity.
- `action`: `invokes`, `publishes`, `delivers`, `reads` or `writes`.
- `target`: canonical participating concept identity.
- `mode`: `synchronous` or `asynchronous`.
- `evidence`: one or more stable source IDs from the flow concept.

## Search result

State is either:

- `ok`: bounded ranked concept summaries at one commit; or
- `scope_required`: candidate Domain identities and no concept bodies.

## Traversal result

- Exact start identity and commit.
- Bounded node summaries.
- Bounded edges with stored direction, evidence and traversal depth.
- `truncated` indicator when a configured node/depth limit stops expansion.

## Continuity manifest

- Exact base commit and source repository identity.
- Logical proposal subject.
- Current-source concept summaries.
- Subject summary when it exists.
- One-hop inbound and outbound neighbor summaries and edges.
- Relevant root/category index paths.
- Explicit truncation counts if any bound is reached.

The full accepted bundle remains on disk and is not serialized into the
manifest.

## Changed concept validation input

- Full bounded Markdown for concepts created or modified by the author.
- Target summaries containing identity, path and type for unchanged targets.
- No unchanged concept body and no total-Hub count dependency.
