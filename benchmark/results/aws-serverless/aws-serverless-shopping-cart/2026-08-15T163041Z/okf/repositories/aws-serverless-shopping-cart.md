---
type: Repository
title: aws-serverless-shopping-cart
description: Pinned source repository for the AWS serverless shopping-cart sample.
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-15T00:00:00Z
sources:
  - id: readme-overview
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
  - id: readme-running
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L91-L160
---

# Purpose

This repository contains the sample's Vue frontend, Python Lambda handlers, and AWS SAM templates.

# Source Structure

`frontend/` contains the Vue application and Amplify client calls. `backend/shopping-cart-service/` contains cart handlers, while `backend/product-mock-service/` contains a bare-bones product API. The three SAM roots are `backend/auth.yaml`, `backend/product-mock.yaml`, and `backend/shoppingcart-service.yaml`.

# Build and Test

The documented `make backend` path deploys the authentication, product mock, and shopping-cart CloudFormation stacks. `make frontend-serve` retrieves backend configuration from SSM and starts the frontend locally. Python 3.8+, SAM CLI, AWS CLI, boto3, and yarn are documented requirements.

# Canonical Knowledge

The canonical application model is [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), with its interfaces, runtime components, resources, flows, and desired-state infrastructure linked from that system.

# Limitations

No commit hash, repository remote, CI execution, test result, or deployed environment is evidenced by the supplied source.
