---
title: Cart Quantity Aggregation
description: Asynchronous DynamoDB-stream workflow that maintains per-product total quantities across cart records.
type: Business Flow
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
business_purpose: Provide an aggregate product quantity view without scanning the entire cart table.
trigger: DynamoDB INSERT, MODIFY, or REMOVE stream records from the shopping cart table.
outcome: Per-product totalquantity records are incremented by the net quantity change.
sources:
  - id: aggregation-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
  - id: stream-binding
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L391
  - id: stream-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
flow_steps:
  - order: 1
    source: components/shopping-cart-service
    action: writes
    target: resources/shopping-cart-table
    mode: synchronous
    evidence: [stream-handler]
  - order: 2
    source: resources/shopping-cart-table
    action: delivers
    target: components/shopping-cart-service
    mode: asynchronous
    evidence: [stream-binding]
  - order: 3
    source: components/shopping-cart-service
    action: writes
    target: resources/shopping-cart-table
    mode: asynchronous
    evidence: [stream-handler]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [aggregation-design]
---

# Purpose

Maintain an aggregate quantity for each product so administrators can query totals without scanning all cart records.

# Trigger

The shopping-cart DynamoDB table emits stream records with both old and new images. `CartDBStreamHandler` receives batches of up to 100 after at most 60 seconds.

# Outcome

The handler calculates each product's net quantity change across its batch and adds that change to the corresponding `totalquantity` record.

# Flow

Cart record changes result in a DynamoDB stream delivery to the same service's stream handler, which writes aggregate records.

# Failure and Recovery

The template declares the stream event source and AWS Lambda DynamoDB execution role, but no retry, DLQ, or replay policy is explicitly configured in the source.

# Limitations

The documented API is unauthenticated and the frontend does not use the total endpoint. The flow retains aggregate state in the same table as carts.

## Participants

The [Shopping Cart Service](../components/shopping-cart-service.md) writes cart entries to the [Shopping Cart Table](../resources/shopping-cart-table.md). The table delivers stream records to the [Shopping Cart Service](../components/shopping-cart-service.md), which writes aggregates to the [Shopping Cart Table](../resources/shopping-cart-table.md). This flow is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md).
