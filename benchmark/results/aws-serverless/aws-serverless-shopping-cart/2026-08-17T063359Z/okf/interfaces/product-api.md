---
title: Product API
description: REST API surface for mock product list and product-detail retrieval.
type: API Surface
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: product-api-readme
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - id: product-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L34-L69
  - id: client-api
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/frontend/src/backend/api.js#L63-L68
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-api-readme]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-template]
---

# Purpose

Product API supplies mock product data to the sample client.

# Consumers

[Shopping Cart Web Client](../components/shopping-cart-web-client.md) calls the product-list operation.

# Authentication

The client requests this API without the optional authentication header; the inspected template does not define a route authorizer.

# Operations

GET `/product` returns all products and GET `/product/{product_id}` returns one product.

# Failure Behavior

No shared error contract is evidenced.

# Related Concepts

This API is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

This is a mock product boundary, not evidence of a production product-service contract.
