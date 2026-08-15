---
title: Get product
type: api_endpoint
status: draft
benchmark_key: get-product
sources:
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L34-L44
  - repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock-service/get_product.py#L19-L36
relationships:
  - kind: exposed_by
    target: product-api
---

`GET /product/{product_id}` on the [product API](product-api.md) returns the matching mock product, or a response whose product value is null when no match exists.
