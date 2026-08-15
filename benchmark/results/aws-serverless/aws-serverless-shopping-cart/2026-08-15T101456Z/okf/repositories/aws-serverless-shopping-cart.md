---
title: AWS Serverless Shopping Cart Repository
description: Source repository for the serverless shopping-cart sample.
type: Repository
generated:
  by: agentbase/4.0.0
  at: 2026-08-15T00:00:00Z
status: draft
sources:
  - resource: repository://repository-aws-serverless-shopping-cart-708d65caf454/README.md#L1-L8
relationships:
  - kind: documents
    target: systems/serverless-shopping-cart
---
# AWS Serverless Shopping Cart Repository

## Purpose

This repository contains a sample shopping-cart application implemented with AWS serverless services and a Vue.js frontend. The source root separates backend SAM templates and Lambda code from the frontend application.

## Source Structure

The `backend/` directory contains the cart, mock-product, and authentication templates; `frontend/` contains the Vue client. The repository's Make targets build and deploy the backend and run the frontend locally.

## Canonical Knowledge

It documents the [Shopping Cart System](../systems/serverless-shopping-cart.md), its services, interfaces, resources, and desired-state infrastructure definitions. It is not itself the system boundary.

## Limitations

The repository provides deployment instructions but does not evidence a particular deployed instance.
