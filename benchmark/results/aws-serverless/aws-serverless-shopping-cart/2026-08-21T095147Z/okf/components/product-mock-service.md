---
type: Service
title: Product mock service
description: Mock product REST service providing product collection and item retrieval
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:53:15.479Z
sources:
  - id: s2
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L82-L89
  - id: s4
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/product-mock.yaml#L33-L56
relationships:
  - kind: implemented-in
    target: repositories/aws-serverless-shopping-cart
    evidence:
      - s2
---

# Responsibility

This is the repository's documented bare-bones mock product service. It configures HTTP handlers for listing products and retrieving one product by identifier.

# Interfaces

The documented contracts are `GET /product` and `GET /product/{product_id}`.

# Dependencies

The implementation is contained in [this repository](../repositories/aws-serverless-shopping-cart.md). The source does not independently establish an owner or a deployed service instance.

# Operations

The YAML is desired-state configuration only. No live endpoint, deployment, or runtime values are asserted.
