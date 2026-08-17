---
title: AWS Serverless Shopping Cart source
description: Admitted source repository for the serverless shopping-cart sample.
type: Repository
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: repository-readme
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
  - id: repository-build
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/Makefile#L1-L44
---

# Purpose

This repository contains the shopping-cart sample's frontend, backend implementation, and SAM templates.

# Source Structure

`frontend/` contains the Vue client. `backend/shopping-cart-service/` and `backend/product-mock-service/` contain Lambda handlers. `backend/*.yaml` declares the SAM stacks.

# Build and Test

The root Makefile orchestrates backend deployment and frontend build. The backend Makefile uses `sam build`, `sam deploy`, `py.test`, and CloudFormation deletion commands.

# Canonical Knowledge

The repository implements the [Serverless Shopping Cart](../systems/serverless-shopping-cart.md), its service and API concepts, its documented flows, and its desired-state infrastructure definitions.

# Limitations

The repository's build commands derive account and region from local AWS credentials; they do not identify a deployed instance.
