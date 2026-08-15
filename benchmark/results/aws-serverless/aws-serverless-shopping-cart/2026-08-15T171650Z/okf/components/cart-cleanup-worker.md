---
title: Cart Cleanup Worker
description: SQS-triggered Lambda that deletes migrated anonymous-cart records.
type: AWS Lambda
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
business_purpose: Remove anonymous-cart entries after migration.
resource_name: DeleteFromCartFunction
runtime: python3.8
handler: delete_from_cart.lambda_handler
sources:
  - id: worker-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - id: worker-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L14-L30
relationships:
  - kind: part-of
    target: components/cart-service
    link: ../components/cart-service.md
    evidence: [worker-definition]
  - kind: triggered-by
    target: resources/cart-cleanup-queue
    link: ../resources/cart-cleanup-queue.md
    evidence: [worker-definition]
  - kind: writes-to
    target: resources/cart-table
    link: ../resources/cart-table.md
    evidence: [worker-handler]
  - kind: declared-by
    target: infrastructure/cart-sam-template
    link: ../infrastructure/cart-sam-template.md
    evidence: [worker-definition]
---

# Cart Cleanup Worker

## Responsibility

Deletes DynamoDB cart entries represented by SQS messages after cart migration.

## Runtime

The SAM global runtime is Python 3.8; the configured handler is `delete_from_cart.lambda_handler`. Reserved concurrency is 25 to limit DynamoDB deletion spikes.

## Triggers

An SQS event source maps the cleanup queue to this function with batch size 5.

## Permissions

The template grants SQS polling and DynamoDB `DeleteItem`/`BatchWriteItem` access.

## Failure Behavior

SQS redrive behavior is configured on the source queue; Lambda retry behavior is not specified.

## Limitations

No deployed function identity, execution metrics, or DLQ processing implementation is evidenced.

## Relationship Links

- [Cart Service](cart-service.md)
- [Cart Cleanup SQS Queue](../resources/cart-cleanup-queue.md)
- [Cart DynamoDB Table](../resources/cart-table.md)
- [Cart SAM Template](../infrastructure/cart-sam-template.md)
