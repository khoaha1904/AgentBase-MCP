# Implementation plan: evidence-backed resource nodes

**Branch**: `052-resource-node-promotion`
**Spec**: [spec.md](spec.md)

## Sequence

1. Reconcile high-level/low-level node policy and lock the conformance matrix.
2. Add provider-neutral promotion decisions and preserve embedded fallback.
3. Add AWS messaging qualification: SQS, SNS and EventBridge.
4. Add common data-resource qualification: S3, DynamoDB and RDS.
5. Add two-repository Lambda–SQS–Lambda and SNS fan-out fixtures.
6. Reuse the existing Published projection, query and static UI; expose only
   accepted Resource nodes and keep embedded rows in parent search results.
7. Record the reset Hub baseline and defer model-backed Crawler qualification
   until a new resource-bearing Crawler dataset exists.

Every step starts only after its requirement text is current. If implementation
reveals a schema, relation, provider or recovery gap, stop and update this spec,
`docs/present/`, and the responsible low-level design before resuming.

## Coverage and review impact

The contract is provider-neutral, but the first conformance set is seven common
AWS services grouped into three behavior families:

- workload: Lambda;
- messaging: SQS, SNS, EventBridge;
- data: S3, DynamoDB, RDS.

EC2/VM stays a hosting signal. Grouping lets identity, embedded fallback,
ambiguity, relation evidence and projection tests be shared. Review/test scope is
therefore materially smaller than all-AWS coverage, while each service still adds
small mapping and source-identity fixtures. This is a bounded confidence slice,
not a claim of complete AWS parity.

## Runtime impact

- Promotion adds bounded candidate classification and may increase authoring
  output only for resources that pass the gates.
- Accepted node count and edge count can grow; existing projection bounds,
  domain scoping and UI filters remain the safety ceiling.
- Embedded resources remain searchable in the parent, so resources that do not
  promote do not disappear from query results.
- No new daemon, database, durable index, provider scan or runtime dependency.

## Provider extensibility

Reuse `Resource`/`Interface`, canonical relationship vocabulary,
`agentbase.external_identities`, technology metadata and projection schema. A new
provider adds only profile mapping, native identity normalization, evidence
adapter and fixtures. Published mapping changes continue through migration or
Question review; no silent reclassification occurs.

## Reset boundary

Before fresh qualification, remove only the generated
`AgentBase/domain-hub/crawler` snapshot. Keep `AgentBase-Hub` history, benchmark
artifacts and source repositories. The reset is recoverable until the temporary
backup is explicitly discarded.
