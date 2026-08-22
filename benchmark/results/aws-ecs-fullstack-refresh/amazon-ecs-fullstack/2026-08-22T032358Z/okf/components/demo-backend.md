---
type: Component
title: Demo Backend
description: Node.js API workload built and deployed as its own ECS service.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T03:17:48.168Z
sources:
  - id: s_backend_readme
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L197-L206
  - id: s_backend_runtime
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L211-L224
  - id: r_backend_service
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Service/main.tf#L8-L34
  - id: s_api_routes
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L12-L68
relationships:
  - kind: part-of
    target: systems/ecs-fullstack-demo
    evidence:
      - s_backend_readme
      - s_backend_runtime
  - kind: provides
    target: interfaces/backend-http-api
    evidence:
      - s_api_routes
  - kind: implemented-in
    target: repositories/amazon-ecs-fullstack-app-terraform
    evidence:
      - s_backend_readme
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_ecs_service
---

# Responsibility

The Demo Backend is the Node.js service within the [ECS Full-Stack Demo](../systems/ecs-fullstack-demo.md) that provides health, product-list, and Swagger routes through the [Backend HTTP API](../interfaces/backend-http-api.md) ([server description](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L197-L206)). Its implementation is maintained in [amazon-ecs-fullstack-app-terraform](../repositories/amazon-ecs-fullstack-app-terraform.md).

# Runtime

Terraform configures a distinct server ECS service with its own task definition, target group, private subnets, container name, and port references ([server service wiring](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L211-L224)). The shared service resource uses Fargate, attaches the configured load balancer, delegates deployment control to CodeDeploy, and ignores fields managed by autoscaling or deployment ([ECS service resource](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Service/main.tf#L8-L34)).

# Embedded Resources

The product-list handler scans a configured DynamoDB table and returns its items or an error description ([handler implementation](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L47-L68)). Terraform declares that table with on-demand billing and configurable keys ([table resource](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/Dynamodb/main.tf#L8-L22)). The table remains embedded because the repository does not evidence independent ownership or use beyond this backend.

# Limitations

The source contains a placeholder table name in the handler; it does not prove the deployed substitution, table contents, or a currently running service.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| product-dynamodb-table | Explain the backend persistence dependency. | database-table | aws / dynamodb; terraform:aws_dynamodb_table | r_dynamodb_table: `repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/Dynamodb/main.tf#L8-L22`<br>s_backend_scan: `repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L47-L68` |
