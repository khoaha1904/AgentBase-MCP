---
type: Repository
title: aws-serverless-shopping-cart
description: Source for a sample serverless shopping-cart capability with a Vue storefront and REST backend.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:31:26.461Z
sources:
  - id: obs_system
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L1-L4
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

This repository contains a sample shopping-cart capability. Its documented boundary includes a Vue frontend, a REST backend, authentication integration, and a mock product service.

Primary Domain: [Commerce](../domains/commerce.md).

# Boundaries and interactions

The source configuration groups cart operations behind one REST API and keeps product lookup in a separate mock service. Cart migration places deletion work on a queue; a separate stream-triggered worker maintains product quantity aggregates. The independently useful operational resources are linked below.

# Limitations

This is a source-based, explicitly partial record. Infrastructure templates describe desired configuration only; they do not establish deployed account, region, ARN, runtime values, or current health. The product service is a mock, and the README states that no real payment integration is present.

# Canonical Knowledge

* [Shopping-cart-table](../resources/shopping-cart-table.md) - persistent cart state, TTL, and stream source
* [Cart-delete-queue](../resources/cart-delete-queue.md) - asynchronous cart deletion transport
