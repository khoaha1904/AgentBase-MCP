# 04 — How MCP selects a concept schema

> Status: Catalog 7 and AWS Terraform/Terragrunt guidance are implemented.

## Short answer

A schema describes a useful knowledge boundary. Provider/product is metadata;
an internal resource is normally embedded in its parent concept.

Catalog 7 has eight Initial Ingest roles:

`Repository`, `Domain`, `System`, `Component`, `Function`, `Interface`, `Flow`
and `Resource`.

`Function` fits a Lambda with its own runtime boundary. SQS, SNS, tables,
buckets, load balancers or internal hosts usually belong in the `Embedded
Knowledge` of a Function/Component/System. Promote one to `Interface` or
`Resource` only when it has a shared contract, ownership, lifecycle or
independent operational value.

An eligible resource becomes a `Resource` node, not an AWS-specific schema. This
node policy is provider-neutral: AWS SQS, GCP Pub/Sub and Azure Service Bus all
use the `Resource` role; provider/product/resource type remains technology metadata.

## How does the agent map technology?

- **Cloud Provider Profile** understands AWS, Azure or GCP resources.
- **Detector Profile** understands how source declares a resource, for example Terraform.
- **Repository evidence** proves the project actually uses that resource.
- **Official documentation** helps the agent understand fields and behavior; it
  does not prove that the repository uses the technology.

```text
aws_lambda_function → Function concept + AWS/Lambda metadata
aws_sqs_queue       → Resource node if shared/independently operated
aws_sns_topic       → Resource node if fan-out or cross-boundary usage exists
aws_dynamodb_table  → Resource node if it has an independent data boundary
```

A declaration or technology detection alone still creates only embedded
knowledge. Resource promotion needs stable identity, independent query/link
value and evidence of ownership/lifecycle/usage. The detailed gate and outcome
are in [node eligibility](../capabilities/04-schema-selection/06-node-eligibility-and-provider-coverage.md).

The user calls one common Ingest skill; the agent selects the matching profile.
When a real resource check is needed, the user logs in to the CLI and permits
read-only Provider Verification. MCP does not log in or store credentials.

## One concept, one schema

A workload using one queue does not automatically need two concepts. The queue
gets its own document only when it passes the promotion gate; otherwise the
parent keeps the queue's role, technology and exact sources in its embedded
knowledge table.

A service-level `System` may `consumes` an `Interface` when source proves a
runtime call or subscription. AgentBase does not create a duplicate `Component`
just to represent a dependency. This relation still needs exact evidence and a
link; it cannot be inferred merely because two concepts are in one Domain.

If evidence is insufficient for a specific schema, the agent uses a more
general schema with a limitation. If it is still uncertain, it keeps a Question
instead of guessing.

## Current scope

- Each concept has exactly one provider-neutral schema.
- AWS Profile v2 and Terraform-family Detector v1 are implemented; Terraform
  and Terragrunt are recognized, while SAM/CloudFormation/YAML are not supported
  in the MVP.
- Catalog, Cloud Provider Profile and Detector Profile have independent versions.
  Changing AWS/Terraform mapping does not automatically change the catalog schema
  or require a full Hub Refresh.
- A profile upgrade that only adds mapping or documentation needs no migration.
  If it changes mapping that produced Published knowledge, MCP creates a Hub
  Migration Draft for all affected concepts; a maintainer reviews and merges one
  migration PR.
- Missing evidence during migration does not silently reclassify a concept. The
  current knowledge remains and a Question is created for Refresh or Enrichment.
- Catalog `7.0.0` cleanly cut over from the more complex catalog 6 design. Old
  types remain readable through open-world compatibility, but AgentBase does not
  author new ones.
- AgentBase does not author retired types; unknown foreign OKF types remain
  readable and preserved through open-world compatibility.
- The AWS profile currently maps Lambda, SQS, SNS, EventBridge, S3, RDS,
  DynamoDB and EC2/VM hosting evidence. Node promotion rolls out across messaging
  first, then data resources; not every resource declaration is promoted.
- Azure/GCP profiles, semantic profile migration and provider verification remain
  post-MVP expansion. A new provider keeps the catalog/identity/relation contract
  and adds only a profile, parser, evidence adapter and conformance fixtures; it
  does not create provider-specific schemas or predicates.
