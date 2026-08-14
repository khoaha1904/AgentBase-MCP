---
type: AWS SQS Queue
title: Cart delete SQS queue
description: Queue used to remove anonymous cart items asynchronously after migration.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: sam-queue
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L414-L423
  - id: producer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L85-L87
---

# Queue

SAM declares `CartDeleteSQSQueue` with a dead-letter queue and five-attempt redrive policy.[^sam-queue]

# Producers

The [migration Lambda](../lambda/migrate-cart.md) sends each old anonymous cart item to this queue.[^producer]

# Limitations

This benchmark slice did not inspect the queue consumer.
