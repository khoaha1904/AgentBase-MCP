Prepared bundle copied to [`okf`](<OUTPUT_ROOT>/okf).

Canonical identities:

- `domains/health-operations`
- `repositories/aws-health-aware`
- `components/health-alert-processor`

Partial limitations: deployment templates do not prove live account, region, ARN, schedules, or endpoint values; notification configuration is secret-backed; no provider-neutral System or database-table role was selected by the schema guidance.

Questions:

- Which deployment(s), if any, are authoritative for current runtime topology and notification destinations?

Prepared proposal: `6bc4e439253a8ab0bf6cb120` (prepared, not accepted). The inspection connector rejected its documented parameter and then rejected the required alternate parameter, so no successful inspection result was available.