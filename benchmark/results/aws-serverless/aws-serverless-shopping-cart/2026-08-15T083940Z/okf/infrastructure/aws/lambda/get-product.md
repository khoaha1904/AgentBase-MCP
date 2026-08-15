---
title: Get product Lambda
description: Retrieves one mock product from the packaged product list.
status: draft
generated:
  by: agentbase/3.1.0
  at: "2026-08-15T00:00:00Z"
benchmark_key: get-product-lambda
type: AWS Lambda
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L34-L45
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock-service/get_product.py#L21-L36
business_purpose: Retrieve one mock product by identifier.
resource_name: GetProductFunction
runtime: python3.8
handler: get_product.lambda_handler
relationships:
  - kind: triggered-by
    target: product-get-endpoint
---
# Get product Lambda

Triggered by [Product endpoint](../../../api/product-get.md). Product data is read from a packaged JSON file rather than a modeled infrastructure resource.
