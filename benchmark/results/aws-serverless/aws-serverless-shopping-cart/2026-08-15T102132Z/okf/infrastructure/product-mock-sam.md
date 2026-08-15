---
title: Product Mock SAM Definition
description: Root SAM desired-state configuration for the mock product service.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
configuration_root: backend/product-mock.yaml
declared_resources:
  - GetProductFunction
  - GetProductsFunction
  - GetProductApiUrl
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L69
relationships:
  - kind: declares
    target: components/product-mock-service
---
# Purpose

This SAM root declares desired state for the mock product API and its two Lambda handlers.

# Configuration Root

`backend/product-mock.yaml` is a SAM template whose allowed-origin parameter configures CORS.

# Declared Architecture

It declares the [Product Mock Service](../components/product-mock-service.md), including the `GET /product` and `GET /product/{product_id}` routes of the [Product API](../interfaces/product-api.md).

# Inputs and Outputs

The template accepts an allowed origin, publishes the product API URL to SSM, and outputs that endpoint.

# Limitations

This desired-state definition is not evidence of a deployed stack or endpoint.

# Relationships

[components/product-mock-service](../components/product-mock-service.md)
