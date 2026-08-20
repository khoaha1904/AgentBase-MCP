---
title: aws-serverless-shopping-cart
description: Pinned source repository for the serverless shopping-cart sample.
type: Repository
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-17T00:00:00Z
sources:
  - id: repository-readme
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
---

# Purpose

This repository contains the sample's frontend, backend handlers, and AWS SAM templates.

# Source Structure

`frontend/` contains the Vue client. `backend/shopping-cart-service/` and `backend/product-mock-service/` contain handlers; `backend/*.yaml` declares desired AWS resources.

# Build and Test

The README documents building and deploying backend stacks with `make backend`.

# Canonical Knowledge

The repository implements the [Serverless Shopping Cart system](../systems/serverless-shopping-cart.md), its components, interfaces, flows, and infrastructure definitions.

# Limitations

No CI execution, deployed runtime, or production ownership evidence was inspected.
