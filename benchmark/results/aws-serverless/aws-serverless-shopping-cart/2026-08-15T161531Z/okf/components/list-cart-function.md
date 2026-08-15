---
title: List Cart Function
type: AWS Lambda
description: Lambda that retrieves the caller's cart.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
business_purpose: Retrieve an anonymous or authenticated user's shopping cart.
resource_name: ListCartFunction
runtime: python3.8
handler: list_cart.lambda_handler
sources:
  - id: list-cart-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/shoppingcart-service.yaml#L181-L200
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [list-cart-definition]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: triggered-by
    target: api-surface:shopping-cart-api
    evidence: [list-cart-definition]
    link: "[Shopping Cart API](../interfaces/shopping-cart-api.md)"
  - kind: declared-by
    target: infra-definition:shopping-cart-sam
    evidence: [list-cart-definition]
    link: "[Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [list-cart-definition]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# List Cart Function

This Lambda is invoked by `GET /cart`. It has the template's Python 3.8 runtime, five-second timeout, tracing, and read role.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md), [Shopping Cart API](../interfaces/shopping-cart-api.md), [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md), and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The source does not evidence invocation volume, errors, or a deployed function ARN.
