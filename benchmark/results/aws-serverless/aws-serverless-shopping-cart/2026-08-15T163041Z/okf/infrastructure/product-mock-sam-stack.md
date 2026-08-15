---
type: Infrastructure Definition
title: Product Mock SAM Stack
description: AWS SAM desired-state definition for the mock product API.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
configuration_root: backend/product-mock.yaml
declared_resources: "GetProductFunction, GetProductsFunction, implicit ServerlessRestApi, and GetProductApiUrl SSM parameter"
sources:
  - id: product-sam
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L68
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-sam]
    link: "[Serverless Shopping Cart](../systems/serverless-shopping-cart.md)"
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-sam]
    link: "[aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md)"
---

# Purpose

Defines desired AWS resources for the mock product REST service.

# Configuration Root

`backend/product-mock.yaml` is an AWS SAM template taking an allowed CORS origin input.

# Declared Architecture

It defines two Lambda handlers and API events for single-product and product-list retrieval. Template globals specify a regional API with tracing, Python 3.8 functions, and CORS.

# Inputs and Outputs

It writes the computed API URL to the `/serverless-shopping-cart-demo/products/products-api-url` SSM parameter and outputs the same computed value.

# Limitations

The template's calculated URL is desired state, not evidence that the endpoint exists. It does not prove a deployment, account, region, API identifier, or parameter value.

Related: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and [aws-serverless-shopping-cart repository](../repositories/aws-serverless-shopping-cart.md).
