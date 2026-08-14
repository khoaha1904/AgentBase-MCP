---
type: API Endpoint
title: POST /cart/migrate
description: Authenticated SAM API route for migrating a cart after sign-in.
status: draft
generated: { by: agentbase/0.0.0, at: "2026-08-14T09:16:12.713Z" }
sources:
  - id: sam-route
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L270
  - id: frontend-call
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/frontend/src/backend/api.js#L71-L77
---

# Contract

The frontend sends an authenticated POST to `/cart/migrate`, matching the SAM route.[^frontend-call][^sam-route]

# Handler

SAM connects the route to [MigrateCartFunction](../infrastructure/aws/lambda/migrate-cart.md).[^sam-route]
