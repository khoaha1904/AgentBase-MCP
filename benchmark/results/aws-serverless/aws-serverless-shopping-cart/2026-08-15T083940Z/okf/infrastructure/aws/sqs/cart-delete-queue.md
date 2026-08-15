---
title: Cart delete queue
description: Queues cart-item deletions during cart migration.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-delete-sqs-queue
type: AWS SQS Queue
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L420
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L85-L87
resource_name: CartDeleteSQSQueue
relationships:
  - kind: produced-by
    target: migrate-cart-lambda
  - kind: consumed-by
    target: delete-from-cart-lambda
---
# Cart delete queue

[Migrate cart Lambda](../lambda/migrate-cart.md) sends cart items to this queue, and [Delete from cart Lambda](../lambda/delete-from-cart.md) consumes it. Its redrive policy points to `CartDeleteSQSDLQ`; no separate producer or consumer evidence is present for that dead-letter queue.
