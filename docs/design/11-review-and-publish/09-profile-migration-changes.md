# 11.09 — Profile migration publication changes

> Status: The boundary is designed and deferred until Published knowledge needs migration.

## Outcome

A semantic detector/provider-profile change does not rewrite the Published Hub
automatically. An MCP impact scan creates a Migration Draft for owner review and
a migration pull request.

## When migration is required

- Documentation or additive mapping that does not change Published meaning: no migration.
- A mapping change that can alter schema/disposition/technology interpretation
  of Published knowledge: migration is required.
- A catalog/profile that never produced Published knowledge: a clean cutover is
  allowed; do not build a converter solely for historical local artifacts.

## Migration unit

- exact Published base, old/new catalog-detector-profile versions;
- bounded affected concept identities and source/evidence references;
- Added/Updated/Removed changes with Questions/Limitations;
- one atomic Migration Draft → review → Accept → one PR to `main`.

Missing evidence does not reclassify or delete a concept automatically. Retain
current knowledge and create a Question for Refresh/Domain Enrichment. Migration
does not scan/rewrite foreign open-world OKF types outside AgentBase profile authority.

## Deferred implementation impact

MVP Catalog 7 has no Published predecessor requiring migration. Do not implement
an impact scanner, converter, dual read/write or migration command before a real
profile upgrade creates the need. At that point this is a separate Full Feature
because it may modify many Published concepts and requires recovery/compatibility review.
