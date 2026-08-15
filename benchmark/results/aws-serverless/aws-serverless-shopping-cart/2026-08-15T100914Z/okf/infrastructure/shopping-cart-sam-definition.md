---
title: Shopping cart SAM definition
description: AWS SAM root infrastructure definition for the shopping-cart service and its AWS resources.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L1-L45
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L47-L429
relationships:
  - kind: defines
    target: components/shopping-cart-service
  - kind: defines
    target: resources/shopping-cart-table
  - kind: defines
    target: resources/cart-deletion-queue
---

# Purpose

This root AWS SAM template defines the shopping-cart service's API, Lambda functions, IAM policies, DynamoDB table, queues, layer, and SSM endpoint parameter.

# Scope

It is an application-root infrastructure definition, not a reusable Terraform module. It configures runtime defaults, CORS, Cognito authorizer details, service resources, and a `Prod` API stage.

# Composition

It defines the [shopping cart service](../components/shopping-cart-service.md), [shopping cart table](../resources/shopping-cart-table.md), and [cart deletion queue](../resources/cart-deletion-queue.md).

# Limitations

The template is configuration evidence only. No deployed stack, environment values, or deployment instance is asserted.
