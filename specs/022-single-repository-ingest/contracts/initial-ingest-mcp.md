# MCP Contract: Single-Repository Initial Ingest

This contract describes the public behavior required by the host Ingest skill.
Names may reuse the existing MCP surface, but the request/response facts below
must remain available in one bounded connection.

## Repository and Hub context

The workflow binds one existing absolute repository root. Repository inspection
returns checkout identity hints and source state; Hub context resolution returns
an existing/new/ambiguous canonical Repository match and bounded active Domain
summaries. It performs no Hub mutation.

An ambiguous fork/mirror result is an error requiring owner choice. A new result
may assign the first canonical Repository ID, which later authoring stores with
its aliases.

## Authoring guidance request

```yaml
candidates:
  - id: function.vehicle-crawler
    identity_hint: vehicle-crawler
    identity_basis: Independently deployed handler with a queue trigger
    query_value: Runtime responsibility, trigger and failure boundary
    evidence_ids: [tf.function, docs.function]
    disposition: concept
    suggested_type: Function
  - id: queue.vehicle-events
    identity_hint: vehicle-events
    identity_basis: Internal trigger transport for the crawler
    query_value: Queue role within the crawler runtime
    evidence_ids: [tf.queue]
    disposition: embedded
    parent_candidate_id: function.vehicle-crawler
semantic_observations:
  - id: docs.function
    candidate_id: function.vehicle-crawler
    role: documentation
    signal: independently deployed crawler consumes vehicle events
    source: { path: README.md, start_line: 10, end_line: 14 }
  - id: docs.queue-purpose
    candidate_id: queue.vehicle-events
    role: documentation
    signal: asynchronous vehicle-event delivery boundary
    source: { path: README.md, start_line: 20, end_line: 24 }
resource_observations:
  - id: tf.function
    candidate_id: function.vehicle-crawler
    source_tool: terraform
    resource_type: aws_lambda_function
    address: module.crawler.aws_lambda_function.vehicle_crawler
    source: { path: infra/function.tf, start_line: 4, end_line: 24 }
  - id: tf.queue
    candidate_id: queue.vehicle-events
    source_tool: terraform
    resource_type: aws_sqs_queue
    address: module.events.aws_sqs_queue.vehicle_events
    source: { path: infra/queue.tf, start_line: 4, end_line: 18 }
```

Bounds remain aligned with the existing changed-set contract: at most 64
candidates/observations, exact relative paths, positive line spans and bounded
strings. A source-less observation, missing candidate gate, caller-supplied
provider, product, exact schema assertion or unknown extra field is rejected.
The optional `suggested_type` must name a released provider-neutral catalog role
and remains evidence-bound and advisory. `disposition: embedded` requires a
parent in the same request and cannot request a standalone schema.
Standalone `Interface` or `Resource` intent additionally supplies
`promotion: { basis, evidence_ids }`. Basis is one of `shared-contract`,
`cross-boundary`, `ownership`, `lifecycle`, `failure`, `security` or
`operational`; its evidence IDs must name semantic observations owned by that
candidate. The basis must fit the requested role and the semantic observations
must select that role. A resource declaration or suggested type alone returns
no standalone schema. Other suggested concept roles may carry the same
candidate-owned semantic or structured evidence as transparent intent; it does
not override selection. Interface/Resource must include semantic evidence.
`candidate_id` preserves an observation's primary attribution; it does not make
the observation exclusive. Any standalone concept may cite any known
observation in this bounded request as supporting or promotion evidence.
Embedded candidates may cite only their own observations. Interface/Resource
promotion still requires candidate-owned semantic evidence for the independent
boundary.

`source_tool` is `terraform` or `terragrunt` and must match the exact evidence
path. Terraform cites `.tf`/`.tf.json`; Terragrunt cites `terragrunt.hcl` for
module orchestration. A provider resource reached through Terragrunt cites its
referenced Terraform module with `source_tool: terraform`. SAM/CloudFormation
YAML is unsupported and cannot be relabeled as either tool.

## Authoring guidance response

```yaml
catalog_version: 7.0.0
recommendations:
  - candidate_id: queue.vehicle-events
    status: embedded
    parent_candidate_id: function.vehicle-crawler
    schema: null
    matched_evidence: [tf.queue]
    missing_evidence: []
    technology:
      provider: aws
      product: sqs
      source_tool: terraform
      resource_type: aws_sqs_queue
    detector_profile: { id: terraform-family, version: 1.0.0 }
    provider_profile: { id: aws, version: 1.0.0 }
    guidance: bounded-complete-schema-object
```

`ambiguous` returns a precise limitation without inventing a type.
`unsupported` returns no invented role/product and preserves matched evidence.
`suggested` returns complete schema guidance but explicitly requires proposal
review. Provider detection never forces standalone promotion. Function
resources with exact runtime evidence are the only structured specialization
promoted directly in Initial Ingest. There is no confidence percentage.

## Proposal preparation and preview

Preparation receives the confirmed Domain, canonical Repository resolution,
evidence digest and selected recommendation provenance. It returns the existing
isolated authoring bundle plus bounded continuity. For a new Initial Ingest,
the bundle already contains editable OKF skeletons for promoted exact and suggested recommendations,
the Repository, optional confirmed Domain and required navigation. Each
skeleton has a canonical path, selected type, valid draft/generation fields and
normalized sources. The agent enriches these files instead of rebuilding OKF
frontmatter. Suggested skeletons contain a visible role-review limitation;
System skeletons carry the owner-evidenced confirmed-Domain relation;
new Domain skeletons list the newly prepared Systems that belong to them;
preparation does not Accept or publish.
Embedded recommendations are rendered as a bounded searchable table in their
parent skeleton with role, kind, technology and exact source references. They
do not receive a path, identity or relationship.

Finalization validates exact current bytes and produces either:

- valid immutable proposal + bounded inspection;
- exact validation failures eligible for one host-agent repair;
- Incomplete integrity/runtime failure.

The skill may call changed-set validation during authoring and finalization
after one repair. It must not call Hub Accept, submit, synchronize, provider CLI
or any remote mutation operation.

## Snapshot extension

A live/evidenced claim may include one optional bounded snapshot containing one
scalar or single-line identifier of at most 256 UTF-8 bytes plus observed time.
Validation requires the normal source ID and revision binding, rejects
large/multiline/obviously secret-like values and does not expose a snapshot as a
query-time winner or current value. Proposal review remains the final
sensitivity guard.

## Retired types

New AgentBase draft validation fails catalog-6 and vendor-specific authoring
types with catalog-7 replacement/re-ingest guidance. Potentially embedded types
such as Queue, Server and Database Table are not automatically renamed to
Resource. Other unknown foreign types retain open-world validation behavior.
