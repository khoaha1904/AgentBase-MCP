# Data Model: Confirmed Domain Navigation

## Confirmed Domain

- `identity`: exact canonical identity matching `domains/<slug>` without `.md`
- `title`: non-empty bounded display title
- `evidenceResource`: deterministic
  `agentbase://owner-guidance/<identity>` value derived by AgentBase

Validation rejects unknown fields, path traversal, nested arbitrary roots,
empty titles and noncanonical identities before session creation.

## Authoring Session

The existing private session optionally carries the normalized Confirmed Domain.
Its deterministic session identity includes that value. Finalization supplies it
to new/refresh proposal validation; it is not a second durable knowledge store.

## Authored Domain membership

- A concept exists at `<identity>.md` with type `Domain`.
- Its sources contain the exact owner-guidance resource.
- The current repository remains represented by its own Repository concept and
  normal repository source resources.
- A System uses canonical `part-of` with evidence resolving to the same
  owner-guidance resource.

## Shared Index

An accepted index is any existing file named `index.md`. A proposed index is
additive when all accepted nonblank lines occur byte-for-byte and in the same
order. New blank lines and navigation lines are allowed; deletion, mutation or
reordering of accepted nonblank lines is rejected.
