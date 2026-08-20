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
The scenario must show:

1. repository/Domain preflight and confirmation evidence;
2. one bounded graph/evidence round;
3. qualified candidates with exact source references;
4. generic `Function`, `Queue` and `Server` recommendations with AWS/Terraform
   profile provenance;
5. one valid proposal inspection marked partial when coverage is limited;
6. zero Accept, submit, synchronize, provider CLI or network operations.

## Canonical repository gate

```sh
npm run verify
```

Expected outcome: specification, type, dependency architecture, dead-code,
redacted-secret, offline tests and diff checks all pass.

## Optional real qualification

Do not run automatically. After the owner confirms a usable agent account and
authorizes the benchmark, run the repository's opt-in OKF benchmark three times
against the accepted representative repository. Record validity, reviewability,
elapsed time, limitations and correction count. Qualification requires three
valid previews and median elapsed time no greater than 10 minutes; it never
publishes or rebuilds a Hub PR.
