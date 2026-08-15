---
title: Cart migration endpoint
description: Migrates an anonymous cart to the authenticated user.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: cart-migrate-post-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L271
method: POST
route: /cart/migrate
handler: migrate_cart.lambda_handler
relationships:
  - kind: handled-by
    target: migrate-cart-lambda
---
# Cart migration endpoint

Handled by [Migrate cart Lambda](../infrastructure/aws/lambda/migrate-cart.md). The SAM event configures the Cognito authorizer; the repository does not expose the full authentication contract here.
