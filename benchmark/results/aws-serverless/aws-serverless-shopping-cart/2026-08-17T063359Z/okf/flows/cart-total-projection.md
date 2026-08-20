---
title: Cart-total Projection
description: Asynchronous DynamoDB-stream flow that maintains an aggregate product quantity across carts.
type: Business Flow
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: aggregate-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
  - id: cart-stream-trigger
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - id: cart-table-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
flow_steps:
  - order: 1
    source: components/shopping-cart-service
    target: resources/shopping-cart-table
    action: writes
    mode: synchronous
    evidence: [aggregate-design]
  - order: 2
    source: resources/shopping-cart-table
    target: components/shopping-cart-service
    action: publishes
    mode: asynchronous
    evidence: [aggregate-design]
  - order: 3
    source: components/shopping-cart-service
    target: resources/shopping-cart-table
    action: writes
    mode: asynchronous
    evidence: [aggregate-design]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [aggregate-design]
---

# Purpose

The flow maintains a running per-product cart quantity instead of repeatedly scanning all cart records.

# Trigger

An add, delete, or update in the cart table causes a DynamoDB Streams event.

# Outcome

The stream handler computes quantity changes and writes the aggregate back to the cart table.

# Flow

The ordered steps record the table write, asynchronous stream publication, handler delivery, and aggregate write.

# Participants

The flow is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and connects [Shopping Cart Service](../components/shopping-cart-service.md) with [Shopping Cart DynamoDB Table](../resources/shopping-cart-table.md).

# Failure and Recovery

The source configures batching for the stream handler but does not document retry, poison-record, or replay behavior.

# Limitations

The aggregate record schema and the precise behavior for duplicate or reordered stream records are not established by the inspected evidence.
