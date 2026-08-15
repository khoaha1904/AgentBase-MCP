---
title: Shopping cart table
type: database
status: draft
benchmark_key: shopping-cart-table
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L373-L391
relationships:
  - kind: emits
    target: cart-quantity-aggregator
---

DynamoDB table keyed by `pk` and `sk`, with TTL on `expirationTime` and a `NEW_AND_OLD_IMAGES` stream. The stream invokes the [cart quantity aggregator](cart-quantity-aggregator.md).
