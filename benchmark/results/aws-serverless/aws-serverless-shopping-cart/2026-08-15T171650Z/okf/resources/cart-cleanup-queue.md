---
title: Cart Cleanup SQS Queue
description: Queue for asynchronous deletion of migrated anonymous-cart items.
type: AWS SQS Queue
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
resource_name: CartDeleteSQSQueue
sources:
  - id: queue-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - id: queue-policy
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
  - id: migration-producer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L65-L90
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [queue-definition]
  - kind: declared-by
    target: infrastructure/cart-sam-template
    evidence: [queue-policy]
---

# Cart Cleanup SQS Queue

## Purpose

Decouples deletion of anonymous-cart items from synchronous cart migration.

## Messages

Migration sends serialized cart items; the worker uses each message's `pk` and `sk` to delete an item.

## Producers

The migration handler calls `send_message` for every anonymous-cart item.

## Consumers

DeleteFromCartFunction has an SQS event-source mapping with batch size 5.

## Failure Behavior

The queue has a 20-second visibility timeout and redrives after five receives to `CartDeleteSQSDLQ`.

## Limitations

No deployed queue URL, queue ARN, or operational metrics are evidenced.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [Cart SAM Template](../infrastructure/cart-sam-template.md)
