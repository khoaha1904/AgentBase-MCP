---
title: Cart Total Maintenance
description: Maintains per-product aggregate quantities from shopping-cart table changes.
type: Business Flow
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L391
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L71
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: implemented-by
    target: components/shopping-cart-service
  - kind: triggered-by
    target: resources/shopping-cart-table
  - kind: writes-to
    target: resources/shopping-cart-table
  - kind: exposed-by
    target: interfaces/cart-api
---
# Purpose

Maintain a running quantity per product so an aggregate view does not require scanning all cart records.

# Trigger and Outcome

Cart-table stream records invoke the stream handler. For each product record, it computes the difference between new and old quantity, aggregates changes within the batch, and adds each result to a `totalquantity` record in the same table.

# Operational Behavior

The SAM event reads new and old images, starts at the latest stream position, batches up to 100 records, and permits a 60-second batching window. `GET /cart/{product_id}/total` exposes the resulting value.

# Interactions

This flow is implemented by the [Shopping Cart Service](../components/shopping-cart-service.md), is triggered by the [Shopping Cart Table](../resources/shopping-cart-table.md), and is exposed through the [Cart API](../interfaces/cart-api.md).

# Limitations

The source does not establish reconciliation, duplicate-record handling, or aggregate consistency guarantees beyond the implemented stream processing.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[components/shopping-cart-service](../components/shopping-cart-service.md)
[resources/shopping-cart-table](../resources/shopping-cart-table.md)
[interfaces/cart-api](../interfaces/cart-api.md)
