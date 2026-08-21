Prepared refresh proposal `94021a37b34a85c0feb6e5a9` (local, reviewable).

Changed paths:

- `components/aha-health-alert-processor.md` — updated desired EventBridge schedule knowledge from one to five minutes, with exact Terraform evidence.
- `repositories/aws-health-aware.md` — refreshed observed-source commit metadata.

Retained uncertainty/limitations: Terraform reflects desired state only; deployment, enabled endpoints, and runtime configuration remain unverified. Existing limitations on secondary-region/CloudFormation coverage and retry/DLQ behavior were retained.

Questions: none. Validation and grouped proposal review passed.