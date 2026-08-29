# 07 — Conflicts, Questions and Maintainer Guidance

> Status: Governance foundations and AWS/SQS batch Question resolution are implemented.

## Short answer

The Hub allows conflicting claims to coexist when each claim keeps its source.
A Question records what is unresolved; a user's answer is scoped evidence, not
absolute truth.

Questions are shared Hub knowledge. Before Accept, a Question is in the proposal;
after Accept it remains a Local Draft for review. Only after the PR is merged and
another machine synchronizes the Published Hub does the Question appear in ordinary query.
Any private machine ledger is rebuildable cache, not authority.

## How are conflicts preserved?

- Multiple sources supporting one claim are retained as provenance.
- Conflicting claims are shown in parallel; the Hub does not choose by recency or
  Published status.
- Source role remains explicit: code/config/API spec/IaC describes implementation
  or desired technical state; README/docs may describe intent or an older contract.
  There is no universal “code always wins docs” rule.
- A source too ambiguous for a claim is kept with its candidate/Question.
- Unresolved Questions and limitations may still be Published when the unknown and
  related source are explicit.

Conflicts affecting behavior, ownership, relations or operations are grouped as
Questions. Small differences may remain as sourced snapshots/claims without
interrupting Initial Ingest.

## Question lifecycle

```text
Open ──user handles it──→ Resolved
                            │ new conflicting evidence
                            ↓
                        Needs Review
                            │ user handles it again
                            └──────────────→ Resolved
```

- `Open`: waiting for an answer or investigation.
- `Resolved`: no longer waiting; this does not mean a claim is absolute truth.
- `Needs Review`: older guidance conflicts with new evidence.

After the user evaluates evidence and updates guidance if needed, a Question in
`Needs Review` returns to `Resolved`.

Question state is independent from publication state. A `Resolved` Question may
still be a Local Draft, and an `Open` Question may already be Published.

## Maintainer Guidance

A user's answer is stored as user evidence or Maintainer Guidance; it does not
delete old sources. In the MVP, Guidance applies only to the exact Question or
subject being asked. A broader decision is written as a normal Domain/System
concept update through a Proposal, not through a separate scope engine.

New evidence aligned with existing guidance is added to provenance. Conflicting
evidence moves the Question to `Needs Review` while retaining old guidance and history.

Questions do not block every Ingest. Domain Enrichment may group Questions from
multiple repositories in one Domain, gather provider evidence and let the user
handle them in a batch. Every answer, state transition and resulting relation
still creates a new Local Draft before publication.

Domain Enrichment verifies first. Deterministic results only need to show their
evidence; a reasonable but unauthorized choice is presented with a recommended
option; no trustworthy answer is asked directly with context/example and may be
deferred. An unselected recommendation never becomes Maintainer Guidance.

## Incorrect or stale knowledge

The MVP has no `superseded/retracted` state. When evidence or a maintainer clearly
confirms a correction, Refresh creates a Proposal to edit or remove the exact old
knowledge/concept. Preview and PR state what is removed, why and with which
evidence; Git preserves history and permits revert.

Two conflicting sources alone are not enough to delete one side. The Hub keeps
both positions with provenance and a Question until there is clear grounds for change.
