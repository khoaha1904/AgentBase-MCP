---
type: AWS SQS Queue
title: Cart Deletion Queue
description: Desired SQS queue carrying anonymous-cart entries for asynchronous deletion after migration.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
resource_name: CartDeleteSQSQueue
sources:
  - id: queue-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
  - id: migration-publish
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L76-L90
  - id: queue-consumer-binding
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [queue-definition]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [queue-definition]
    link: "[Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md)"
---

# Purpose

Carries old anonymous-cart item records after migration so deletion is not part of the synchronous migration response.

# Messages

The migration handler JSON-serializes each anonymous cart item and sends it to the queue. The source does not provide a formal message schema.

# Producers

[Cart Migration Function](../components/cart-migration-function.md) sends messages after it starts the user-cart update work.

# Consumers

[Cart Deletion Worker](../components/cart-deletion-worker.md) is configured as the queue consumer with a batch size of five.

# Failure Behavior

The desired queue has a 20-second visibility timeout and redrives to `CartDeleteSQSDLQ` after five receives.

# Limitations

No deployed queue URL or ARN, encryption setting, retention configuration, or DLQ consumer is evidenced.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
