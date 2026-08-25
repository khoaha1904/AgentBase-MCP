---
type: Flow
title: ApiStateMachine
description: Navigate the orchestration sequence across sourcing, crawlers, ETL, analytics, and reporting.
status: draft
generated:
  by: agentbase/0.0.0
  at: 2026-08-25T16:25:31.319Z
sources:
  - id: sem-repo-architecture
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L18-L40
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
  - id: tf-step-function
    resource: repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230
    observed_revision: 1483d3869ecc148195bce092900d8556332db609
flow_steps:
  - order: 1
    source: components/api-sourcing
    action: delivers
    target: components/glue-crawler-initiation
    mode: synchronous
    evidence:
      - tf-step-function
  - order: 2
    source: components/api-sourcing
    action: delivers
    target: components/apiscript
    mode: synchronous
    evidence:
      - tf-step-function
  - order: 3
    source: components/apiscript
    action: delivers
    target: components/glue-crawler-initiation
    mode: synchronous
    evidence:
      - tf-step-function
  - order: 4
    source: components/glue-crawler-initiation
    action: delivers
    target: components/athena-query-execution
    mode: synchronous
    evidence:
      - tf-step-function
  - order: 5
    source: components/glue-crawler-initiation
    action: delivers
    target: components/comprehend-analysis
    mode: synchronous
    evidence:
      - tf-step-function
agentbase:
  technology:
    provider: aws
    sourceTool: terraform
    resourceType: aws_sfn_state_machine
---

# Purpose

`ApiStateMachine` coordinates API ingestion, Glue catalog crawling, ETL, reporting-query creation, and entity analysis across independently deployed workloads.[^tf-step-function]

# Trigger

Terraform declares a CloudWatch Events schedule and target for the state machine. The schedule is disabled in the observed source, while a manual input is exported.[^tf-step-function]

# Outcome

The flow sources product pages into the landing zone, refreshes catalog metadata around the ETL stages, and runs reporting and Comprehend analysis branches.[^tf-step-function][^sem-repo-architecture]

# Flow

The state machine repeatedly invokes [Api_Sourcing](../components/api-sourcing.md) until paging is complete. It then invokes [Glue_crawler_initiation](../components/glue-crawler-initiation.md), runs [ApiScript](../components/apiscript.md), refreshes later catalog layers, and invokes [Athena_query_execution](../components/athena-query-execution.md) and [Comprehend_analysis](../components/comprehend-analysis.md) in the derived stage.[^tf-step-function]

# Failure and Recovery

The observed definition retries Lambda service failures with backoff, applies bounded retries to timeout-like failures, and uses synchronous Glue job execution before continuing.[^tf-step-function]

# Limitations

Suggested type `Flow` is evidence-bound agent intent and requires proposal review.

The Terraform declaration does not prove a currently deployed state machine. The ordered steps summarize the independently useful concept interactions; repeated crawler invocations and internal choice/parallel states remain in the source definition.

# Embedded Knowledge

| Name | Role | Kind | Technology | Exact sources |
|---|---|---|---|---|
| landing/trusted/analytics S3 zones | Understand the pipeline's embedded storage and catalog state. | object-storage | aws / s3; terraform:aws_s3_bucket | tf-s3-bucket: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/s3_bucket/main.tf#L1-L15`<br>sem-data-storage: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L18-L32` |
| scheduled ApiStateMachine trigger | Understand how the orchestration can be scheduled. | resource | aws; terraform:aws_cloudwatch_event_rule | tf-schedule: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L232-L238` |

[^sem-repo-architecture]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/README.md#L18-L40`
[^tf-step-function]: `repository://repository-serverless-data-pipelines-demo-95c2a8f15f93/step_fn.tf#L9-L230`
