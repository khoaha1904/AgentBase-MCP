---
type: Flow
title: Scheduled API Data Pipeline
description: Adds independent navigation and impact value for the end-to-end scheduled processing sequence.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-24T15:21:16.293Z
sources:
  - id: sem-flow-definition
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230
  - id: res-pipeline-state-machine
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230
  - id: doc-schedule-activation
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L62-L69
  - id: config-schedule-activation
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L232-L238
flow_steps:
  - order: 1
    source: systems/serverless-data-pipeline
    action: invokes
    target: components/api-sourcing
    mode: synchronous
    evidence:
      - sem-flow-definition
  - order: 2
    source: systems/serverless-data-pipeline
    action: invokes
    target: components/glue-crawler-initiation
    mode: synchronous
    evidence:
      - sem-flow-definition
  - order: 3
    source: systems/serverless-data-pipeline
    action: invokes
    target: components/api-glue-etl
    mode: synchronous
    evidence:
      - sem-flow-definition
  - order: 4
    source: systems/serverless-data-pipeline
    action: invokes
    target: components/athena-query-execution
    mode: synchronous
    evidence:
      - sem-flow-definition
  - order: 5
    source: systems/serverless-data-pipeline
    action: invokes
    target: components/comprehend-analysis
    mode: synchronous
    evidence:
      - sem-flow-definition
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_sfn_state_machine
  observed_values:
    - id: AB-OBS-46e9d8520f2bcbddb3b93954
      subject: flows/scheduled-api-data-pipeline
      property: schedule.activation
      role: documentation
      value: runs on a CRON schedule
      source_id: doc-schedule-activation
      observed:
        commit: 1483d3869ecc148195bce092900d8556332db609
        dirty: false
        dirty_digest: null
        at: 2026-08-24T15:21:16.293Z
    - id: AB-OBS-cc93aa8fd955030837cf6f7b
      subject: flows/scheduled-api-data-pipeline
      property: schedule.activation
      role: configuration
      value: disabled
      source_id: config-schedule-activation
      observed:
        commit: 1483d3869ecc148195bce092900d8556332db609
        dirty: false
        dirty_digest: null
        at: 2026-08-24T15:21:16.293Z
relationships:
  - kind: part-of
    target: systems/serverless-data-pipeline
    evidence:
      - sem-flow-definition
---

# Purpose

This Step Functions flow pages the source API, then coordinates cataloging, ETL, view creation, entity analysis, and final catalog refreshes across the independently deployed workloads.[^sem-flow-definition][^res-pipeline-state-machine]

It is part of the [Serverless Data Pipeline](../systems/serverless-data-pipeline.md) and coordinates [API Sourcing](../components/api-sourcing.md), [Glue Crawler Initiation](../components/glue-crawler-initiation.md), [API Glue ETL](../components/api-glue-etl.md), [Athena Query Execution](../components/athena-query-execution.md), and [Comprehend Analysis](../components/comprehend-analysis.md).

# Trigger and outcome

The README describes cron execution and manual test input, while Terraform declares the CloudWatch event rule disabled.[^doc-schedule-activation][^config-schedule-activation] When started, the flow is intended to populate landing, trusted, and analytics data layers and their catalogs.

# Flow

After API pagination completes, landing-zone crawling and Glue ETL execute in parallel. The ETL branch then crawls the trusted zone and starts parallel Athena-view and Comprehend-analysis branches; the latter finishes by crawling the analytics zone.[^sem-flow-definition]

# Failure and recovery

The state machine supplies per-task timeouts and bounded retry policies. Lambda service failures generally use exponential backoff, while timeout retry counts vary by task.[^sem-flow-definition]

# Limitations

Suggested type `Flow` is evidence-bound agent intent and requires proposal review.

The ordered `flow_steps` summarize orchestrator-to-workload invocations; they do not flatten the parallel branch semantics described above. The schedule activation conflict requires maintainer resolution, and source configuration does not prove any current executions.

[^sem-flow-definition]: [`step_fn.tf` lines 9-230](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230)
[^res-pipeline-state-machine]: [`step_fn.tf` lines 9-230](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230)
[^doc-schedule-activation]: [`README.md` lines 62-69](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L62-L69)
[^config-schedule-activation]: [`step_fn.tf` lines 232-238](repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L232-L238)

<!-- agentbase:observed-values:start -->
## Observed values

| Property | Observed value | Role | Source | Observed at |
|---|---:|---|---|---|
| `schedule.activation` | `"runs on a CRON schedule"` | documentation | `README.md#L62-L69` | 1483d3869ecc148195bce092900d8556332db609, 2026-08-24T15:21:16.293Z |
| `schedule.activation` | `"disabled"` | configuration | `step_fn.tf#L232-L238` | 1483d3869ecc148195bce092900d8556332db609, 2026-08-24T15:21:16.293Z |
<!-- agentbase:observed-values:end -->