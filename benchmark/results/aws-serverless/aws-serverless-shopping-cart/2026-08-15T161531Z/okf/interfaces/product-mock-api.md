---
title: Product Mock API
type: API Surface
description: REST surface that returns mock product details.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: product-api-design
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
  - id: product-api-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L69
---

# Product Mock API

The mock product REST surface returns all products at `GET /product` and a single product at `GET /product/{product_id}`. It exists to support the sample cart implementation.

# Limitations

It is a deliberately bare-bones mock service; no production product source or deployed endpoint is evidenced.
