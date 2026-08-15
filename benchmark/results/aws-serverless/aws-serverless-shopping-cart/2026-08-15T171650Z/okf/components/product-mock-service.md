---
title: Product Mock Service
description: Bare-bones serverless mock product catalog service.
type: Service
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: product-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L70
  - id: product-docs
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-template]
  - kind: provides
    target: interfaces/product-api
    evidence: [product-template]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-template]
---

# Product Mock Service

## Responsibility

Provides static mock product details for the sample application.

## Interfaces

- [Product REST API](../interfaces/product-api.md)

## Dependencies

Handlers are packaged from `product-mock-service/`; no persistent data store is evidenced.

## Operations

SAM config uses Python 3.8, a 5-second timeout, active tracing, and a `live` alias.

## Limitations

The README explicitly characterizes this as a bare-bones mock service.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [Product REST API](../interfaces/product-api.md)
- [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md)
