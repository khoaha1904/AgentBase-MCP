---
title: Migrate cart Lambda
description: Moves an anonymous cart into the authenticated user's cart and queues old items for deletion.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: migrate-cart-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L271
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
business_purpose: Migrate an anonymous shopping cart after user authentication.
resource_name: MigrateCartFunction
runtime: python3.8
handler: migrate_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-migrate-post-endpoint
  - kind: accesses
    target: shopping-cart-dynamodb-table
  - kind: accesses
    target: cart-delete-sqs-queue
---
# Migrate cart Lambda

Triggered by [Cart migration endpoint](../../../api/cart-migrate-post.md), accesses the [Shopping cart DynamoDB table](../../../data/tables/shopping-cart.md), and sends deletions to the [Cart delete queue](../sqs/cart-delete-queue.md).
