---
title: Commerce
description: Owner-confirmed commerce business domain.
type: Domain
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/commerce
---

# Commerce

## Purpose

The owner classifies the shopping-cart system in the Commerce domain.

## Vocabulary

Cart, product, anonymous cart, logged-in user, checkout, and aggregate quantity.

## Boundaries

This classification is owner guidance; it does not assert that every adjacent product or payment concern is implemented here.

## Systems

- [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)

## Relationships

- `provides`: [Serverless Shopping Cart](../systems/serverless-shopping-cart.md) (source: owner-domain)

## Limitations

Owner guidance establishes the domain, while repository evidence establishes the implementation boundaries.
