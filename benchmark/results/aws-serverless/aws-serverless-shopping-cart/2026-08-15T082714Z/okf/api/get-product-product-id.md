---
title: Get product endpoint
description: Returns a mock product by product ID.
status: draft
generated:
  by: agentbase/3.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L34-L44
type: API Endpoint
benchmark_key: get-product-product-id
method: GET
route: /product/{product_id}
handler: get_product.lambda_handler
relationships: []
---

# Contract

`GET /product/{product_id}` returns a mock product.

# Handler

The SAM function handler is `get_product.lambda_handler`.

# Failure Behavior

No route-specific failure behavior is declared in the API resource.
