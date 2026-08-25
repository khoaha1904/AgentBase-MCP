---
type: Domain
title: Crawler
description: Crawler business domain
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: owner-domain
    resource: agentbase://owner-guidance/domains/crawler
  - id: sem-repo-purpose
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L13
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
---

# Purpose

Owner-confirmed business boundary for the crawler-related capability contributed by [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md). The current contribution covers a serverless data pipeline whose Glue crawlers populate the Data Catalog; it does not attempt to define the complete Domain.[^owner-domain][^sem-repo-purpose]

# Current Scope

* [ApiStateMachine](../flows/apistatemachine.md) is the critical repository-contributed flow.
* [serverless-data-pipelines-demo](../repositories/serverless-data-pipelines-demo.md) is the source contribution currently classified in this Domain.

# Limitations

The repository describes a broader data-lake pipeline. `Crawler` is retained as the owner-confirmed primary business classification, not inferred from the repository name or implementation.

[^owner-domain]: `agentbase://owner-guidance/domains/crawler`
[^sem-repo-purpose]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L11-L13`
