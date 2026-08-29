# 03 — How MCP identifies concepts in a repository

> Status: Catalog 7 and Capability 046 Discovery Seed/Inventory coverage are
> implemented; released-skill qualification remains pending.

## Short answer

The agent uses the Code Graph to find important components, reads source to
verify them, then proposes useful concepts for understanding and querying the system.

```text
Ingest skill
     ↓
Code Graph finds the right area
     ↓
Source provides evidence
     ↓
Agent proposes concept + schema + relation
     ↓
Local Draft for user review
```

The Code Graph is a search map, not a list of concepts to copy into the Hub.
Initial Ingest therefore **discovers broadly but publishes selectively**: MCP
must see important signal groups first, while OKF keeps only useful knowledge.

## How are schema and concept different?

- **Schema** is a shared role definition supplied by MCP, such as System,
  Component, Function or Interface.
- **Concept** is a concrete entity discovered and stored in the Hub, such as a
  Crawler API or Vehicle Data Queue.

A repository may contribute many concepts, and many concepts may use one schema.
There is no fixed concept list that everything must match.

## When is a concept created?

A component is proposed as its own concept when it:

- has an independent identity; and
- has direct query or relationship value.

The Hub favors boundaries with navigation and query value. An internal cloud
resource is normally embedded knowledge in its parent concept, not automatically
its own concept document. When the agent selects an embedded resource with a
valid parent and evidence, MCP's failure to recognize its provider/product only
creates a limitation; it must not make the knowledge disappear.

A discovery group that fails either gate does not disappear silently. The agent
chooses exactly one outcome: `materialized`, `question` or `ignored`, with a
bounded reason. A candidate already identified as a concept or embedded item is
not rediscovered by Inventory. MCP compares these outcomes with the machine-
derived Discovery Seed; it sets no concept quota and does not require every
route/resource to become a document.

MCP determines the lane and P0/P1/P2 level from machine signals. The agent
interprets meaning and chooses representation, so it cannot claim “checked
everything” without evidence. One group has one outcome, but it may produce
multiple outputs when the source genuinely requires them.

| Discovered item | Representation |
|---|---|
| System, workload, API or shared resource with its own boundary | Concept |
| SQS, table, bucket, internal host | Embedded knowledge in its parent concept |
| AWS, EC2, Lambda, runtime | Technology metadata |
| Service calling an API or publishing a message | Relation |
| File, class, helper function | Evidence/reference |
| TTL or timeout likely to change | [Observed snapshot](08-live-references-for-change-prone-values.md) when queried |

## Matching and handling uncertainty

Before creating a new item, the agent compares it with the synchronized Published
Hub and concepts in the current proposal. Ordinary discovery does not search
other Local Drafts.

One direct source may be enough to propose a concept; there is no fixed minimum
source count. A README or ADR may be primary evidence for a business rule or
decision, but future-looking or ambiguous content creates a candidate/Question.

A candidate with a clear identity but uncertain query value appears in review.
The user may promote it, keep it as a Question or drop it. When sources conflict,
the agent does not guess; the full policy is in
[section 07](07-conflicts-questions-and-maintainer-guidance.md).

The agent chooses embedded/Question/ignored through the two gates and must state
the evidence-based reason. P0 can be ignored only for a bounded set of reasons
MCP can check. “Ignored” means only that the candidate was not included in this
run's OKF; it creates no ignore registry and Refresh may discover it again.

## Implementation status

- A candidate needs stable identity, query/link value and exact evidence; it does
  not use a falsely precise confidence score.
- Initial Ingest creates a sparse proposal and allows knowledge to grow incrementally.
- Capability 046 adds compact discovery groups, a five-lane Inventory Receipt and
  coverage validation so a sparse proposal cannot omit important signals without
  explanation.
- Candidates live only in the proposal workflow; the MVP needs no separate
  registry or review UI. Cross-repository promotion belongs to Domain Enrichment.
