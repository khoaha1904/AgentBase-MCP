---
title: Scheduled AWS Health alert worker
type: service
status: draft
benchmark_key: scheduled-health-alert-worker
summary: A scheduled Lambda worker that reads AWS Health events, records alert state, and conditionally delivers formatted alerts to configured endpoints.
source:
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L547-L562
  - repository://repository-aws-health-aware-779eb7e1bc7a/CFN_DEPLOY_AHA.yml#L643-L685
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L94-L183
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L1042-L1060
relationships:
  - kind: depends_on
    target: health-alert-state-store
---

# Scheduled AWS Health alert worker

An EventBridge rule runs the `handler.main` Lambda every minute. The handler selects organization or non-organization AWS Health discovery based on `ORG_STATUS`; the Lambda configuration supplies the DynamoDB table name.

The worker depends on the [AWS Health alert state store](health-alert-state-store.md) for persistence of event state.

Configured delivery targets include EventBridge, Slack, Microsoft Teams, email, and Amazon Chime; the source does not establish which targets are enabled in a particular deployment.
