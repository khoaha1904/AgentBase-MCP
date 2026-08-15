---
title: Get Cart Total Function
type: AWS Lambda
description: Lambda that retrieves a product quantity aggregated across carts.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Retrieve a product's aggregate quantity across carts.
resource_name: GetCartTotalFunction
runtime: python3.8
handler: get_cart_total.lambda_handler
sources:
  - id: total-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L297-L314
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [total-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:shopping-cart-api
    evidence: [total-definition]
    link: "[Shopping Cart API](../interfaces/shopping-cart-api.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [total-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [total-definition]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Get Cart Total Function

This Lambda is invoked by `GET /cart/{product_id}/total` with a 10-second timeout. The README describes the result as a product total across all carts.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart API](../interfaces/shopping-cart-api.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The API is a demonstration endpoint and is not used by the frontend.
