---
title: Product REST API
description: Mock product catalog HTTP surface.
type: API Surface
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: product-template
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/backend/product-mock.yaml#L33-L70
relationships:
  - kind: part-of
    target: systems/serverless-shopping-cart
    evidence: [product-template]
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence: [product-template]
---

# Product REST API

## Purpose

Exposes mock product listings and individual product details.

## Consumers

The frontend fetches `/product`; cart handlers receive a configured product-service URL.

## Authentication

No API authorizer is evidenced in the product SAM template.

## Operations

`GET /product` and `GET /product/{product_id}`.

## Failure Behavior

No common failure contract is documented.

## Limitations

This is a mock service and does not establish a production catalog contract.

## Relationship Links

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
- [aws-serverless-shopping-cart](../repositories/aws-serverless-shopping-cart.md)
