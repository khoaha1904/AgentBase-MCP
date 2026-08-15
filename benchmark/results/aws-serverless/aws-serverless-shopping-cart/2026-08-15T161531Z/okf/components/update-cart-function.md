---
title: Update Cart Function
type: AWS Lambda
description: Lambda that updates the quantity for a cart product.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Set the quantity of a product in a shopping cart.
resource_name: UpdateCartFunction
runtime: python3.8
handler: update_cart.lambda_handler
sources:
  - id: update-cart-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L224-L244
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [update-cart-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:shopping-cart-api
    evidence: [update-cart-definition]
    link: "[Shopping Cart API](../interfaces/shopping-cart-api.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [update-cart-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [update-cart-definition]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Update Cart Function

This Lambda is invoked by `PUT /cart/{product_id}` and receives the product-service URL and user-pool ID configuration.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart API](../interfaces/shopping-cart-api.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

No deployed function identity or runtime behavior is observed.
