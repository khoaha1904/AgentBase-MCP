---
type: Repository
title: aws-serverless-shopping-cart
description: Source repository aws-serverless-shopping-cart
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T08:39:17.436Z
sources:
  - id: sem_readme_overview
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L1-L8
  - id: sem_cart_template
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shoppingcart-service.yaml#L21-L75
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/commerce
relationships:
  - kind: part-of
    target: domains/commerce
    evidence:
      - owner-domain
agentbase:
  repository:
    id: repository-aws-serverless-shopping-cart-50900082e8dc
    display_name: aws-serverless-shopping-cart
    aliases:
      remotes:
        - /tmp/ks-multiservice-candidates/aws-serverless-shopping-cart
      root_commits:
        - 0ef2bee11344ad04a93e1cd8d8d067925f48990e
---

# Purpose

Source repository aws-serverless-shopping-cart

Primary Domain: [Commerce](../domains/commerce.md).

# Canonical Knowledge

* [Shopping cart system](../components/shopping-cart-system.md) - Service
* [Shopping cart API surface](../interfaces/shopping-cart-api-surface.md) - Event
* [Product mock API surface](../components/product-mock-api-surface.md) - Service
