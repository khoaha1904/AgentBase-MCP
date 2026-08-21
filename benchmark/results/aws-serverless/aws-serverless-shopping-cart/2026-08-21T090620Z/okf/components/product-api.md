---
type: Service
title: Product Mock Service
description: Sample product lookup service used to demonstrate the shopping-cart application.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:08:05.434Z
sources:
  - id: obs_product_api
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/product-mock.yaml#L33-L56
  - id: readme_product_mock
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L6-L8
relationships:
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence:
      - obs_product_api
agentbase:
  technology:
    - AWS
---

# Responsibility

This sample service is implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md) and is included to demonstrate the application rather than a payment integration [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L6-L8).

# Interfaces

The desired-state template binds GET `/product/{product_id}` and GET `/product` to separate handlers [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/product-mock.yaml#L33-L56).

# Dependencies

The repository documents this as a bare-bones mock products service [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L6-L8).

# Operations

The template does not prove a deployed endpoint or production ownership.
