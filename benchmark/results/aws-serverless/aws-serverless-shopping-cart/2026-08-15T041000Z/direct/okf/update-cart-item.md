---
title: Update cart item
type: api_endpoint
status: draft
benchmark_key: update-cart-item
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L224-L244
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/update_cart.py#L28-L107
relationships:
  - kind: exposed_by
    target: cart-api
  - kind: reads_from
    target: product-api
  - kind: writes_to
    target: shopping-cart-table
---

`PUT /cart/{product_id}` on the [cart API](cart-api.md) validates a product through the [product API](product-api.md) and overwrites its non-negative quantity in the [shopping cart table](shopping-cart-table.md).
