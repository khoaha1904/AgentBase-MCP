Created and validated the OKF bundle in [okf](<OUTPUT_ROOT>/okf).

Concept keys:

- `aha-deployment-terraform-module`
- `aha-lambda-schedule`
- `aha-primary-region-lambda`
- `aha-single-region-dynamodb-table`
- `aha-global-dynamodb-table`

Limitations recorded: secondary-region Lambda/schedule are conditional and not separate concepts; notification destinations are deployment inputs/secrets, not repository-owned concrete resources.