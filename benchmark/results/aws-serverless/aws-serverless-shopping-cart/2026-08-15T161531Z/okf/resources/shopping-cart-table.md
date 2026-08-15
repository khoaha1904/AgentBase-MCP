---
title: Shopping Cart DynamoDB Table
type: Database Table
description: Desired DynamoDB table for cart items and per-product aggregate records.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: cart-table-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
  - id: aggregation-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L71
---

# Shopping Cart DynamoDB Table

The table definition uses `pk` and `sk` keys, on-demand billing, TTL via `expirationTime`, and a stream containing new and old images. Cart handlers use it for cart items; the stream handler writes `totalquantity` aggregate records keyed by product.

# Limitations

This concept represents a declared resource, not an observed table instance or stream ARN.
