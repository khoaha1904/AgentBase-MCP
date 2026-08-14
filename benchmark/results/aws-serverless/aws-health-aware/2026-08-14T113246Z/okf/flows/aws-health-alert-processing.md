---
title: Scheduled AWS Health alert processing
description: A scheduled workflow that queries AWS Health, persists event state, and delivers alerts for new or changed events.
type: Business Flow
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-14T00:00:00Z
benchmark_key: aws-health-alert-processing
business_purpose: Notify configured endpoints about new or changed AWS Health events while tracking event state.
trigger: EventBridge rate(1 minute) schedule
outcome: Event state is recorded and new or changed events are sent to configured endpoints.
sources:
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L63-L68
  - resource: repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L697
relationships:
  - kind: step
    target: aha-minute-schedule
  - kind: step
    target: aha-scheduled-health-lambda
  - kind: step
    target: aha-health-event-state-table
---

# Trigger

[AHA minute schedule](../repositories/repository-aws-health-aware-779eb7e1bc7a/events/aha-minute-schedule.md) invokes the Lambda every minute.

# Outcome

The deployment documentation describes a Lambda that reads AWS Health, writes DynamoDB, and sends to endpoints. The handler writes a record when an event is new or materially changed, then sends configured alerts.

# Flow

1. [AHA minute schedule](../repositories/repository-aws-health-aware-779eb7e1bc7a/events/aha-minute-schedule.md) invokes [AHA scheduled health Lambda](../repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/aws/lambda/aha-scheduled-health-lambda.md).
2. The Lambda reads and writes [AHA health event state table](../repositories/repository-aws-health-aware-779eb7e1bc7a/data/tables/aha-health-event-state-table.md) to determine whether an event is new or changed.
3. The handler sends alerts only for those state changes.

# Failure and Recovery

The handler catches DynamoDB `ClientError` during lookup and logs the error. Retry, dead-letter, and external-endpoint delivery guarantees are not evidenced in the cited sources.

## Sources

- `repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L63-L68`
- `repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L589-L697`
