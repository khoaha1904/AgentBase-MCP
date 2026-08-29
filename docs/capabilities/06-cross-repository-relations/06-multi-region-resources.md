# 06.06 — Multi-region resources

> Status: Technical design decided; deployment-aware enrichment is not
> implemented.

## Short decision

Region is deployment scope, not a Domain or Concept Schema. A logical capability
keeps one concept with multiple external-identity entries by default; split only
when each deployment has independent ownership, lifecycle, behavior or query
value.

```text
Vehicle Events (Interface concept)
  ├─ AWS deployment: account A / ap-southeast-1 / ARN 1
  └─ AWS deployment: account A / eu-west-1      / ARN 2
```

Two different ARNs prove two deployed resources, not whether they are one or two
logical concepts.

## Keep one concept when

- purpose and external contract are shared;
- owner and lifecycle/release policy are shared;
- they are replicas or regional deployments of one logical capability;
- users normally query at logical level;
- the regional difference can be shown briefly as deployment references.

The concept keeps one provider-neutral overview. Each deployment is a separate
`agentbase.external_identities[]` entry with exact account/region/native identity
and evidence under 06.02.

## Split concepts when

- deployments have independent owners or release/lifecycle;
- consumers, contracts, data classification/residency or failure behavior differ
  materially;
- one deployment has independent query/navigation value;
- a relation is true for only one deployment and a shared edge would mislead;
- provider evidence shows different-role resources rather than replicas.

Split concepts still use the provider-neutral schema and may link with a
canonical relation. Do not create `RegionalQueue`, `AWSQueue` or a Domain per
region.

## Relation scope

Canonical relations currently have no region selector:

- a logical-level relation connects logical concepts;
- small deployment-specific detail stays in overview/evidence;
- if a deployment-specific relation is important for query or an unscoped edge
  would mislead, split endpoint concepts before recording the relation;
- do not extend the relation schema with arbitrary scope expressions in the MVP.

This favors a smaller, correct graph over a detailed but ambiguous graph.

## Verification

- Each regional candidate has an explicit/evidenced region before a provider call.
- MCP does not treat a CLI default region as truth or try multiple regions.
- Provider verification handles each exact deployment identity sequentially.
- Account + region + scoped native ID must match the provider profile.
- A global resource uses an explicit provider `global` scope rule; do not assign a
  fake region to satisfy a schema.

## Refresh and Enrichment

- A new deployment adds an external-identity entry with provenance.
- Not seeing a deployment on a later read does not delete its entry automatically.
- Removal needs provider/source evidence and explicit destructive intent.
- A replaced deployment keeps history through Git and an ordinary correction/
  removal proposal; the old ID is no longer presented as a current alias.
- If new evidence proves independent query value, Enrichment may propose a split;
  reverse merge of Published concepts remains a Question because merge/redirect
  is post-MVP.

## Examples

| Case | Representation |
|---|---|
| One Lambda workload deployed with the same contract in two regions for HA | One Function concept, two external identities. |
| Two regional queues with independent consumers and retention | Two concepts when separate queries are needed. |
| Same queue name in two regions | Two deployment identities; equal names are not a same-resource match. |
| One global IAM role | One external identity with provider-defined global scope. |

## Baseline impact

This is a **Contained change after 06.02**. No Region entity, deployment graph,
new schema or provider-specific concept tree is needed. Independent deployment
concepts appear only when current concept qualification proves query value.
