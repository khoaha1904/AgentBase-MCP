---
title: List products endpoint
description: Returns the mock product list.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L46-L56
type: API Endpoint
benchmark_key: get-product
method: GET
route: /product
handler: get_products.lambda_handler
relationships: []
---

# Contract

`GET /product` returns the mock product list.

# Handler

The SAM function handler is `get_products.lambda_handler`.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
