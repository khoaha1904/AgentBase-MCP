---
type: API Surface
title: Cart API
description: REST interface for anonymous and authenticated shopping-cart operations.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-cart-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: cart-sam-routes
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L57-L75
  - id: cart-sam-migration-checkout
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L246-L315
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [readme-cart-api]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [cart-sam-routes]
    link: "[aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Purpose

Provides the client contract for cart state and cart-specific administrative aggregate retrieval.

# Consumers

The [Vue Frontend](../components/vue-frontend.md) calls the cart API. The frontend does not use the documented aggregate-total operation.

# Authentication

The template defines a Cognito authorizer. Migration and checkout explicitly require it; the documentation requires support for anonymous carts, and add-to-cart code conditionally reads an Authorization header.

# Operations

`GET /cart` retrieves a cart. `POST /cart` adds a product and quantity. `PUT /cart/{product_id}` sets quantity. `POST /cart/migrate` merges an anonymous cart after sign-in. `POST /cart/checkout` empties the signed-in cart. `GET /cart/{product_id}/total` returns total quantity across carts.

# Failure Behavior

The source does not specify a consistent API error model. The add handler returns 400 for a missing body and 404 when its product lookup fails; migration and checkout return 400 for invalid user claims.

# Limitations

No OpenAPI document, versioning policy, rate limit, or deployed URL is evidenced. The aggregate endpoint is documented as unauthenticated, while its SAM event lacks an explicit authorization setting; this does not prove a broader security posture.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and [aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md).
