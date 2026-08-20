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
  - id: queue.vehicle-events
    identity_hint: vehicle-events
    identity_basis: Terraform resource address
    query_value: Producers and consumers link to this queue
    evidence_ids: [tf.queue]
semantic_observations:
  - id: docs.queue-purpose
    candidate_id: queue.vehicle-events
    role: documentation
    signal: asynchronous vehicle-event delivery boundary
    source: { path: README.md, start_line: 20, end_line: 24 }
resource_observations:
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
provider/product/schema or unknown extra field is rejected.

## Authoring guidance response

```yaml
catalog_version: 6.0.0
recommendations:
  - candidate_id: queue.vehicle-events
    status: exact
    schema: Queue
    matched_evidence: [tf.queue, docs.queue-purpose]
    missing_evidence: []
    technology:
      provider: aws
      product: sqs
      source_tool: terraform
      resource_type: aws_sqs_queue
    detector_profile: { id: terraform, version: 1.0.0 }
    provider_profile: { id: aws, version: 1.0.0 }
    guidance: bounded-complete-schema-object
```

`ambiguous` may return a generic fallback with a precise limitation.
`unsupported` returns no invented role/product and preserves matched evidence.
There is no confidence percentage.

## Proposal preparation and preview

Preparation receives the confirmed Domain, canonical Repository resolution,
evidence digest and selected recommendation provenance. It returns the existing
isolated authoring bundle plus bounded continuity; it does not Accept or publish.

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

New AgentBase draft validation fails exact types `AWS Lambda`, `AWS SQS Queue`
and `Terraform Module` and returns `Function`, `Queue` and `Infrastructure
Module` replacement guidance respectively. Other unknown foreign types retain
the current open-world validation behavior.
