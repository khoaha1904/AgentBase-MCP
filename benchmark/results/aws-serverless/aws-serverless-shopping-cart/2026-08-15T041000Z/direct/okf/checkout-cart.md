---
title: Checkout cart
type: api_endpoint
status: draft
benchmark_key: checkout-cart
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L272-L295
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/checkout_cart.py#L23-L64
relationships:
  - kind: exposed_by
    target: cart-api
  - kind: authenticated_by
    target: cognito-user-pool
  - kind: writes_to
    target: shopping-cart-table
---

`POST /cart/checkout` on the [cart API](cart-api.md) requires the [Cognito user pool](cognito-user-pool.md) authorizer and deletes the user’s cart items from the [shopping cart table](shopping-cart-table.md).

Limitation: no payment integration is implemented.
