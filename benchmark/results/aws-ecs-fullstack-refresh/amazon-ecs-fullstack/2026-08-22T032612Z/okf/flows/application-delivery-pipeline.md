---
type: Flow
title: Application Delivery Pipeline
description: Terraform-defined source, build, and blue/green deployment lifecycle for both application workloads.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T03:17:48.168Z
sources:
  - id: r_codepipeline
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/CodePipeline/main.tf#L8-L114
  - id: s_pipeline_wiring
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L361-L379
flow_steps:
  - order: 1
    source: repositories/amazon-ecs-fullstack-app-terraform
    action: delivers
    target: flows/application-delivery-pipeline
    mode: asynchronous
    evidence:
      - r_codepipeline
  - order: 2
    source: flows/application-delivery-pipeline
    action: delivers
    target: systems/ecs-fullstack-demo
    mode: asynchronous
    evidence:
      - r_codepipeline
      - s_pipeline_wiring
relationships:
  - kind: part-of
    target: systems/ecs-fullstack-demo
    evidence:
      - s_pipeline_wiring
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_codepipeline
---

# Purpose

The [Application Delivery Pipeline](application-delivery-pipeline.md) is the independently useful delivery lifecycle for the [ECS Full-Stack Demo](../systems/ecs-fullstack-demo.md). Terraform wires the [amazon-ecs-fullstack-app-terraform repository](../repositories/amazon-ecs-fullstack-app-terraform.md), separate client and server builds, and separate client and server ECS deployments into one pipeline ([root wiring](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L361-L379)).

# Trigger and Outcome

The Source action polls the configured GitHub branch and emits a source artifact ([pipeline source stage](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/CodePipeline/main.tf#L17-L36)). The outcome is delivery of both workload artifacts through their configured CodeDeploy-to-ECS applications and deployment groups ([pipeline deploy stage](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/CodePipeline/main.tf#L69-L107)).

# Flow

1. The repository source is delivered asynchronously into the pipeline by polling the configured branch.
2. The pipeline builds the client and server in separate actions and delivers both through the system's blue/green deployment configuration. The two build actions share one Build stage, so no ordering between them is asserted ([build stage](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/CodePipeline/main.tf#L38-L67)).

# Embedded Resources

The pipeline uses an S3 artifact store ([artifact store](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/CodePipeline/main.tf#L12-L15)), separate CodeBuild and CodeDeploy configurations, and an SNS topic passed into both deployment projects for notifications ([delivery modules](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L294-L379); [topic resource](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/SNS/main.tf#L8-L10)). These remain embedded implementation details.

# Failure and Recovery

The ECS service module intentionally ignores task definition, desired count, and load-balancer changes because CodeDeploy or autoscaling manages them ([service lifecycle](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Service/main.tf#L27-L34)). The source does not document automated rollback behavior or notification subscribers.

# Limitations

Terraform establishes desired pipeline configuration, not a successful or currently running execution. Repository owner, branch, token, generated artifact bucket, deployment groups, and notification subscriptions remain unresolved live configuration.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| pipeline-artifacts-build-deploy-notifications | Explain pipeline implementation and operational notification dependencies. | message-topic | aws / sns; terraform:aws_sns_topic | r_sns_topic: `repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/SNS/main.tf#L8-L10`<br>s_delivery_modules: `repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L294-L379` |
