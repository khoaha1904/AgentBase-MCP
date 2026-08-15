---
title: List products
type: api_endpoint
status: draft
benchmark_key: list-products
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L46-L56
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock-service/get_products.py#L19-L31
relationships:
  - kind: exposed_by
    target: product-api
---

`GET /product` on the [product API](product-api.md) returns the mock product list.
