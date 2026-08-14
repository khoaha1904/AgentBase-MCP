---
title: AWS Health Aware poller
type: aws-lambda-function
status: draft
benchmark_key: aws-health-aware-poller
repository_id: repository-aws-health-aware-779eb7e1bc7a
handler: handler.main
runtime: python3.11
timeout_seconds: 600
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L643-L685
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
relationships:
  - kind: stores-state-in
    target: aws-health-aware-event-state
  - kind: dispatches-to
    target: aws-health-aware-notification-dispatch
---

# AWS Health Aware poller

The deployed Lambda selects account or organization AWS Health polling according to `ORG_STATUS`; its event processing writes state before it sends configured notifications. It stores event update state in the [event state table](aws-health-aware-event-state.md) and dispatches delivery through [notification dispatch](aws-health-aware-notification-dispatch.md).

The source does not identify a deployed AWS Health resource or a concrete Lambda name; CloudFormation leaves the function name implicit.
