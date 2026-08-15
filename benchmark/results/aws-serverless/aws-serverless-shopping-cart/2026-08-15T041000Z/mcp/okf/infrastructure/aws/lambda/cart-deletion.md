---
title: Cart Deletion Lambda
description: Deletes cart items carried by SQS messages from DynamoDB.
type: AWS Lambda
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-deletion-lambda
business_purpose: Delete old anonymous-cart items asynchronously after cart migration.
resource_name: DeleteFromCartFunction
runtime: python3.8
handler: delete_from_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-deletion-queue
  - kind: accesses
    target: shopping-cart-table
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L345
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L16-L30
---
# Function

The handler batch-deletes each queued item's `pk` and `sk` from the DynamoDB table.

# Triggers

[Cart Deletion Queue](../sqs/cart-deletion.md) triggers this Lambda through its SQS event source.

# Permissions

The resource grants DynamoDB `DeleteItem` and `BatchWriteItem` on [Shopping Cart Table](../../../data/tables/shopping-cart.md).

# Limitations

The template inherits the `python3.8` runtime from global function configuration.
