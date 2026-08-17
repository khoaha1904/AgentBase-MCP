---
title: Product Mock SAM Stack
description: AWS SAM desired-state definition for the mock product API and its two Lambda handlers.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
configuration_root: backend/product-mock.yaml
declared_resources:
  - GetProductFunction
  - GetProductsFunction
  - GetProductApiUrl
sources:
  - id: product-stack-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L69
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-stack-definition]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [product-stack-definition]
---

# Purpose

This SAM template defines the desired AWS resources for the mock product service.

# Configuration Root

`backend/product-mock.yaml` is an AWS SAM template with an `AllowedOrigin` input.

# Declared Architecture

It declares Lambda handlers for individual product and product-list retrieval, each exposed through API Gateway routes, plus an SSM parameter containing the computed API URL.

# Inputs and Outputs

`AllowedOrigin` configures CORS. The template outputs a computed Product API URL.

# Limitations

The output URL is a template expression, not evidence of a deployed API or SSM parameter.

## Relationships

The definition belongs to the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and is implemented in the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
