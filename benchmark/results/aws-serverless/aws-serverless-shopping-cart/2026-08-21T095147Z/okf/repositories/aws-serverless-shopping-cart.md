---
type: Repository
title: aws-serverless-shopping-cart
description: Source repository for a sample serverless shopping-cart application
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T09:53:15.479Z
sources:
  - id: s0
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L1-L8
  - id: s1
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/README.md#L54-L80
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

This repository contains a sample serverless shopping-cart application. Its documented scope includes a cart REST interface, anonymous-to-authenticated cart migration, cart checkout, and an aggregated cart-product view.

Primary Domain: [Commerce](../domains/commerce.md).

# Boundaries and limitations

The repository also contains a Vue frontend, authentication template, and a mock product service. This initial ingest promotes only the two documented backend service boundaries that have independent navigation value. Infrastructure configuration is desired state only; it does not establish a deployed account, region, endpoint, ARN, or live runtime configuration.

# Canonical Knowledge

* [Shopping cart service](../components/shopping-cart-service.md) - Service
* [Product mock service](../components/product-mock-service.md) - Service
