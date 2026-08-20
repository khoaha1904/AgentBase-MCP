---
title: Product-mock SAM Desired State
description: AWS SAM root template declaring the mock product API and two Lambda handlers.
type: Infrastructure Definition
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: product-sam-root
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L69
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-sam-root]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-sam-root]
---

# Purpose

This SAM template defines desired state for the mock product API and handlers.

# Configuration Root

The configuration root is `backend/product-mock.yaml`.

# Declared Architecture

It declares GET `/product` and GET `/product/{product_id}` Lambda-backed operations and an SSM parameter/output for the API URL.

# Inputs and Outputs

The template exposes the product API URL as desired-state output; no deployed endpoint is evidenced.

# Related Concepts

This definition is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The template describes a mock service only and does not prove an existing AWS deployment.
