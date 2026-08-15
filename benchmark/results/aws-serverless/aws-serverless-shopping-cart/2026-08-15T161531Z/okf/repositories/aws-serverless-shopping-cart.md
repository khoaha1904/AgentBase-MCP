---
title: aws-serverless-shopping-cart Repository
type: Repository
description: Source repository for the serverless shopping-cart sample.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-overview
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
  - id: build-orchestration
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/Makefile#L1-L46
---

# aws-serverless-shopping-cart Repository

This repository implements the shopping-cart sample. It separates Vue frontend source in `frontend/` from backend Python handlers and SAM templates in `backend/`.

## Build and Test

The root Makefile builds the frontend and deploys three backend templates: authentication, product mock, and shopping cart. It also exposes backend tests.

## Canonical Knowledge

* [Shopping Cart Application](../systems/shopping-cart-application.md) - canonical system.
* [Shopping Cart SAM Definition](../infrastructure/shopping-cart-sam.md) - cart infrastructure source.
* [Product Mock SAM Definition](../infrastructure/product-mock-sam.md) - mock product infrastructure source.
* [Authentication SAM Definition](../infrastructure/authentication-sam.md) - authentication infrastructure source.

# Limitations

Repository configuration describes deployable templates but does not prove any particular AWS account, region, deployed stack, endpoint, or runtime instance.
