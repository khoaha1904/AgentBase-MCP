---
title: Add to cart
type: api_endpoint
status: draft
benchmark_key: add-to-cart
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L202-L222
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/add_to_cart.py#L28-L113
relationships:
  - kind: exposed_by
    target: cart-api
  - kind: reads_from
    target: product-api
  - kind: writes_to
    target: shopping-cart-table
---

`POST /cart` on the [cart API](cart-api.md) validates a product through the [product API](product-api.md), then adds its quantity to the authenticated or anonymous cart in the [shopping cart table](shopping-cart-table.md).
