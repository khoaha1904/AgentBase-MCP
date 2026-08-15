---
title: Cart Deletion Queue
description: SQS queue for asynchronously deleting migrated anonymous-cart entries.
type: AWS SQS Queue
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
resource_name: CartDeleteSQSQueue
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L165-L179
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L413-L422
relationships:
  - kind: produced-by
    target: components/anonymous-cart-migration-lambda
  - kind: consumed-by
    target: components/cart-deletion-worker-lambda
---
# Cart Deletion Queue

## Purpose

This queue decouples deletion of old anonymous-cart items from the cart-migration request. The source explains that deletion need not occur synchronously, so messages are sent to SQS for a worker Lambda.

## Producers

The [Anonymous Cart Migration Lambda](../components/anonymous-cart-migration-lambda.md) receives the queue identifier through its environment and is granted `sqs:SendMessage*` to the queue.

## Consumers

The [Cart Deletion Worker Lambda](../components/cart-deletion-worker-lambda.md) is configured with an SQS event source using batches of five messages.

## Failure Behavior

The queue has a 20-second visibility timeout and a redrive policy to `CartDeleteSQSDLQ` after five receives.

## Limitations

The message body and operational monitoring are not fully described in the cited configuration.
