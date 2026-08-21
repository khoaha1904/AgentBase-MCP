---
type: Repository
title: aws-serverless-shopping-cart
description: Source repository for a serverless shopping-cart sample.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T07:20:49.729Z
sources:
  - id: sem_system
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

This repository contains a sample serverless shopping-cart application. Its backend exposes a REST API and its Vue frontend uses an SDK for authentication and API communication. [src: sem_system]

Primary Domain: [Commerce](../domains/commerce.md).

# Canonical Knowledge

* [Shopping Cart System](../components/shopping-cart-system.md) - Service

# Limitations

This repository is a source boundary, not evidence of a deployed environment. Its templates do not establish current accounts, regions, ARNs, endpoints, or runtime values.
