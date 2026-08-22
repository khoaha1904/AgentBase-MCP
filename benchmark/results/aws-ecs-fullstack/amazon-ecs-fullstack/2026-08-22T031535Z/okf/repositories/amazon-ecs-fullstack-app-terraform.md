---
type: Repository
title: amazon-ecs-fullstack-app-terraform
description: Terraform and application source for a containerized full-stack demonstration and its delivery pipeline.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-22T03:17:48.168Z
sources:
  - id: s_system_overview
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L23-L37
  - id: r_ecs_cluster
    resource: repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/Infrastructure/Modules/ECS/Cluster/main.tf#L8-L9
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/digital-experience
relationships:
  - kind: part-of
    target: domains/digital-experience
    evidence:
      - owner-domain
agentbase:
  repository:
    id: repository-amazon-ecs-fullstack-app-terraform-69902021744a
    display_name: amazon-ecs-fullstack-app-terraform
    aliases:
      remotes:
        - https://github.com/aws-samples/amazon-ecs-fullstack-app-terraform
      root_commits:
        - ccf1fd357975d9210e0ebb8903c3eade11569024
    observed_source:
      commit: 98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4
      dirty: false
      dirty_digest: null
      observed_at: 2026-08-22T03:17:48.168Z
---

# Purpose

This repository contains the Vue frontend, Node.js backend, and Terraform desired state for an Amazon ECS full-stack demonstration ([repository overview](repository://repository-amazon-ecs-fullstack-app-terraform-69902021744a/README.md#L23-L37)).

Primary Domain: [Digital Experience](../domains/digital-experience.md).

# Scope

The canonical knowledge below separates the recognizable demo system from its independently built frontend and backend workloads, its shared HTTP contract, and its application-delivery lifecycle. Provider resources that implement those boundaries remain embedded in the relevant concepts.

# Canonical Knowledge

* [ECS Full-Stack Demo](../systems/ecs-fullstack-demo.md) - System
* [Demo Frontend](../components/demo-frontend.md) - Component
* [Demo Backend](../components/demo-backend.md) - Component
* [Backend HTTP API](../interfaces/backend-http-api.md) - Interface
* [Application Delivery Pipeline](../flows/application-delivery-pipeline.md) - Flow

# Limitations

Terraform is desired state, so this repository record does not claim that the infrastructure is deployed or assert an account, region, ARN, generated URL, or current runtime value.
