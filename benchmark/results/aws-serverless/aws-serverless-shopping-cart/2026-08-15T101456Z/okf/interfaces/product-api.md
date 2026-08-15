---
title: Product API
description: REST surface for mock product retrieval.
type: API Surface
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L56
relationships:
  - kind: provided-by
    target: components/product-mock-service
  - kind: consumed-by
    target: components/vue-shopping-cart-client
  - kind: part-of
    target: systems/serverless-shopping-cart
---
# Product API

## Purpose

The Product API is the mock catalog's REST boundary. It serves the complete product collection and one product selected by identifier.

## Consumers

The [Vue Shopping Cart Client](../components/vue-shopping-cart-client.md) calls `GET /product`; the [Shopping Cart Service](../components/shopping-cart-service.md) calls the configured service URL with `/product/{product_id}` to validate or retrieve product details.

## Authentication

The template declares CORS headers but does not configure an authorizer for this API.

## Operations

`GET /product` returns all products and `GET /product/{product_id}` returns one product.

## Limitations

No versioning, external consumer, or deployed endpoint is evidenced.

This surface is provided by the [Product Mock Service](../components/product-mock-service.md) and is part of the [Shopping Cart System](../systems/serverless-shopping-cart.md).
