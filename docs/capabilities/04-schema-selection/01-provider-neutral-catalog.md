# 04.01 — Provider-neutral catalog 7

> Status: Implemented.

## Initial Ingest roles

| Role | Boundary |
|---|---|
| Repository | Canonical source ownership/observation |
| Domain | Owner-confirmed business grouping |
| System | Recognizable capability composed from cooperating concepts |
| Component | Independently useful workload or software boundary |
| Function | Independently triggered/deployed function boundary |
| Interface | Shared API/event/resource contract |
| Flow | Cross-concept sequence with query/navigation value |
| Resource | Independently operated/shared resource boundary |

Entity and Metric are enrichment-only. Provider products do not create new
schemas.

## Service-level runtime relations

`System` is a sufficient service boundary when no independent child workload
needs to become a `Component`. In that case, a System may declare
`consumes → Interface` with exact runtime-call/subscription evidence. Do not
create a duplicate Component just to carry a relation or expand it into a
general `depends-on` System relation.

## Embedded knowledge

Queue, topic, event bus, table, bucket, database, load balancer and host default
to embedded knowledge in a Function/Component/System parent. An embedded item
keeps:

- display name and concise role;
- provider-neutral kind;
- optional provider/product/source-tool/resource-type metadata;
- exact evidence sources.

It has no concept ID, separate file or graph edge yet. Promote to Interface or
Resource only with evidence of a shared contract, ownership, lifecycle,
operational boundary or independent query value.

## Technology metadata

```yaml
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_lambda_function
```

Metadata describes implementation evidence only; Terraform remains desired state
and does not prove the current deployment/account/region/ARN.
