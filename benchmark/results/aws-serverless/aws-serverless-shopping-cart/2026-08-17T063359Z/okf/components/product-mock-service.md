---
title: Product Mock Service
description: Bare-bones serverless product service that returns product data for the sample frontend.
type: Service
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: product-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L34-L69
  - id: readme-product-service
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L6-L8
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [readme-product-service]
  - kind: provides
    target: interfaces/product-api
    evidence: [product-template]
  - kind: declared-by
    target: infrastructure/product-mock-sam
    evidence: [product-template]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-template]
---

# Responsibility

This mock service returns all products or one product to support the sample application.

# Interfaces

It provides [Product API](../interfaces/product-api.md).

# Dependencies

Product data is local to the repository's mock-service implementation; no durable external product system is evidenced.

# Operations

Two API-triggered Lambda handlers are declared in its SAM template.

# Related Concepts

This service is part of [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), declared by [Product-mock SAM desired state](../infrastructure/product-mock-sam.md), and implemented in [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md).

# Limitations

The README explicitly characterizes this as a bare-bones mock. No production product catalog, deployment, or consumer beyond the sample client is evidenced.
