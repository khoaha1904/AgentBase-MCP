---
title: Add to Cart Function
type: AWS Lambda
description: Lambda that adds a specified product quantity to a cart.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Add a product quantity to a shopping cart.
resource_name: AddToCartFunction
runtime: python3.8
handler: add_to_cart.lambda_handler
sources:
  - id: add-cart-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L202-L222
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [add-cart-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:shopping-cart-api
    evidence: [add-cart-definition]
    link: "[Shopping Cart API](../interfaces/shopping-cart-api.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [add-cart-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [add-cart-definition]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Add to Cart Function

This Lambda is invoked by `POST /cart`. Its configuration supplies the product-service URL and Cognito user-pool ID in addition to the cart table defaults.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart API](../interfaces/shopping-cart-api.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

No deployed function identity or runtime behavior is observed.
