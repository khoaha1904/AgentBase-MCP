---
title: Migrate cart endpoint
description: Migrates an anonymous cart after user authentication.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
type: API Endpoint
benchmark_key: post-cart-migrate
method: POST
route: /cart/migrate
handler: migrate_cart.lambda_handler
relationships: []
---

# Contract

`POST /cart/migrate` migrates a cart.

# Handler

The SAM function handler is `migrate_cart.lambda_handler` and the route uses the Cognito authorizer.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
