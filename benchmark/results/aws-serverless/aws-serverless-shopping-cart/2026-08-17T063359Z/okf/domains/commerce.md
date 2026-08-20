---
title: Commerce
description: Owner-confirmed domain for shopping-cart behavior.
type: Domain
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: owner-guidance-commerce
    resource: agentbase://owner-guidance/domains/commerce
agentbase:
  relationships: []
---

# Purpose

Commerce is the owner-confirmed business domain for the shopping-cart system.

# Vocabulary

The system uses carts, products, anonymous carts, logged-in carts, checkout, and cart totals.

# Boundaries

This classification is owner guidance; it does not assert ownership of any deployed AWS account or service.

# Systems

* [Serverless Shopping Cart](../systems/serverless-shopping-cart.md)
* [Cart Migration and Cleanup](../flows/cart-migration-and-cleanup.md)
* [Cart-total Projection](../flows/cart-total-projection.md)

# Limitations

The source is a sample implementation and does not establish a broader enterprise commerce boundary.
