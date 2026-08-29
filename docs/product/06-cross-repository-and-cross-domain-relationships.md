# 06 — Cross-repository and cross-domain relationships

> Status: High-level direction is settled; exact AWS/SQS Domain Enrichment and
> the mock qualification harness are implemented offline.

## Short answer

A relation may connect concepts in one repository, different repositories or
different Domains. The Hub combines endpoints into one concept only when
identity is strong enough; otherwise the agent keeps them separate and creates a Question.

```text
Crawler Worker ──publishes-to──→ Vehicle Data Queue ←──consumes── Recommender
```

A specific queue/topic becomes a `Resource` node only when it has stable
identity, independent query/link value and evidence of a boundary or actual use.
A Terraform declaration or variable name alone remains embedded knowledge or a
candidate; it does not create a node or edge merely to make the graph look fuller.
Transport Resource and message-contract `Interface` are separate layers.

## How does the agent record relations?

- A repository may declare the side of a relation it can prove; it need not wait
  for the other repository to be Ingested.
- The agent does not infer an unseen consumer, producer or relation endpoint.
- If two sources differ, the Hub keeps both claims with provenance and creates a
  Question; it does not choose one side as truth.
- Ingest prioritizes relations in the repository being read. A cross-repository
  relation is recorded immediately only when the current source directly proves
  the other endpoint; Ingest does not stop to investigate the entire Domain.
- After multiple repositories in a Domain are Published, Domain Enrichment may
  compare them in a batch, verify the provider and add missing relations.

Refresh and reconciliation belong to the lifecycle in
[section 09](09-ingest-and-refresh.md); conflicts belong to
[section 07](07-conflicts-questions-and-maintainer-guidance.md).

## When are two endpoints the same resource?

Strong identity such as an ARN or provider resource ID lets the agent propose
reconciliation. A matching display name, variable name or resource name is not enough.

Without strong identity, a configuration reference, contract, infrastructure
input/output or endpoint creates only a match candidate. During Domain
Enrichment, the user may provide a logged-in CLI session so Provider
Verification can check read-only; MCP does not log in, store credentials or
scan an entire account/region.

If a Published concept is canonical and a new candidate adds evidence, Domain
Enrichment may enrich that concept through a proposal. Duplicates in one proposal
may be grouped before Accept.

If both concepts are already Published, the MVP keeps both and creates a
Question/merge candidate. It does not automatically merge, delete or create a
redirect; that migration is post-MVP.

One Domain Enrichment run may process multiple repositories, Questions and
relation candidates in the same Domain. Results are grouped into one publication
change for review; successful verification never directly edits Published knowledge.

## Domain Enrichment mock qualification

When topology needs validation but no AWS account or sufficiently broad Published
Domain is available, the qualification harness may use a temporary Published
fixture. The agent investigates existing source/evidence, records cross-repository
links as candidate hypotheses with confidence, then attaches deterministic queue
name/account/region and ARN values in the fixture. A mock CLI returns the exact
shape of the released read-only SQS profile so the same reconciliation/proposal
path runs.

The mock proves workflow and outcomes (`confirmed`, `rejected`, `unresolved`,
`failed`); it does not prove that a resource exists in AWS. Mock observations are
limited to test/qualification state and must not become provider truth or be
published to the real Hub. A general candidate generator, account scan and
automatic relation inference are outside this capability.

The same logical resource in multiple regions is one concept with multiple
deployment references by default. Split it only when each deployment has an
independent role, lifecycle or query value.

## Identity and MVP limits

Concept IDs are stable and separate from display names. External identity uses a
provider-neutral envelope; AWS/SQS is the first verification profile. Account and
region are explicitly confirmed when identity needs that scope; the system does
not try multiple regions.

Merging or redirecting two Published concepts is post-MVP. A Question retains
evidence so a later migration can be designed and reviewed without losing track
of the duplicate.
