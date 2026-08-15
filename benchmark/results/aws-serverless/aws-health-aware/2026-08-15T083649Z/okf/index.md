---
okf_version: "0.2"
---
# AWS Health Aware

* [AHA deployment Terraform module](repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/terraform/aha-deployment.md) - Terraform root that declares the documented resources.
* [AHA scheduled alert processor](repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/aws/lambda/aha-scheduled-alert-processor.md) - Scheduled Lambda that processes AWS Health alerts.
* [AHA event state table](repositories/repository-aws-health-aware-779eb7e1bc7a/data/tables/aha-event-state.md) - DynamoDB persistence for processed event state.
