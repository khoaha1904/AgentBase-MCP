---
title: Delete from Cart Function
type: AWS Lambda
description: SQS-triggered Lambda worker that deletes cart items.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Remove migrated anonymous-cart items asynchronously.
resource_name: DeleteFromCartFunction
runtime: python3.8
handler: delete_from_cart.lambda_handler
sources:
  - id: deletion-worker-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - id: deletion-worker-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L16-L30
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [deletion-worker-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: aws-sqs-queue:cart-deletion-queue
    evidence: [deletion-worker-definition]
    link: "[Cart Deletion Queue](../resources/cart-deletion-queue.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [deletion-worker-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [deletion-worker-handler]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Delete from Cart Function

The queue-driven worker receives up to five records per batch and deletes their `pk`/`sk` items with a DynamoDB batch writer. Reserved concurrency is 25 to limit deletion spikes.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Cart Deletion Queue](../resources/cart-deletion-queue.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

## Failure Behavior

The queue's desired state uses a dead-letter queue after five receives; no handler-specific failure destination is defined.
