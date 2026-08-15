---
title: Cart Migration API
description: Authenticated endpoint that starts migration of an anonymous cart to the signed-in user.
type: API Endpoint
status: draft
generated:
  by: agentbase/3.0.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-migration-api
method: POST
route: /cart/migrate
handler: migrate_cart.lambda_handler
relationships:
  - kind: handled-by
    target: cart-migration-lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
---
# Contract

`POST /cart/migrate` uses the Cognito authorizer and invokes [Cart Migration Lambda](../infrastructure/aws/lambda/cart-migration.md).

# Handler

The SAM event binds this route to `migrate_cart.lambda_handler`.

# Failure Behavior

The infrastructure declaration does not specify an API-level failure response; the handler's source provides that behavior.
