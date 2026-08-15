---
type: AWS Lambda
title: Cart Deletion Worker
description: SQS-triggered Lambda that deletes cart entries after migration.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Remove old anonymous-cart entries asynchronously after cart migration.
resource_name: DeleteFromCartFunction
runtime: python3.8
handler: delete_from_cart.lambda_handler
sources:
  - id: deletion-worker-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - id: migration-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
relationships:
  - kind: part-of
    target: components/shopping-cart-service
    evidence: [deletion-worker-definition]
    link: "[Shopping Cart Service](shopping-cart-service.md)"
  - kind: triggered-by
    target: resources/cart-deletion-queue
    evidence: [deletion-worker-definition]
    link: "[Cart Deletion Queue](../resources/cart-deletion-queue.md)"
  - kind: writes-to
    target: resources/shopping-cart-table
    evidence: [deletion-worker-definition]
    link: "[Shopping Cart Table](../resources/shopping-cart-table.md)"
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [deletion-worker-definition]
    link: "[Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md)"
---

# Responsibility

The worker is the asynchronous cleanup boundary for old anonymous-cart items after migration.

# Runtime

It inherits the template's Python 3.8, 512 MB, five-second default timeout, active tracing, and `live` alias. Reserved concurrency is 25 to limit DynamoDB spikes.

# Triggers

SQS invokes it from [Cart Deletion Queue](../resources/cart-deletion-queue.md), in batches of five.

# Permissions

The template grants an SQS poller policy for the queue plus DynamoDB `DeleteItem` and `BatchWriteItem` against the cart table.

# Failure Behavior

The queue redrives a message to its DLQ after five receives. The handler's per-message error handling is not represented in this component because the source implementation was not independently inspected.

# Limitations

No Lambda retry setting, response-batching behavior, deployed ARN, or DLQ processing is evidenced.

Related: [Shopping Cart Service](shopping-cart-service.md), [Cart Deletion Queue](../resources/cart-deletion-queue.md), [Shopping Cart Table](../resources/shopping-cart-table.md), and [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
