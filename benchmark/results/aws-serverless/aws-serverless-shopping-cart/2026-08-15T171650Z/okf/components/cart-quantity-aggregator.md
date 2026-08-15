---
title: Cart Quantity Aggregator
description: DynamoDB Stream-triggered Lambda that maintains product quantities across carts.
type: AWS Lambda
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
business_purpose: Maintain aggregate per-product quantities without scanning the cart table.
resource_name: CartDBStreamHandler
runtime: python3.8
handler: db_stream_handler.lambda_handler
sources:
  - id: aggregator-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - id: aggregator-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
relationships:
  - kind: part-of
    target: components/cart-service
    evidence: [aggregator-definition]
  - kind: writes-to
    target: resources/cart-table
    evidence: [aggregator-handler]
  - kind: declared-by
    target: infrastructure/cart-sam-template
    evidence: [aggregator-definition]
---

# Cart Quantity Aggregator

## Responsibility

Calculates quantity deltas from table stream records and adds them to per-product aggregate records.

## Runtime

The SAM global runtime is Python 3.8 and the handler is `db_stream_handler.lambda_handler`.

## Triggers

It consumes the cart table's DynamoDB Stream from `LATEST`, with batch size 100 and a 60-second maximum batching window.

## Permissions

The template assigns the DynamoDB execution role and allows `dynamodb:UpdateItem` on the cart table.

## Failure Behavior

No explicit failure destination or retry policy is declared for this event source.

## Limitations

Aggregate update idempotency and handling of partial batch failures are not documented.

## Relationship Links

- [Cart Service](cart-service.md)
- [Cart DynamoDB Table](../resources/cart-table.md)
- [Cart SAM Template](../infrastructure/cart-sam-template.md)
