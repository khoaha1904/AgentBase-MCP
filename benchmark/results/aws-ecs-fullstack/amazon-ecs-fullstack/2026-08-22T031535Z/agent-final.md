Initial Ingest completed successfully. Finalized bundle copied byte-for-byte to [okf](<OUTPUT_ROOT>/okf).

Canonical identities:

- `domains/digital-experience`
- `repositories/amazon-ecs-fullstack-app-terraform`
- `systems/ecs-fullstack-demo`
- `components/demo-frontend`
- `components/demo-backend`
- `interfaces/backend-http-api`
- `flows/application-delivery-pipeline`

Embedded knowledge includes ECS/networking/load-balancing/autoscaling, DynamoDB product storage, S3 assets and pipeline artifacts, SNS notifications, IAM, ECR, CodeBuild, and CodeDeploy.

Partial limitations: Terraform proves desired state only; graph parsing was partial for task-definition/Dockerfile spans; no independently triggered Function was found; no deployment, account, region, ARN, URL, or current runtime values are asserted.

Questions: none.

Prepared proposal: `b25b22d948d76702180a6c4b` on `agentbase/okf-b25b22d948d76702180a6c4b`, phase `prepared`.