---
title: Cart Delete Queue
description: SQS queue carrying asynchronous requests to delete migrated anonymous-cart records.
type: AWS SQS Queue
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
resource_name: CartDeleteSQSQueue
sources:
  - id: queue-declaration
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
  - id: queue-producer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L76-L90
  - id: queue-consumer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L14-L30
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [queue-declaration]
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [queue-declaration]
---

# Purpose

The queue decouples deletion of anonymous-cart records from synchronous cart migration.

# Messages

Each migration message serializes a cart item's DynamoDB fields. The consumer uses its `pk` and `sk` values to batch-delete the original record.

# Producers

The shopping cart service sends a message for each anonymous item after starting the authenticated-cart update.

# Consumers

`DeleteFromCartFunction` is bound to this queue and deletes records in batches. Its event-source batch size is five.

# Failure Behavior

The queue uses a 20-second visibility timeout and redrives messages to `CartDeleteSQSDLQ` after five receives.

# Limitations

The dead-letter queue is declared but its handling or alerting behavior is not evidenced. Configuration does not prove an existing SQS queue.

## Relationships

The queue is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and is declared by the [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
