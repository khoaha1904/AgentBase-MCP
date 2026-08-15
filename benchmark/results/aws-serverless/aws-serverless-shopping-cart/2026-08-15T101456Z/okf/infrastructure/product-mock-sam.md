---
title: Product Mock SAM Definition
description: AWS SAM/CloudFormation root definition for the mock product API.
type: Infrastructure Definition
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
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
  - kind: defines
    target: interfaces/product-api
---
# Product Mock SAM Definition

## Purpose

`backend/product-mock.yaml` is the root desired-state definition for the mock product service. It declares Lambda-backed API routes for a product collection and an individual product.

## Configuration Root

The template applies Python 3.8 function globals, tracing, a live alias, and CORS configuration based on an allowed-origin parameter.

## Declared Architecture

It defines the [Product API](../interfaces/product-api.md) implemented by the [Product Mock Service](../components/product-mock-service.md), and writes its endpoint URL to an SSM parameter.

## Limitations

It declares configuration rather than a deployment instance; no supplied allowed origin or deployed endpoint is evidenced.
