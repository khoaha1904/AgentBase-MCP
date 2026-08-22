# Data Model: Shared Question Documents

## Question Document

Canonical path: `questions/<question-id>.md`.

- `id`: `question-` plus 24 lowercase hex; equals path identity.
- `revision`: positive integer; starts at 1 and advances exactly once per
  accepted document edit.
- `state`: `open | resolved | needs-review`.
- `kind`: `conflict | missing-evidence | relation-candidate |
  identity-candidate | maintainer-decision`.
- `origin_subject`, `origin_property`, `scope_key`: immutable identity inputs.
- `subject`, `property`: current bounded target.
- `references`: bounded typed references.
- `missing_evidence`, `limitations`: bounded human-readable lists.
- `guidance`: up to 16 links to Guidance identities.

Top-level OKF `status` is independent of Question governance `state`.

## Typed Reference

`owned-item` contains owner identity, item kind/key, source ID and optional
observed revision. Its source resolves within the owning concept.

`candidate-evidence` contains candidate key, exact source resource and optional
observed revision. It does not require a placeholder concept.

At most 64 references, missing-evidence entries and limitations are admitted.
IDs/keys are at most 256 UTF-8 bytes; summaries/reasons are at most 512 bytes.

## Question Index

Canonical path: `questions/index.md`. It is renderer-owned navigation and lists
each normalized Question target exactly once. It contains no independent state.

## Maintainer Guidance

Canonical MVP path remains `guidance/<question-id>-r<question-revision>.md`.
It binds exact Question ID/revision, `human:*` attribution, answer, creation time
and `subject-property` scope. Question `guidance` points to the current revision.

## State Transitions

```text
open ──accepted answer/evidence──> resolved
resolved ──explicit reopen───────> open
resolved ──conflicting evidence──> needs-review
needs-review ──accepted review───> resolved
```

MVP runtime requires the first transition and validates the others when
explicitly proposed. It does not infer conflicts automatically.

## Invariants

- ID/path and immutable origin never change.
- Previous to next revision differs by exactly one for a real edit.
- A resolution proposal contains both Guidance and Question transition.
- Unaccepted proposals do not alter accepted Question state.
- Question bytes are produced only by the dedicated renderer/transition path.
- Raw source, secrets, provider dumps and duplicated concept prose are invalid.
