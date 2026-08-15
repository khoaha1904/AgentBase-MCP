---
type: API Surface
title: Product API
description: REST interface providing mock product catalog retrieval.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-product-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - id: product-sam-routes
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L68
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [readme-product-api]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-sam-routes]
    link: "[aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Purpose

Provides the mock catalog contract used by the frontend and cart mutation handlers.

# Consumers

The [Vue Frontend](../components/vue-frontend.md) lists products. The cart add and update handlers are configured with the product-service URL and use it to retrieve individual product details.

# Authentication

The template does not declare an authorizer. The frontend calls product listing without an authorization header.

# Operations

`GET /product` returns all product details. `GET /product/{product_id}` returns one product.

# Failure Behavior

The cart helper treats a response without a `product` field as not found; the product-service handler error behavior itself is not fully evidenced here.

# Limitations

This is a mock API, with no schema, versioning, rate limits, or deployed endpoint in evidence.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and [aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md).
