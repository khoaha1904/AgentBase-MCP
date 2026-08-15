---
okf_version: "0.2"
---
# AWS Health Aware

* [AWS Health Aware repository](repositories/repository-aws-health-aware-779eb7e1bc7a/repository.md) - Source repository overview.
* [AHA deployment Terraform module](repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/terraform/deploy-aha.md) - Terraform deployment root.
* [AHA Lambda function](repositories/repository-aws-health-aware-779eb7e1bc7a/infrastructure/aws/lambda/aha-lambda-function.md) - Scheduled AWS Health alert processor.
* [AHA Lambda schedule](events/aha-lambda-schedule.md) - EventBridge schedule that invokes the Lambda.
* [AHA DynamoDB table](repositories/repository-aws-health-aware-779eb7e1bc7a/data/tables/aha-dynamodb-table.md) - State for processed Health events.
