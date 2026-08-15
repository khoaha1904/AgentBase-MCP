---
title: Cart Database Stream Handler
type: AWS Lambda
description: DynamoDB-stream Lambda that maintains per-product quantity aggregates.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Maintain running aggregate product quantities across carts.
resource_name: CartDBStreamHandler
runtime: python3.8
handler: db_stream_handler.lambda_handler
sources:
  - id: stream-handler-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L347-L371
  - id: stream-handler-code
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/db_stream_handler.py#L27-L71
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [stream-handler-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [stream-handler-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [stream-handler-code]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Cart Database Stream Handler

This DynamoDB-stream Lambda processes batches of up to 100 records, with a maximum 60-second batching window. It computes each product's quantity delta from old and new images, then adds the delta to a `totalquantity` record.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The template supplies a stream trigger but no observed stream lag, retry, or aggregate correctness metrics.
