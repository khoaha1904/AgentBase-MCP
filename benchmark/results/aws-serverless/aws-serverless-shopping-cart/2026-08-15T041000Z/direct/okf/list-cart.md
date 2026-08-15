---
title: List cart
type: api_endpoint
status: draft
benchmark_key: list-cart
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L200
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/list_cart.py#L19-L60
relationships:
  - kind: exposed_by
    target: cart-api
  - kind: reads_from
    target: shopping-cart-table
---

`GET /cart` on the [cart API](cart-api.md) returns positive-quantity cart items for the authenticated user or the cart-cookie identity, reading the [shopping cart table](shopping-cart-table.md).
