---
type: Interface
title: Backend HTTP API
description: HTTP contract providing health, product-list, and Swagger documentation routes.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T03:17:48.168Z
sources:
  - id: s_api_routes
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L12-L68
  - id: s_backend_target_group_health_checks
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L34-L60
  - id: s_frontend_api_call
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/client/src/services/RestServices.js#L6-L10
  - id: s_swagger_output
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/outputs.tf#L9-L12
relationships:
  - kind: part-of
    target: systems/ecs-fullstack-demo
    evidence:
      - s_api_routes
      - s_frontend_api_call
  - kind: implemented-in
    target: repositories/amazon-ecs-fullstack-app-terraform
    evidence:
      - s_api_routes
---

# Purpose

The Backend HTTP API is the stable cross-component contract within the [ECS Full-Stack Demo](../systems/ecs-fullstack-demo.md), provided by the [Demo Backend](../components/demo-backend.md), and consumed by the [Demo Frontend](../components/demo-frontend.md). The frontend calls the product-list route through its configured server base URL ([client call](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/client/src/services/RestServices.js#L6-L10)). Its contract implementation is maintained in [amazon-ecs-fullstack-app-terraform](../repositories/amazon-ecs-fullstack-app-terraform.md).

# Contract

* `GET /health` returns a health message. The server blue and green target groups reference this path as their health-check path ([server routes](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L15-L32); [target-group configuration](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L34-L60)).
* `GET /api/getAllProducts` scans the configured DynamoDB table and responds with products; scan errors are returned with code and description fields ([handler](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L34-L68)).
* `/api/docs` mounts the Swagger router, and Terraform defines an output that appends this path to the server load-balancer DNS reference ([router mount](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L12-L13); [output](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/outputs.tf#L9-L12)).

# Failure Behavior

The product-list handler sends the DynamoDB error status and message when a scan fails ([handler](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L54-L65)). Unmatched routes and general errors are handled later in the server, outside this interface's cited contract span.

# Limitations

The source does not establish authentication, versioning, response schemas beyond the documented handler behavior, or a current deployed endpoint. The Terraform output is a live configuration reference, not a captured URL. The repository README still names `/status` as the health-check endpoint, while the current server and Terraform target-group configuration use `/health` ([README endpoint summary](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L203-L206); [server routes](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/server/src/app.js#L15-L32); [target-group configuration](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L34-L60)).
