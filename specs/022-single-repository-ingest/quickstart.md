# Quickstart Validation: Single-Repository Initial Ingest

## Prerequisites

- Node.js 24 and installed lockfile dependencies.
- Existing offline fixture repositories and disposable Hub fixtures.
- No cloud login, network access or model account for canonical validation.

## Focused validation

Run the focused tests added by the capability:

```sh
node --test \
  src/core/knowledge/schemas/catalog.test.ts \
  src/core/knowledge/schemas/guidance.test.ts \
  src/core/knowledge/governance/repository-identity.test.ts \
  src/core/knowledge/governance/live-claims.test.ts \
  src/app/repository-okf/workflow/initial-ingest.test.ts \
  src/app/codebase-memory-mcp/okf-schema-tools.test.ts \
  src/app/hub-okf/authoring/initial-ingest.test.ts \
  scripts/checks/check-skills.test.mjs
```

Expected outcome: generic catalog/profile, identity, snapshot, partial/failure
and skill boundaries pass without source or remote mutation.

## End-to-end offline scenario

Use a disposable Hub plus the representative application/Terraform fixture.
Terragrunt is covered by the same source-truth contract; SAM/CloudFormation is
outside the MVP.
The scenario must show:

1. repository/Domain preflight and confirmation evidence;
2. one bounded graph/evidence round;
3. qualified candidates with exact source references;
4. a generic `Function` recommendation plus embedded queue/data/hosting
   knowledge with AWS/Terraform-family profile provenance;
5. one valid proposal inspection marked partial when coverage is limited;
6. zero Accept, submit, synchronize, provider CLI or network operations.

## Canonical repository gate

```sh
npm run verify
```

Expected outcome: specification, type, dependency architecture, dead-code,
redacted-secret, offline tests and diff checks all pass.

## Optional real qualification

Do not run automatically. The owner has authorized the recorded V15 runs
after the catalog-7 offline gate passes. Record validity, reviewability, elapsed
time, standalone concepts, embedded knowledge, limitations and correction
count. Do not add a replacement run, publish or rebuild a Hub PR.
