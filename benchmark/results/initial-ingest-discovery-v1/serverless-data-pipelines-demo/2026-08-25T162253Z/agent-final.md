Ingest completed successfully. The exact finalized bundle is at [okf](<OUTPUT_ROOT>/okf).

- Proposal: `04097449c24838f1780056b0`
- Subject: `repositories/serverless-data-pipelines-demo`
- Domain: `domains/crawler` — Crawler
- Source revision: `1483d3869ecc148195bce092900d8556332db609`
- Status: validated, inspected, reviewable; not accepted or published

Concepts include the Repository, Crawler Domain, `ApiStateMachine` Flow, four Lambda Functions, and the `ApiScript` Glue Component.

Embedded knowledge covers:

- Landing/trusted/analytics S3 zones
- Landing/trusted/analytics Glue crawlers
- Scheduled state-machine trigger

One open Question asks maintainers to confirm operational ownership; CI evidence proves Terraform validation/planning but not production deployment responsibility.

Coverage is intentionally partial: 20 graph-skipped files, 23 recorded coverage gaps, incomplete Scala implementation coverage, and deferred IAM/KMS/logging/Athena infrastructure details. The broader pipeline scope versus the owner-confirmed Crawler Domain remains visibly documented.