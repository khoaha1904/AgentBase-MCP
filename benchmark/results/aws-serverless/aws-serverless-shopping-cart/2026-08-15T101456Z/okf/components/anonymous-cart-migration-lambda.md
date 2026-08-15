---
title: Anonymous Cart Migration Lambda
description: Lambda that merges anonymous cart contents into the authenticated user's cart.
type: AWS Lambda
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
business_purpose: Move anonymous cart items to the logged-in user's cart and defer removal of old entries.
resource_name: MigrateCartFunction
runtime: python3.8
handler: migrate_cart.lambda_handler
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L27-L38
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
relationships:
  - kind: part-of
    target: components/shopping-cart-service
  - kind: triggered-by
    target: interfaces/cart-api
  - kind: accesses
    target: resources/cart-table
  - kind: accesses
    target: resources/cart-deletion-queue
  - kind: declared-by
    target: infrastructure/shopping-cart-sam
---
# Anonymous Cart Migration Lambda

## Responsibility

This Lambda migrates an anonymous cart after login: items are reassigned to the user's cart and an existing user cart is merged. Old anonymous entries are removed asynchronously.

## Runtime

The SAM definition names `MigrateCartFunction`, uses `migrate_cart.lambda_handler`, inherits the Python 3.8 global runtime, and sets a 30-second timeout.

## Triggers

It is bound to `POST /cart/migrate` on the [Cart API](../interfaces/cart-api.md) and that binding uses the Cognito authorizer.

## Permissions

It uses the cart-service write role, whose policy allows `sqs:SendMessage*` to the [Cart Deletion Queue](../resources/cart-deletion-queue.md).

## Limitations

The available runtime excerpt does not provide the migration handler's exact message payload or error/retry behavior.

Related: [Shopping Cart Service](shopping-cart-service.md), [Cart Table](../resources/cart-table.md), and [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md).
