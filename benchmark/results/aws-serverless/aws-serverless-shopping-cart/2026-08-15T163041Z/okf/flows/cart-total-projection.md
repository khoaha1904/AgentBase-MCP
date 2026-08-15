---
type: Business Flow
title: Cart Total Projection
description: Asynchronous flow that converts cart-table changes into per-product aggregate quantities.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Provide an inexpensive running aggregate of product quantities across carts.
trigger: DynamoDB Stream records created by cart table changes.
outcome: Each affected product's totalquantity record is incremented by its net quantity delta.
sources:
  - id: aggregation-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
  - id: projector-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L391
  - id: projector-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
flow_steps:
  - order: 1
    source: resources/shopping-cart-table
    target: components/cart-total-projector
    action: delivers
    mode: asynchronous
    evidence: [projector-definition]
  - order: 2
    source: components/cart-total-projector
    target: resources/shopping-cart-table
    action: writes
    mode: synchronous
    evidence: [projector-handler]
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [aggregation-design]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
---

# Purpose

Maintains a running product quantity aggregate instead of scanning and summing every cart at query time.

# Trigger

Changes to the cart table emit DynamoDB Stream records with old and new images. The configured event source batches up to 100 records or waits up to 60 seconds.

# Outcome

For each changed product entry, the projector computes `new quantity - old quantity` and adds the accumulated delta to that product's `totalquantity` record.

# Flow

The ordered steps are encoded in `flow_steps`: an asynchronous stream delivery followed by the projector's synchronous table update.

Participants: [Shopping Cart Table](../resources/shopping-cart-table.md) and [Cart Total Projector](../components/cart-total-projector.md).

# Failure and Recovery

No explicit handler-level retry, poison-record strategy, or idempotency control is shown. The source does not explain how aggregate correctness is recovered after repeated stream delivery.

# Limitations

The README says the aggregate API is exposed without authentication for demonstration, but this flow does not establish which deployment exposes it or whether that endpoint is publicly reachable in a real environment.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md).
