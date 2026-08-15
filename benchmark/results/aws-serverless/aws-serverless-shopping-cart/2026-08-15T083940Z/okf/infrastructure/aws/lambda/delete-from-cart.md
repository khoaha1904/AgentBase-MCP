---
title: Delete from cart Lambda
description: Deletes cart items received from the cart deletion queue.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: delete-from-cart-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L316-L346
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/delete_from_cart.py#L16-L30
business_purpose: Asynchronously delete migrated anonymous-cart items.
resource_name: DeleteFromCartFunction
runtime: python3.8
handler: delete_from_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-delete-sqs-queue
  - kind: accesses
    target: shopping-cart-dynamodb-table
---
# Delete from cart Lambda

Triggered by the [Cart delete queue](../sqs/cart-delete-queue.md) and accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md). The event mapping sets batch size five and reserved concurrency 25.
