---
title: Product API
description: Mock REST API surface that lists products and returns an individual product by ID.
type: API Surface
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: product-api-documentation
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - id: product-api-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L69
  - id: frontend-product-consumer
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/frontend/src/backend/api.js#L63-L69
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-api-documentation]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [product-api-definition]
---

# Purpose

This API provides the sample product catalog boundary used by the frontend and the cart service.

# Consumers

The Vue frontend requests the complete product list. The cart service requests `/product/{product_id}` while adding or updating cart entries.

# Authentication

No API authorizer is declared in the product SAM template.

# Operations

* `GET /product` returns all static products.
* `GET /product/{product_id}` returns one product selected from the static list.

# Failure Behavior

The individual-product handler returns HTTP 200 with a possibly null `product` value; the cart service treats a missing `product` response field as not found.

# Limitations

It is a mock API with no documented versioning, authentication, or deployed endpoint.

## Relationships

The API is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
