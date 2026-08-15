---
title: Products endpoint
description: Retrieves the mock product list.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: products-get-endpoint
type: API Endpoint
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L46-L57
method: GET
route: /product
handler: get_products.lambda_handler
relationships:
  - kind: handled-by
    target: get-products-lambda
---
# Products endpoint

Handled by [Get products Lambda](../infrastructure/aws/lambda/get-products.md).
