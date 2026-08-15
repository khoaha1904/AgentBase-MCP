---
title: Cart deletion dead-letter queue
type: queue
status: draft
benchmark_key: cart-deletion-dead-letter-queue
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
relationships: []
---

SQS dead-letter queue for failed cart-deletion messages.
