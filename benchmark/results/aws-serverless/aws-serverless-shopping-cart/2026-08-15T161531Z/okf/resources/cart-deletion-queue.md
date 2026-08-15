---
title: Cart Deletion Queue
type: AWS SQS Queue
description: Desired SQS queue that carries anonymous-cart items for asynchronous deletion.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: deletion-queue-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L423
  - id: migration-publishes-delete
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L76-L90
---

# Cart Deletion Queue

The queue receives anonymous-cart items after migration so deletion can occur asynchronously. Its desired state sets a 20-second visibility timeout and redirects messages after five receives to a dead-letter queue.

# Limitations

No queue URL, ARN, message volume, or observed dead-letter processing is evidenced.
