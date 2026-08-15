---
okf_version: "0.2"
---
# AWS Health Aware

* [AHA Terraform Deployment Module](infrastructure/terraform/aha-deployment.md) - Terraform configuration for the AHA deployment resources.
* [AHA Lambda Schedule](events/aha-lambda-schedule.md) - One-minute EventBridge schedule that invokes AHA.
* [AHA Lambda Function](infrastructure/aws/lambda/aha-lambda-function.md) - Scheduled AWS Health alert processor.
* [Process AWS Health Alerts](flows/process-aws-health-alerts.md) - Scheduled collection and alerting behavior.
