---
title: Migrate anonymous cart
type: api_endpoint
status: draft
benchmark_key: migrate-anonymous-cart
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L111
relationships:
  - kind: exposed_by
    target: cart-api
  - kind: authenticated_by
    target: cognito-user-pool
  - kind: writes_to
    target: shopping-cart-table
  - kind: sends_to
    target: cart-deletion-queue
---

`POST /cart/migrate` on the [cart API](cart-api.md) requires the [Cognito user pool](cognito-user-pool.md) authorizer, merges anonymous items into the user cart in the [shopping cart table](shopping-cart-table.md), and sends old-item deletion messages to the [cart deletion queue](cart-deletion-queue.md).
