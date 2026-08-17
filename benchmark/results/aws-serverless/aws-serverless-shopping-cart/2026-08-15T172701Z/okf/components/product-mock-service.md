---
title: Product Mock Service
description: Mock serverless product catalog service that returns one product or the complete static product list.
type: Service
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: product-service-definition
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L1-L69
  - id: product-service-behavior
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L82-L89
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-service-behavior]
  - kind: provides
    target: interfaces/product-api
    evidence: [product-service-definition]
  - kind: declared-by
    target: infrastructure/product-mock-sam-stack
    evidence: [product-service-definition]
  - kind: implemented-in
    target: repositories/repository-aws-serverless-shopping-cart-708d65caf454
    evidence: [product-service-definition]
---

# Responsibility

The product mock service exposes a fixed product list and individual product lookup for the shopping-cart sample.

# Interfaces

It provides the [Product API](../interfaces/product-api.md), with `GET /product` and `GET /product/{product_id}` handlers.

# Dependencies

The service reads its local `product_list.json` file. The cart service calls its single-product endpoint to validate and retrieve product details during cart updates.

# Operations

The SAM template sets active tracing, Python 3.8, 256 MB memory, and a five-second default function timeout. It configures CORS from the supplied allowed origin.

# Limitations

This is explicitly a bare-bones mock service; no durable catalog store, authentication policy, or deployed endpoint is evidenced.

## Relationships

The service is part of the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), provides the [Product API](../interfaces/product-api.md), and is declared by the [Product Mock SAM Stack](../infrastructure/product-mock-sam-stack.md). Its source is the [repository](../repositories/repository-aws-serverless-shopping-cart-708d65caf454.md).
