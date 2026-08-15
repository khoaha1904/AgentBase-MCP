---
type: Service
title: Product Mock Service
description: SAM-declared mock product catalog REST service used for demonstration.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-product-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - id: product-sam
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L68
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [readme-product-api]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: provides
    target: interfaces/product-api
    evidence: [product-sam]
    link: "[Product API](../interfaces/product-api.md)"
  - kind: declared-by
    target: infrastructure/product-mock-sam-stack
    evidence: [product-sam]
    link: "[Product Mock SAM Stack](../infrastructure/product-mock-sam-stack.md)"
---

# Responsibility

This bare-bones service returns all products or one product so the shopping-cart example can demonstrate product lookup.

# Interfaces

It provides the unauthenticated [Product API](../interfaces/product-api.md) routes `GET /product` and `GET /product/{product_id}`.

# Dependencies

Product details are read from the packaged `product_list.json` file by the corresponding Lambda handlers.

# Operations

The SAM template sets Python 3.8, 256 MB, five-second timeout, active tracing, and a `live` alias for its functions.

# Limitations

It is explicitly a mock service; the source does not establish a production catalog, ownership, availability objective, or deployed endpoint.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), [Product API](../interfaces/product-api.md), and [Product Mock SAM Stack](../infrastructure/product-mock-sam-stack.md).
