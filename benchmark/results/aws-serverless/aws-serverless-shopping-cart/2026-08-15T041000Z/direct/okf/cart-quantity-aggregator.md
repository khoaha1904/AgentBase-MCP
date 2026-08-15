---
title: Cart quantity aggregator
type: function
status: draft
benchmark_key: cart-quantity-aggregator
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L71
relationships:
  - kind: writes_to
    target: shopping-cart-table
---

DynamoDB-stream function that computes per-product quantity deltas and writes aggregate totals to the [shopping cart table](shopping-cart-table.md).
