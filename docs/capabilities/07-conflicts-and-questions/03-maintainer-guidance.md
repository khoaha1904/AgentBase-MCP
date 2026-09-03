# 07.03 — Maintainer Guidance

> Status: The exact subject-property transaction is implemented; broad scope is deferred.

## Decision summary

Maintainer Guidance is attributed human knowledge, not absolute truth. In the
MVP it applies only to the exact Question subject/property.

## When to create Guidance

- A human answers a Question or makes an explicit project decision.
- The answer binds the exact Question ID/revision and `human:<identity>`.
- Provider/source evidence can resolve a Question without creating Maintainer
  Guidance; MCP does not misrepresent a provider observation as a human answer.
- A model suggestion does not become Guidance until a human confirms it.

Guidance is Markdown knowledge under `guidance/` and passes through proposal,
review, Accept and Publish like other concepts and Questions.

## Scope

| Scope | Applies to | Authority |
|---|---|---|
| `subject-property` | Exact concept/relation candidate and property being asked about | Default. |
| `repository` | One canonical Repository ID | Not used in the MVP. |
| `domain` | One canonical Domain ID | Not used in the MVP. |
| `hub` | All Hub authority | Not used in the MVP. |

Do not generalize from wording such as “usually” or “probably,” or from multiple
repositories using the same value. AI does not promote an exact answer into
Domain-wide or Hub-wide policy automatically.

A broader decision is recorded as an evidence-backed update to the relevant
Repository, Domain or System concept through a normal Proposal. MCP does not
create a broad Guidance scope engine.

## Guidance document

A Guidance revision retains:

- stable Question ID/revision and human identity;
- normalized scope kind/target;
- a concise answer/decision;
- evidence/reason supplied by the maintainer, when available;
- creation time and a link back to the Question.

The existing `guidance/<question-id>-r<revision>.md` path is reused. The Question
points to active Guidance; older revisions remain readable as history, but query
does not present them as current guidance by default.

## Conflict with new evidence

- Supporting evidence adds provenance and does not create an identical Guidance document.
- New conflicting evidence moves the Question to `Needs Review`; active Guidance
  remains but is presented as contested.
- Human review can retain the Guidance, create a replacement revision or withdraw it.
- Only an accepted revision returns the Question to `Resolved`.

Guidance does not automatically become the winning truth. Conflicting evidence
creates or retains a Question instead of letting the engine silently pick a winner.

## Volatile values

A human can confirm an observed value, but Guidance must state that it is user
evidence and identify its time/revision. For a value prone to staleness, use an
observed snapshot and file source under Section 08; do not turn a user-provided
number into timeless configuration truth.

## Atomic answer transaction

An answer proposal must atomically:

1. create new Guidance revision;
2. update the Question state and active Guidance link;
3. include any related knowledge/relation update selected for the same resolution.

If the proposal has not been Accepted, Published Question/Guidance remains
unchanged. A stale Question revision, invalid scope or conflicting Hub base stops
the operation before mutation.

## Security and access

- The current Hub permission model allows Hub readers to read all Guidance.
- Do not add per-project ACLs or Domain-based redaction.
- An Answer/Guidance must not contain a secret, credential or signed URL.
- The trust boundary reuses the obvious-secret detection for observed snapshots
  before creating a proposal; pull-request review remains the final sensitivity
  gate. Do not build a separate DLP engine.
- Human attribution is an audit identity, not a cryptographic signature or
  permission escalation.

## Baseline impact

Reuse the current Guidance renderer/path, explicit `human:*` attribution and
proposal lifecycle. Exact scope and atomic Question updates need no policy engine
or rules database; Git retains prior revision history.
