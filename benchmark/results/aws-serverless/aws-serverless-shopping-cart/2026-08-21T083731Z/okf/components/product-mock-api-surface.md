---
type: Service
title: Product mock API surface
description: Provides a separately navigable mock product API consumed by the frontend and cart addition flow.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:39:17.436Z
sources:
  - id: sem_product_api
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/product-mock.yaml#L33-L56
  - id: readme_product_mock
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L6-L8
agentbase:
  technology:
    - AWS
    - AWS SAM
---

# Responsibility

Provides the separate mock product API boundary. Its template exposes read operations for a single product and for the product collection.

# Boundaries and limitations

This is deliberately a mock products service supplied to demonstrate the shopping-cart application. It is kept separate from the cart system because it has its own API template and independently queryable interface. No deployed endpoint or production-product-data claim is made.
