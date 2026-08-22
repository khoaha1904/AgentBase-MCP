# Verification: Registry-less Hub CI

## Result

Complete. A new Hub and an existing-Hub CI PR receive the same workflow,
standalone validator and manifest. The workflow pins and verifies the validator
checksum before execution and performs no registry install or sibling checkout.

## Evidence

- The copied standalone artifact executes successfully against a generated Hub.
- Artifact tampering is rejected by checksum validation.
- Disposable Git proves exact three-file creation, recovery and drift rejection.
- Workflow YAML parses with the expected four read-only steps.
- `npm run verify`: specification, generated-artifact drift, typecheck,
  dependency boundaries, Knip, Gitleaks and 50/50 tests pass.

## Deviation

No publishable workspace package was created. With registry distribution removed,
the existing CI capability remains the single source owner and a generated bundle
is the smallest boundary that avoids duplicate validator policy.
