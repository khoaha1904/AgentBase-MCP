---
title: Product Mock Service
description: SAM-defined demonstration service that serves product details.
type: Service
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L6-L8
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L69
relationships:
  - kind: part-of
    target: systems/shopping-cart
  - kind: provides
    target: interfaces/product-api
---
# Responsibility

This independently deployable SAM service supplies product-list and single-product lookup endpoints to demonstrate the shopping-cart application.

# Interfaces

It provides the [Product API](../interfaces/product-api.md).

# Dependencies

Its template accepts an allowed origin and publishes its API URL to an SSM parameter for consumers.

# Operations

Only read operations are evidenced: listing products and retrieving one product.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[interfaces/product-api](../interfaces/product-api.md)
