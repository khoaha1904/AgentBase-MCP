---
title: AWS Serverless Shopping Cart Repository
description: Source repository for the serverless shopping-cart sample.
type: Repository
status: draft
generated:
  by: agentbase/0.2
  at: "2026-08-15T00:00:00Z"
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
relationships:
  - kind: documents
    target: systems/shopping-cart
  - kind: contains
    target: infrastructure/shopping-cart-sam
  - kind: contains
    target: infrastructure/product-mock-sam
---
# Purpose

This repository implements an AWS serverless shopping-cart sample with a Vue frontend. It also includes a deliberately bare-bones mock product service and separate authentication infrastructure.

# Source Structure

The frontend uses AWS Amplify for authentication and API communication. Backend desired state is split into SAM templates for the shopping cart, product mock service, and authentication resources.

# Build and Test

Build and test commands are not captured here because the reviewed evidence establishes the repository role and architecture, not a verified command outcome.

# Canonical Knowledge

It documents the [Shopping Cart System](../systems/shopping-cart.md), its two services, their HTTP interfaces, and the documented asynchronous behaviors.

# Relationships

[systems/shopping-cart](../systems/shopping-cart.md)
[infrastructure/shopping-cart-sam](../infrastructure/shopping-cart-sam.md)
[infrastructure/product-mock-sam](../infrastructure/product-mock-sam.md)
