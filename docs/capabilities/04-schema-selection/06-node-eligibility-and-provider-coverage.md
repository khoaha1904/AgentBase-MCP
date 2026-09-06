# 04.06 — Node eligibility and provider coverage

> Status: Implemented and verified with capability-052 conformance fixtures.
> Group 5's independent-reading/dossier refinement is implemented and verified.

## Node and concept

A concept is a knowledge instance stored as Markdown. A node is a concept
instance included in the Published graph projection. Governance documents and
embedded rows are not nodes; a Flow may be a scenario node but is not mixed into
architecture topology by default.

## Promotion gate

A candidate may be authored as a standalone node only with all of:

1. **Stable identity** — exact provider identity, scoped provider ID or
   deterministic source identity (for example, a Terraform address with a
   source anchor).
2. **Independent query/link value** — a user or another concept has an
   independent reason to find/link this endpoint.
3. **Boundary evidence** — lifecycle, ownership, permission, failure, scaling,
   security, cross-boundary usage or contract evidence appropriate to the role.
4. **Interaction evidence for an edge** — source proves producer, consumer,
   trigger or access; identity alone does not create a relation.
5. **Independent reading value** — the document adds a stable contract,
   relationship endpoint, Flow, stewardship unit or separately useful boundary
   rather than fragmenting a Repository dossier/useful parent.

Without identity or query value, do not create a node. With value but insufficient
boundary or reading value, keep embedded knowledge in the parent. With evidence but ambiguous
identity or interaction, keep a candidate/Question. Do not create a placeholder
node to make the graph look fuller. A detected type or long section is not
independent reading evidence, and a short document is not invalid when its
boundary is genuinely independent.

## Resource and Interface

- A queue/topic/bus is **Resource** when it represents an operated
  infrastructure or integration boundary with independent identity and usage.
- An API/event/message schema is **Interface** when the contract has separate
  consumer/producer value.
- A queue/topic transport does not represent its message/event schema contract;
  split the concepts only when both pass the gate.
- A Lambda with its own deployment/trigger/failure boundary is **Function**.
- An IAM role, internal module, handler, log group and resource packaging remain
  embedded evidence unless an independent boundary is proven.

Canonical topology example:

```text
producer Function ──publishes-to──> queue Resource
consumer Function <──triggered-by── queue Resource
```

## Coverage rollout

The policy applies to every provider, but initial conformance rolls out common
AWS groups:

| Group | AWS services | Default role |
|---|---|---|
| Workload | Lambda | Function |
| Messaging | SQS, SNS, EventBridge | Resource when shared/boundary evidence is strong enough |
| Data | S3, DynamoDB, RDS | Resource with independent lifecycle/usage |
| Hosting | EC2/VM | hosting evidence; no automatic Server node |

Each service uses the same gate, relation vocabulary, external-identity envelope
and conformance scenarios. A profile owns technology mapping, identity parsing
and source/provider evidence only; it may not create a schema or predicate.

A new provider (for example GCP Pub/Sub, Cloud Storage or Cloud SQL) needs only a
profile, parser and fixtures. Concept paths, `Resource`/`Interface` roles,
canonical edges, MiniSearch fields and projection schema stay unchanged. Mapping
changes on Published knowledge go through migration/Question review like other
profile changes.

## Review and test impact

Covering common groups greatly reduces review scope compared with all AWS because
tests are reused across three behavior families: workload, messaging and data.
Each service adds only identity/interaction fixtures and mapping cases. This is
not a simple multiplication by service count: every provider/resource still
checks IaC identity, deployed identity, missing scope, ambiguous name, embedded
fallback and relation evidence.
