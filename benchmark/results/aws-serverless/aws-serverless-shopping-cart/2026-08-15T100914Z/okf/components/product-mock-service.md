---
title: Product mock service
description: SAM-defined mock product service exposing read-only product lookup operations.
type: Service
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L69
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
  - kind: provides
    target: interfaces/product-api
---

# Responsibility

This mock service provides Lambda-backed lookup operations for all products and a single product. Its template explicitly describes it as a mock product service.

It is part of the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md).

# Interfaces

It provides the [Product API](../interfaces/product-api.md), which the frontend calls to list products. The shopping-cart handlers are configured with a product-service URL and use that external API for product details.

# Operations

The SAM globals configure regional API Gateway, tracing, CORS, a five-second function timeout, and a `live` alias.

# Limitations

The repository describes this as demonstration-only mock functionality; no product-data ownership or external deployment instance is evidenced.
