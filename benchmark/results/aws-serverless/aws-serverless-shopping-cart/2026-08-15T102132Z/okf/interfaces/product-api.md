---
title: Product API
description: HTTP API surface for the mock product catalog.
type: API Surface
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L69
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: provided-by
    target: components/product-mock-service
---
# Purpose

The Product API exposes the mock catalog used to demonstrate cart functionality.

# Consumers

The frontend requests `GET /product` using its Amplify ProductAPI client.

# Authentication

No authentication binding is evidenced in the product SAM template.

# Operations

`GET /product` returns all products. `GET /product/{product_id}` returns one product.

# Failure Behavior

No complete error contract is evidenced.

# Limitations

This service is explicitly a mock, not evidence of a production catalog boundary.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[components/product-mock-service](../components/product-mock-service.md)
