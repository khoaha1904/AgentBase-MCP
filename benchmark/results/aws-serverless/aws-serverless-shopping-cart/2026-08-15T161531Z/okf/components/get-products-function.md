---
title: Get Products Function
type: AWS Lambda
description: Lambda that returns the mock product collection.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Return all mock product details.
resource_name: GetProductsFunction
runtime: python3.8
handler: get_products.lambda_handler
sources:
  - id: get-products-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L46-L56
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [get-products-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:product-mock-api
    evidence: [get-products-definition]
    link: "[Product Mock API](../interfaces/product-mock-api.md)"
  - kind: declared-by
    target: infra-definition:product-mock-sam
    evidence: [get-products-definition]
    link: "[Product Mock SAM Definition](../infrastructure/product-mock-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [get-products-definition]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Get Products Function

This Lambda is invoked by `GET /product` under the mock product API.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Product Mock API](../interfaces/product-mock-api.md), [Product Mock SAM Definition](../infrastructure/product-mock-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The mock service does not evidence an external product system.
