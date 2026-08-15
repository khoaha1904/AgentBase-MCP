---
title: Product endpoint
description: Retrieves one mock product by identifier.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: product-get-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L34-L45
method: GET
route: /product/{product_id}
handler: get_product.lambda_handler
relationships:
  - kind: handled-by
    target: get-product-lambda
---
# Product endpoint

Handled by [Get product Lambda](../infrastructure/aws/lambda/get-product.md).
