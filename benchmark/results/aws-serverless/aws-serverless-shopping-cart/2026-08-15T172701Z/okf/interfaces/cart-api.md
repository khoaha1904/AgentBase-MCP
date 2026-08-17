---
title: Cart API
description: REST API surface for anonymous and authenticated shopping-cart operations and product aggregate lookup.
type: API Surface
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: cart-api-documentation
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - id: cart-api-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L315
  - id: frontend-cart-consumer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/frontend/src/backend/api.js#L29-L61
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [cart-api-documentation]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [cart-api-definition]
---

# Purpose

This API groups the related cart CRUD, migration, checkout, and aggregate-total operations exposed by the shopping cart service.

# Consumers

The Vue frontend calls `/cart` with GET, POST, and PUT operations, sends POST requests to `/cart/migrate` and `/cart/checkout`, and includes credentials. The total endpoint is documented as manually callable and unused by the frontend.

# Authentication

The template configures a Cognito authorizer for migration and checkout. The cart list and mutation handlers may use an Authorization header when present, but are documented to support anonymous carts.

# Operations

* `GET /cart` retrieves a cart.
* `POST /cart` adds a product quantity.
* `PUT /cart/{product_id}` replaces a product quantity.
* `POST /cart/migrate` merges an anonymous cart into an authenticated cart.
* `POST /cart/checkout` empties the authenticated user's cart.
* `GET /cart/{product_id}/total` returns aggregate quantity across carts.

# Failure Behavior

Write handlers return a bad request for missing or invalid input and return not found when product lookup fails. The source does not document a comprehensive error contract.

# Limitations

No versioning policy or deployed base URL is evidenced. CORS allows only OPTIONS, POST, GET, and PUT in the SAM configuration.

## Relationships

The API is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
