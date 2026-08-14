---
type: AWS Lambda
title: Migrate cart Lambda
description: SAM Lambda that migrates anonymous cart items to an authenticated user.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: sam-function
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - id: python-handler
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shopping-cart-service/migrate_cart.py#L43-L112
---

# Function

`MigrateCartFunction` uses `migrate_cart.lambda_handler`, and that Python handler implements the migration.[^sam-function][^python-handler]

# Triggers

The [POST /cart/migrate endpoint](../../../api/post-cart-migrate.md) triggers this function.

# Dependencies

The handler uses the [shopping cart table](../../../data/tables/shopping-cart.md) and [cart delete queue](../sqs/cart-delete.md).

# Limitations

The normalized observation returned only unrelated architecture facts; direct SAM, frontend, and Python inspection was required.
