---
type: AWS Lambda
title: Cart Total Projector
description: DynamoDB Stream Lambda that updates aggregate cart quantity by product.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Maintain a running total of product quantities across carts.
resource_name: CartDBStreamHandler
runtime: python3.8
handler: db_stream_handler.lambda_handler
sources:
  - id: projector-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - id: projector-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L25-L71
  - id: aggregation-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L40-L51
relationships:
  - kind: part-of
    target: components/shopping-cart-service
    evidence: [projector-definition]
    link: "[Shopping Cart Service](shopping-cart-service.md)"
  - kind: writes-to
    target: resources/shopping-cart-table
    evidence: [projector-handler]
    link: "[Shopping Cart Table](../resources/shopping-cart-table.md)"
  - kind: declared-by
    target: infrastructure/shopping-cart-sam-stack
    evidence: [projector-definition]
    link: "[Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md)"
---

# Responsibility

For each DynamoDB batch, the function calculates the quantity delta for each changed product entry and adds the accumulated delta to that product's `totalquantity` record.

# Runtime

It inherits the template's Python 3.8, 512 MB, five-second timeout, active tracing, and `live` alias.

# Triggers

DynamoDB Stream invokes it from the cart table with `NEW_AND_OLD_IMAGES`, batch size 100, a maximum batching window of 60 seconds, and starting position `LATEST`.

# Permissions

The template grants the DynamoDB execution role and `dynamodb:UpdateItem` against the cart table.

# Failure Behavior

The handler has no explicit per-record exception handling or destination. At-least-once stream delivery and its implications for aggregate correctness are not documented.

# Limitations

The README describes the configured 60-second/100-event batching behavior, which agrees with the template. It does not evidence monitoring alarms, replay policy, or a deployed function ARN.

Related: [Shopping Cart Service](shopping-cart-service.md), [Shopping Cart Table](../resources/shopping-cart-table.md), and [Shopping Cart SAM Stack](../infrastructure/shopping-cart-sam-stack.md).
