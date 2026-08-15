---
title: Checkout Cart Function
type: AWS Lambda
description: Lambda that clears the authenticated caller's cart.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Empty a shopping cart for checkout.
resource_name: CheckoutCartFunction
runtime: python3.8
handler: checkout_cart.lambda_handler
sources:
  - id: checkout-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L272-L295
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [checkout-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:shopping-cart-api
    evidence: [checkout-definition]
    link: "[Shopping Cart API](../interfaces/shopping-cart-api.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [checkout-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [checkout-definition]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Checkout Cart Function

This Lambda is invoked by authenticated `POST /cart/checkout` and has a 10-second timeout.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart API](../interfaces/shopping-cart-api.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The README says checkout currently only empties the cart; no payment integration is implemented.
