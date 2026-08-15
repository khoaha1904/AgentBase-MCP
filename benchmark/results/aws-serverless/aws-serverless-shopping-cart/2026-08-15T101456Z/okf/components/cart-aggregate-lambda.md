---
title: Cart Aggregate Lambda
description: DynamoDB Stream Lambda that maintains aggregate product quantities across carts.
type: AWS Lambda
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
business_purpose: Maintain a running total of each product quantity from cart-table changes.
resource_name: CartDBStreamHandler
runtime: python3.8
handler: db_stream_handler.lambda_handler
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L71
relationships:
  - kind: part-of
    target: components/shopping-cart-service
  - kind: triggered-by
    target: resources/cart-table
  - kind: accesses
    target: resources/cart-table
  - kind: declared-by
    target: infrastructure/shopping-cart-sam
---
# Cart Aggregate Lambda

## Responsibility

The stream handler calculates quantity deltas for cart product records and updates a running aggregate record per product. This avoids scanning the whole table for total quantities.

## Runtime

`CartDBStreamHandler` uses `db_stream_handler.lambda_handler` and inherits the template's Python 3.8 runtime.

## Triggers

The [Cart Table](../resources/cart-table.md) stream invokes the function from `LATEST`, in batches of up to 100 records with a 60-second maximum batching window.

## Permissions

The function has the DynamoDB stream execution role and an explicit `dynamodb:UpdateItem` permission for the cart table.

## Failure Behavior

No retry, on-failure destination, or partial-batch response configuration is evidenced.

Related: [Shopping Cart Service](shopping-cart-service.md) and [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md).
