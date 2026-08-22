# Data Model: Reviewable Hub Pull Requests

## Pending proposal

- Existing immutable proposal, subject, source Repository, evidence/diff digest,
  catalog, parent commit and accepted commit fields.
- Optional `mode: new | refresh` parsed from new accepted commit trailers.
- Existing Git diff summary retained for compatibility.

## Review summary

- `title`: bounded deterministic publication title.
- `body`: six fixed Markdown sections.
- Inputs: selected pending proposals plus optional validated retained
  inspection metadata.
- No credential, token or local filesystem root field.

## Publication unit

- Proposal IDs and exact accepted commits represented by the unit.
- Head branch and head commit.
- Base branch and expected base commit.
- PR number and URL after creation/recovery.

## Publication receipt

- Stable selection identity, Hub repository and remote `main` base.
- `mode: batch | stack`.
- Ordered proposal IDs and commits.
- Ordered publication units.

## State transitions

```text
selected → base admitted → branch admitted/pushed → PR recovered/created → receipt
```

A stack repeats the branch/PR steps in order. Failure preserves completed units
remotely; retry re-admits their exact identity before continuing.
