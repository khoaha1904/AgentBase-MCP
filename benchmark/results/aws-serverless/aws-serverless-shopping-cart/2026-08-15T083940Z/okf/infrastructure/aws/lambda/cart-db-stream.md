---
title: Cart database stream Lambda
description: Updates per-product aggregate quantities from cart-table stream records.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-db-stream-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L71
business_purpose: Maintain aggregate product quantities from cart-table changes.
resource_name: CartDBStreamHandler
runtime: python3.8
handler: db_stream_handler.lambda_handler
relationships:
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# Cart database stream Lambda

The SAM DynamoDB event is bound to the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md), which the handler also updates. The selected relationship guidance has no DynamoDB-stream event target type, so the trigger is not represented as a relationship.
