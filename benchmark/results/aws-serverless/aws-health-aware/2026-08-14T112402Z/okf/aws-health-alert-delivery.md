---
title: AWS Health alert delivery
type: capability
status: draft
benchmark_key: aws-health-alert-delivery
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L94-L184
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L962-L985
  - repository://repository-aws-health-aware-779eb7e1bc7a/README.md#L45-L49
---

# AWS Health alert delivery

The alerting behavior formats and conditionally delivers AWS Health alerts to configured Slack, Teams, Chime, email, and EventBridge destinations. EventBridge output uses source `aha`, detail type `AHA Event`, the affected resources, and the configured event bus.
