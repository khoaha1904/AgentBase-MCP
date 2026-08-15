---
title: Cart deletion queue
type: queue
status: draft
benchmark_key: cart-deletion-queue
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
relationships:
  - kind: dead_letters_to
    target: cart-deletion-dead-letter-queue
  - kind: triggers
    target: cart-deletion-worker
---

SQS queue for cart-deletion messages, configured with a dead-letter queue after five receives. It triggers the [cart deletion worker](cart-deletion-worker.md).
