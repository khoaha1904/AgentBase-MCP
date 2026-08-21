---
type: Database Table
title: Shopping-cart-table
description: Persistent cart items and aggregate quantities, with stream and expiration behavior.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-21T11:31:26.461Z
sources:
  - id: obs_cart_table
    resource: repository://repository-aws-serverless-shopping-cart-50900082e8dc/backend/shoppingcart-service.yaml#L373-L391
agentbase:
  technology:
    - AWS
---

# Purpose

Stores cart items and aggregate quantities using a composite key. The declared configuration enables item expiration and publishes old and new images to a change stream.

# Interactions

The aggregate worker is configured to consume this table's stream, while cart handlers are granted read and write access in the same template. This document does not represent a deployed table.

# Limitations

Suggested type `Database Table` is evidence-bound agent intent and requires proposal review.

The template does not evidence a current table name, account, region, stream ARN, item contents, or deployed configuration.
