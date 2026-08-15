---
title: Cart Deletion Worker Lambda
description: SQS-triggered Lambda that deletes cart items after migration.
type: AWS Lambda
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
business_purpose: Delete old cart items from queued migration work.
resource_name: DeleteFromCartFunction
runtime: python3.8
handler: delete_from_cart.lambda_handler
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L34
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
relationships:
  - kind: part-of
    target: components/shopping-cart-service
  - kind: triggered-by
    target: resources/cart-deletion-queue
  - kind: accesses
    target: resources/cart-table
  - kind: declared-by
    target: infrastructure/shopping-cart-sam
---
# Cart Deletion Worker Lambda

## Responsibility

This worker deletes old cart entries that were deferred during anonymous-cart migration.

## Runtime

The `DeleteFromCartFunction` resource names `delete_from_cart.lambda_handler` and inherits the template's Python 3.8 runtime. It reserves 25 concurrent executions to limit DynamoDB spikes during many deletions.

## Triggers

An SQS event source connects it to the [Cart Deletion Queue](../resources/cart-deletion-queue.md), with a batch size of five.

## Permissions

The function is granted SQS polling and DynamoDB delete/batch-write permissions for the [Cart Table](../resources/cart-table.md).

## Failure Behavior

Queue redrive behavior is defined by the [Cart Deletion Queue](../resources/cart-deletion-queue.md), which sends a message to its DLQ after five receives.

## Limitations

The handler's per-message failure behavior is not evidenced in the selected source spans.

Related: [Shopping Cart Service](shopping-cart-service.md) and [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md).
