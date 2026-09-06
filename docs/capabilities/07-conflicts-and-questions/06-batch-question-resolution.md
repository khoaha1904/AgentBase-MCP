# 07.06 — Batch Question resolution

> Status: All three tiers are implemented for AWS/SQS Domain Enrichment; broader inference is deferred.

## Decision summary

Domain Enrichment reviews evidence first, then classifies each Question into one
of three tiers:

```text
deterministically verified → propose a resolution automatically and show only the result
strong but non-authoritative → ask the user with a recommended option
insufficient evidence → ask directly with context/an example, or defer
```

Automation here only creates an Enrichment Draft for review. It does not Accept
or Publish automatically, or turn a recommendation into truth.

## Tier 1 — Automatically verified

Use this tier when deterministic checks are sufficient to prove the outcome, for
example:

- an exact provider identity/account/region match through a released read-only operation;
- an exact Terraform input/output/remote-state chain resolves to the same target;
- an exact source revision proves a relation/configuration change;
- a candidate is proven false or not to represent the same resource.

The Agent does not ask a Question that MCP has already verified deterministically.
The batch summary shows only the proposed result, evidence, operation/profile
version and limitations. The user still reviews the entire draft before Accept.

Provider identity only verifies that resources are the same; a canonical relation
still requires interaction evidence under 06.01.

Tier 1 applies only to factual Questions with released deterministic verification
criteria. Product/policy decisions, ownership, concept merges, intended semantics
and maintainer authority always require Tier 2 or Tier 3, even when the technical
evidence is strong.

## Tier 2 — Recommended confirmation

Use this tier when the evidence clearly favors one option but the decision still
concerns semantics, ownership or maintainer authority.

The prompt must show:

- a concise Question;
- the main evidence and what is still missing;
- two or three concrete options, when available;
- one `Recommended` option with a reason;
- an option to defer or keep the Question Open.

Example:

```text
The two concepts appear to represent the same Vehicle Events interface.
Recommended: merge into domains/vehicle-data/knowledge/vehicle-events
Reason: they have the same Queue ARN and contract; only the repository names differ.
Other: keep separate / more evidence needed.
```

The recommendation exists only within the review interaction until the user makes
a selection. It is not persisted as accepted human evidence before confirmation.

## Tier 3 — Direct maintainer input

Use this tier when the source/provider has no reliable answer or the Question is a
product/policy decision. The Agent asks directly and provides:

- the available context/evidence;
- exactly what remains unknown;
- an example answer or expected format;
- plausible options when evidence genuinely supports them;
- `defer` when the user does not want to answer yet.

The Agent does not invent alternatives or mark one `Recommended` when evidence is
insufficient. An unanswered Question remains `Open` and does not fail the batch.

## Bounded re-investigation

Before asking the user, the Agent performs one bounded recheck pass:

- reread selected Published Hub evidence/references;
- compare selected repositories/candidates;
- reread an authorized source file when the workflow has access;
- invoke released provider verification for the exact candidate;
- do not clone repositories, build a cross-repository graph, scan an account or
  repeat reasoning until it forces an answer.

If the recheck moves a Question to Tier 1, the Agent shows the result instead of
asking. If ambiguity remains, it moves to Tier 2 or Tier 3 with clear limitations.

## Batch interaction

Domain Enrichment runs automatic verification first, then presents one bounded
decision packet instead of interrupting between candidates:

1. automatically verified outcomes for the user to scan;
2. recommended confirmations requiring a selection;
3. direct Questions requiring an answer or deferral;
4. an omitted count if the packet exceeds its bound.

Each answer binds the exact Question ID/revision and an explicit `human:*`
identity. Selected answers, automatic evidence changes and Questions that remain
Open all enter one Enrichment proposal.

## Partial success and failure

- The user does not need to clear every Question to finalize a truthful partial draft.
- Deferral, permission denial and insufficient evidence are `unresolved`, not run failures.
- A stale revision, invalid answer, evidence-integrity failure or provider-protocol
  failure keeps the run Incomplete for the affected selected item.
- The user can retry a failed item or reconfirm membership to omit it; the system
  does not drop it automatically.
- An accepted Enrichment proposal is not split across multiple pull requests.

## Provenance and state transitions

- A Tier 1 resolution points to provider/source evidence and does not create
  Maintainer Guidance.
- A Tier 2 or Tier 3 answer creates scoped Maintainer Guidance and updates the
  Question atomically.
- Refresh/Enrichment proposes `Needs Review` only when exact typed references prove
  that new evidence conflicts with accepted Guidance; the validator checks the
  references, and only Accept changes the state. Staleness, loss of access or a
  temporarily unavailable source does not trigger a transition automatically.
- An unselected recommended option does not appear as human evidence.

## Reuse and impact

Reuse the Domain Enrichment manifest/checkpoints from 06.03, provider verification
from 06.04 and shared Question/Guidance proposals from 07.02–03. Do not add a chat
session database, background resolver or autonomous retry loop.
