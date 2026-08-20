---
title: Cart Deletion SQS Queue
description: Desired SQS queue that decouples cart-migration cleanup from the synchronous request.
type: AWS SQS Queue
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: cart-queue-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - id: cart-queue-resource
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
  - id: migration-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-queue-resource]
  - kind: declared-by
    target: infrastructure/shopping-cart-sam
    evidence: [cart-queue-resource]
agentbase:
  live_claims:
    - id: AB-CLAIM-CART-DELETE-QUEUE-RETRY
      subject: resources/cart-deletion-queue
      property: redrive_policy
      role: configuration
      source_id: cart-queue-resource
      target: { kind: aws_sqs_queue, name: CartDeleteSQSQueue }
      observed: { commit: 66a863f1b7a2a7f319adddce6a55e090ce9f6734, dirty: false, dirty_digest: null }
---

# Purpose

The queue defers deletion of old anonymous-cart records after migration.

# Messages

The README establishes that migration puts deletion work onto SQS; message shape is not documented.

# Producers

[Shopping Cart Service](../components/shopping-cart-service.md) is the documented producer during cart migration.

# Consumers

The SAM template configures a delete-from-cart Lambda handler to retrieve queue messages.

# Failure Behavior

The desired queue references a dead-letter queue and a redrive policy. Deployed queue policy and observed failures are not evidenced.

# Related Concepts

The queue is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and declared by [Shopping-cart SAM desired state](../infrastructure/shopping-cart-sam.md).

# Limitations

The template does not establish physical queue URLs/ARNs or a deployed dead-letter queue.
