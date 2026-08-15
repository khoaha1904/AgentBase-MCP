---
title: AWS Serverless Shopping Cart repository
description: Source repository for the sample serverless shopping-cart application.
type: Repository
status: draft
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T07:58:00Z
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
relationships:
  - kind: documents
    target: systems/serverless-shopping-cart
  - kind: implements
    target: components/shopping-cart-service
  - kind: implements
    target: components/product-mock-service
---

# Purpose

This repository contains a sample AWS serverless shopping-cart application. It includes a Vue.js frontend, a shopping-cart backend, a mock products service, and a separately templated authentication concern.

# Source Structure

The backend SAM templates and Python handlers are under `backend/`; the Vue application is under `frontend/`. Backend build and deployment are driven through Make targets, while `amplify.yml` describes a hosted build configuration.

# Canonical Knowledge

The repository documents the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md), including the [shopping cart service](../components/shopping-cart-service.md) and [product mock service](../components/product-mock-service.md).

# Limitations

The admitted source describes a separate authentication template, but this bundle does not model it as a canonical component because its detailed boundary was not investigated.
