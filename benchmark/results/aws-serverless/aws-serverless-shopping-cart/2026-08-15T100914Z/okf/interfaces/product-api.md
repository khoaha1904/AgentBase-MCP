---
title: Product API
description: HTTP API surface for listing mock products and retrieving one product.
type: API Surface
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L69
relationships:
  - kind: provided-by
    target: components/product-mock-service
  - kind: part-of
    target: systems/serverless-shopping-cart
---

# Purpose

This read-only surface groups the mock product service's product-list and product-detail operations.

It is provided by the [product mock service](../components/product-mock-service.md) and is part of the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md).

# Consumers

The Vue frontend calls `GET /product` through its `ProductAPI` configuration. Shopping-cart handlers call `/product/{product_id}` using the configured product-service URL before cart writes.

# Operations

`GET /product` returns all products and `GET /product/{product_id}` returns one product.

# Limitations

The source provides route declarations but no formal schemas or authentication requirement for this mock API.
