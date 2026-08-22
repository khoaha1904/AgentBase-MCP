---
type: System
title: ECS Full-Stack Demo
description: Containerized demonstration system comprising a Vue frontend, Node.js backend, and automated delivery infrastructure.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T03:17:48.168Z
sources:
  - id: s_system_overview
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L23-L37
  - id: r_ecs_cluster
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Cluster/main.tf#L8-L9
  - id: s_runtime_platform
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L30-L127
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/digital-experience
relationships:
  - kind: part-of
    target: domains/digital-experience
    evidence:
      - owner-domain
  - kind: implemented-in
    target: repositories/amazon-ecs-fullstack-app-terraform
    evidence:
      - s_system_overview
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_ecs_cluster
---

# Purpose

The ECS Full-Stack Demo illustrates a managed-container architecture and delivery practice intended to reduce deployment risk and ease remediation ([repository overview](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L23-L37)).

Primary Domain: [Digital Experience](../domains/digital-experience.md).

Implementation source: [amazon-ecs-fullstack-app-terraform](../repositories/amazon-ecs-fullstack-app-terraform.md).

# Architecture

The system comprises a separately deployed [Demo Frontend](../components/demo-frontend.md) and [Demo Backend](../components/demo-backend.md), connected through the [Backend HTTP API](../interfaces/backend-http-api.md). The [Application Delivery Pipeline](../flows/application-delivery-pipeline.md) builds and deploys both workloads.

Terraform defines the internal runtime platform: networking, blue/green target groups, and separate public-facing load balancers for client and server ([Terraform root configuration](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/main.tf#L30-L127)). An ECS cluster is declared by the reusable cluster module ([cluster resource](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Cluster/main.tf#L8-L9)). These are embedded implementation details rather than independent Hub identities.

# Limitations

This is a demonstration architecture. Terraform establishes desired state only; the source does not prove a live deployment, current scaling state, account, region, or generated endpoint values.
