---
type: Repository
title: aws-serverless-shopping-cart
description: Source repository aws-serverless-shopping-cart
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:08:05.434Z
sources:
  - id: obs_system
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L1-L8
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

This repository contains a sample serverless shopping-cart application: a REST backend, a Vue frontend, and a separate mock product service [source](repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L1-L8).

Primary Domain: [Commerce](../domains/commerce.md).

# Canonical Knowledge

* [Shopping Cart Service](../components/shopping-cart-system.md) - Service
* [Product Mock Service](../components/product-api.md) - Service
* [Cart Deletion Queue](../resources/cart-delete-queue.md) - Queue

# Limitations

This is a bounded, source-only view. The templates describe desired infrastructure, not deployed accounts, regions, ARNs, endpoints, or runtime health. Authentication and the frontend are not independently modeled in this initial ingest.
