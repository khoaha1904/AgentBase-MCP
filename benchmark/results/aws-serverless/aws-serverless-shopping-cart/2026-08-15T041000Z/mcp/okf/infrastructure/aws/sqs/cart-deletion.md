---
title: Cart Deletion Queue
description: SQS queue that carries old anonymous-cart items for asynchronous deletion.
type: AWS SQS Queue
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-deletion-queue
resource_name: CartDeleteSQSQueue
relationships:
  - kind: produced-by
    target: cart-migration-lambda
  - kind: consumed-by
    target: cart-deletion-lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L165-L179
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L76-L90
---
# Queue

`CartDeleteSQSQueue` has a 20-second visibility timeout and redrives messages to `CartDeleteSQSDLQ` after five receives.

# Messages

The migration handler sends serialized anonymous-cart items.

# Producers

[Cart Migration Lambda](../lambda/cart-migration.md) sends messages to this queue.

# Consumers

[Cart Deletion Lambda](../lambda/cart-deletion.md) is configured with this queue as its SQS event source.

# Limitations

The dead-letter queue resource is declared but no consumer is evidenced in this repository.
