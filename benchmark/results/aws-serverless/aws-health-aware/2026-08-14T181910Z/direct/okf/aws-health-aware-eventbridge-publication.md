---
title: AWS Health Aware EventBridge event publication
type: aws-eventbridge-event-publication
status: draft
benchmark_key: aws-health-aware-eventbridge-publication
repository_id: repository-aws-health-aware-779eb7e1bc7a
event_source: aha
detail_type: AHA Event
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L962-L985
  - repository://repository-aws-health-aware-779eb7e1bc7a/new_aha_event_schema.md#L3-L56
relationships: []
---

# AWS Health Aware EventBridge event publication

When an event bus is configured, AHA publishes an `AHA Event` with source `aha`, affected resources, and enriched AWS Health event detail. The source does not specify a target event-bus name; it is supplied at deployment.
