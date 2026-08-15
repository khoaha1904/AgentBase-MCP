---
title: Cart deletion worker
type: function
status: draft
benchmark_key: cart-deletion-worker
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L16-L30
relationships:
  - kind: deletes_from
    target: shopping-cart-table
---

SQS-triggered function that deletes queued cart-item keys from the [shopping cart table](shopping-cart-table.md).
