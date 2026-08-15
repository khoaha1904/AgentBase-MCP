---
title: aws-serverless-shopping-cart
description: Source repository for the Serverless Shopping Cart sample.
type: Repository
status: draft
generated:
  by: agentbase/5.0.0
  at: 2026-08-16T00:00:00Z
sources:
  - id: repository-readme
    resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
---

# aws-serverless-shopping-cart

## Purpose

This repository implements the sample system's frontend, Lambda handlers, SAM templates, and deployment scripts.

## Source Structure

`frontend/` holds the Vue application; `backend/shopping-cart-service/` and `backend/product-mock-service/` hold Python handlers; `backend/*.yaml` hold SAM templates.

## Build and Test

The README requires Python 3.8+ and Yarn, and documents local frontend execution and SAM-based backend deployment.

## Canonical Knowledge

The repository is the source of code and desired-state infrastructure claims in this bundle.

## Limitations

Repository contents do not prove a deployed environment.
