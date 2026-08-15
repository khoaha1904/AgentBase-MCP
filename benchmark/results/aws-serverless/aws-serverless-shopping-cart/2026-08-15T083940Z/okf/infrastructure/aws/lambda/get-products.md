---
title: Get products Lambda
description: Retrieves the packaged mock product list.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: get-products-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L46-L57
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock-service/get_products.py#L21-L31
business_purpose: Retrieve the mock product list.
resource_name: GetProductsFunction
runtime: python3.8
handler: get_products.lambda_handler
relationships:
  - kind: triggered-by
    target: products-get-endpoint
---
# Get products Lambda

Triggered by [Products endpoint](../../../api/products-get.md). Product data is read from a packaged JSON file rather than a modeled infrastructure resource.
