---
title: Cart Deletion Queue
description: SQS queue for deferred deletion of migrated anonymous cart items.
type: AWS SQS Queue
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: used-by
    target: components/shopping-cart-service
  - kind: supports
    target: flows/cart-migration
---
# Purpose

This queue decouples deletion of old anonymous-cart records from migration of their quantities into an authenticated cart.

# Configuration

The queue has a 20-second visibility timeout and routes messages to a dead-letter queue after five receives. Its worker receives batches of five and reserves 25 concurrent executions to limit DynamoDB spikes.

# Interactions

It supports [Cart Migration](../flows/cart-migration.md) in the [Shopping Cart Service](../components/shopping-cart-service.md).

# Limitations

No deployed queue state, retry outcome, or DLQ processing policy is evidenced.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[components/shopping-cart-service](../components/shopping-cart-service.md)
[flows/cart-migration](../flows/cart-migration.md)
