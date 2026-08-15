---
title: Cart Migration Lambda
description: Moves anonymous-cart items to a signed-in user's cart and queues deletion of the old items.
type: AWS Lambda
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-migration-lambda
business_purpose: Move anonymous-cart items to the authenticated user's cart while deferring removal of the old items.
resource_name: MigrateCartFunction
runtime: python3.8
handler: migrate_cart.lambda_handler
relationships:
  - kind: triggered-by
    target: cart-migration-api
  - kind: accesses
    target: shopping-cart-table
  - kind: accesses
    target: cart-deletion-queue
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L46-L112
---
# Function

The handler queries anonymous-cart items, writes their quantities under the authenticated user, and returns the migrated products.

# Triggers

[Cart Migration API](../../../api/cart-migration.md) triggers this Lambda.

# Permissions

The SAM resource injects the [Shopping Cart Table](../../../data/tables/shopping-cart.md) and deletion-queue references; the handler performs DynamoDB queries and updates and sends old items to [Cart Deletion Queue](../sqs/cart-deletion.md).

# Limitations

The template does not declare this Lambda's runtime locally; it inherits the `python3.8` global function runtime.
