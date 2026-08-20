---
title: Shopping Cart Service
description: Serverless cart service that serves cart operations and performs cart migration, cleanup, and total projection.
type: Service
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: cart-template-functions
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L371
  - id: readme-cart-behavior
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L16-L51
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-template-functions]
  - kind: provides
    target: interfaces/cart-api
    evidence: [cart-template-functions]
  - kind: reads-from
    target: resources/shopping-cart-table
    evidence: [cart-template-functions]
  - kind: writes-to
    target: resources/shopping-cart-table
    evidence: [cart-template-functions]
  - kind: publishes-to
    target: resources/cart-deletion-queue
    evidence: [readme-cart-behavior]
  - kind: declared-by
    target: infrastructure/shopping-cart-sam
    evidence: [cart-template-functions]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [cart-template-functions]
---

# Responsibility

The service implements cart retrieval and mutation, migration after sign-in, checkout clearing, asynchronous old-item deletion, and an aggregate cart-total projection.

# Interfaces

It provides [Cart API](../interfaces/cart-api.md).

# Dependencies

It accesses [shopping-cart table](../resources/shopping-cart-table.md), and migration cleanup uses [cart-deletion queue](../resources/cart-deletion-queue.md).

# Operations

The SAM template separates API handlers, an SQS consumer, and a DynamoDB-stream consumer, while this Service remains the parent cart capability.

# Related Concepts

This service is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), declared by [Shopping-cart SAM desired state](../infrastructure/shopping-cart-sam.md), and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

Individual Lambda functions are implementation/runtime children of this service and are not separately modeled because the evidence is captured at the service plus independent asynchronous trigger boundaries. No deployed function identities are evidenced.
