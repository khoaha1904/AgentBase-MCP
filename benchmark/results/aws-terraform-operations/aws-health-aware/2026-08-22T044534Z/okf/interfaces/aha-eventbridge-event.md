---
type: Interface
title: AHA EventBridge event
description: Outbound AHA event envelope published to a configured EventBridge bus for downstream filtering and routing
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T04:47:22.521Z
sources:
  - id: event_contract
    resource: repository://repository-aws-health-aware-ef3e83846625/new_aha_event_schema.md#L3-L56
  - id: event_publisher
    resource: repository://repository-aws-health-aware-ef3e83846625/handler.py#L962-L985
relationships:
  - kind: part-of
    target: systems/aws-health-aware
    evidence:
      - event_contract
  - kind: implemented-in
    target: repositories/aws-health-aware
    evidence:
      - event_contract
---

# Purpose

The AHA EventBridge event is the outbound contract for independent EventBridge rules and consumers. It enriches the AWS Health event format with Health API and AWS Organizations details so downstream rules can filter and route notifications.

It belongs to [AWS Health Aware](../systems/aws-health-aware.md), with its contract and producer implemented in [aws-health-aware](../repositories/aws-health-aware.md).

# Contract

The documented envelope identifies `source` as `aha` and `detail-type` as `AHA Event`. It carries resource identifiers plus a detail object containing the Health event identity, service, category, region, timing, status, scope, description, and affected-entity account context. Account-specific affected entities may include account ID and, in organization mode, account name.

# Producer

The [AHA alert processor](../components/aha-alert-processor.md) constructs an EventBridge entry with the contract identity, resources, serialized detail, and the configured event-bus name, then calls the EventBridge publish operation.

# Consumers

The repository documents content-based EventBridge filtering as the intended integration mechanism. Concrete rules, SaaS integrations, and their ownership are outside this repository.

# Compatibility

The contract documentation warns that rules built against the prior title/value shape must be updated for the revised envelope. No runtime schema registry or explicit released schema version is evidenced.

# Limitations

Publishing is conditional on operator configuration. Delivery guarantees, downstream rules, consumers, and a current deployed event bus are not evidenced.
