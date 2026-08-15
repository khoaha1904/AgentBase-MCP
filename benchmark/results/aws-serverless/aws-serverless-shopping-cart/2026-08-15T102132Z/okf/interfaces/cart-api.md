---
title: Cart API
description: HTTP API surface for retrieving, changing, migrating, checking out, and aggregating carts.
type: API Surface
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L54-L80
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L314
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: provided-by
    target: components/shopping-cart-service
  - kind: triggers
    target: flows/cart-migration
---
# Purpose

The Cart API is the consumer boundary for cart operations.

# Consumers

The Vue frontend calls cart endpoints through AWS Amplify; its client attaches an ID-token Authorization header when a session is available and sends browser credentials for cart requests.

# Authentication

The SAM template explicitly applies the Cognito authorizer to `POST /cart/migrate` and `POST /cart/checkout`. The source does not establish equivalent per-route authorization for the other declared operations.

# Operations

`GET /cart` retrieves an anonymous or signed-in cart. `POST /cart` adds a product quantity. `PUT /cart/{product_id}` sets a product quantity. `POST /cart/migrate` migrates an anonymous cart after login, and `POST /cart/checkout` empties the cart. `GET /cart/{product_id}/total` returns the aggregate quantity across carts.

# Failure Behavior

The reviewed contract describes the operations but not a complete API error model.

# Limitations

The total endpoint is documented as unauthenticated and not used by the frontend; no versioning contract is evidenced.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[components/shopping-cart-service](../components/shopping-cart-service.md)
[flows/cart-migration](../flows/cart-migration.md)
