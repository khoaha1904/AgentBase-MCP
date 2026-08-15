---
title: Product Mock SAM Definition
type: Infrastructure Definition
description: AWS SAM desired-state definition for the mock product REST API.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
configuration_root: backend/product-mock.yaml
declared_resources:
  - GetProductFunction
  - GetProductsFunction
  - GetProductApiUrl
sources:
  - id: product-sam
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L69
relationships:
  - kind: part-of
    target: system:shopping-cart-application
    evidence: [product-sam]
    link: "[Shopping Cart Application](../systems/shopping-cart-application.md)"
  - kind: implemented-in
    target: repository:aws-serverless-shopping-cart
    evidence: [product-sam]
    link: "[aws-serverless-shopping-cart Repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Product Mock SAM Definition

This SAM template defines a regional mock product API with two Python 3.8 Lambda functions: one returns all products and one returns a product by identifier. It exports an API URL to SSM for the cart service configuration.

Related: [Shopping Cart Application](../systems/shopping-cart-application.md) and [Repository](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The URL expression and SSM parameter are definitions, not evidence that a product API has been deployed.
