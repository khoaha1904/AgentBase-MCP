---
type: Component
title: Demo Frontend
description: Vue.js user-facing workload built and deployed as its own ECS service.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T03:17:48.168Z
sources:
  - id: s_frontend_readme
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L159-L165
  - id: s_frontend_runtime
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L226-L239
  - id: r_frontend_service
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Service/main.tf#L8-L34
  - id: s_frontend_api_call
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/client/src/services/RestServices.js#L6-L10
relationships:
  - kind: part-of
    target: systems/ecs-fullstack-demo
    evidence:
      - s_frontend_readme
      - s_frontend_runtime
  - kind: consumes
    target: interfaces/backend-http-api
    evidence:
      - s_frontend_api_call
  - kind: implemented-in
    target: repositories/amazon-ecs-fullstack-app-terraform
    evidence:
      - s_frontend_readme
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_ecs_service
---

# Responsibility

The Demo Frontend is the Vue.js user interface within the [ECS Full-Stack Demo](../systems/ecs-fullstack-demo.md) ([application description](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L159-L165)). It calls the product-list operation of the [Backend HTTP API](../interfaces/backend-http-api.md) through a server URL replaced during the build ([client service](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Code/client/src/services/RestServices.js#L6-L10)). Its implementation is maintained in [amazon-ecs-fullstack-app-terraform](../repositories/amazon-ecs-fullstack-app-terraform.md).

# Runtime

Terraform configures a distinct client ECS service with its own task definition, target group, private subnets, container name, and port references ([client service wiring](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L226-L239)). The shared ECS service module declares Fargate launch type, load-balancer attachment, CodeDeploy control, and lifecycle exclusions for deployment-managed fields ([ECS service resource](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Service/main.tf#L8-L34)).

# Embedded Resources

Client-visible image assets are expected to come from the Terraform-created S3 bucket and are referenced by product records ([asset guidance](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L167-L179); [bucket resource](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/S3/main.tf#L8-L15)). The bucket remains embedded because no separate ownership or shared operational boundary is evidenced.

# Limitations

Terraform is desired state and does not prove a running task, current image, resolved server URL, or deployed port value.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| client-asset-bucket | Explain where frontend-visible demo assets originate. | object-storage | aws / s3; terraform:aws_s3_bucket | r_asset_bucket: `repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/S3/main.tf#L8-L15`<br>s_asset_usage: `repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L167-L179` |
