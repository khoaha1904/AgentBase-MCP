---
title: Cart deletion queue
description: SQS queue used to defer deletion of anonymous cart items after migration.
type: AWS SQS Queue
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
resource_name: CartDeleteSQSQueue
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L76-L87
relationships:
  - kind: produced-by
    target: components/shopping-cart-service
  - kind: consumed-by
    target: components/shopping-cart-service
---

# Purpose

The queue separates asynchronous deletion of anonymous cart items from the synchronous migration response.

# Messages

Migration serializes each anonymous cart item as a message body after starting the corresponding authenticated-cart update.

# Producers

The [shopping cart service](../components/shopping-cart-service.md) migration handler sends messages to the queue.

# Consumers

The same service's deletion Lambda consumes the queue with batches of five messages.

# Failure Behavior

The queue has a 20-second visibility timeout and a redrive policy to `CartDeleteSQSDLQ` after five receives.

# Limitations

The dead-letter queue is declared but is not modeled separately because no distinct producer or consumer behavior is evidenced for it.
