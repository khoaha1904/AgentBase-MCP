# Implementation Plan: Registry-less Hub CI

**Branch**: `034-registryless-hub-ci` | **Date**: 2026-08-22 | **Spec**: [spec.md](spec.md)

## Summary

Bundle the existing Hub CI CLI into one deterministic standalone JavaScript
artifact. Install that artifact, a checksum/version manifest and the read-only
workflow as one CI bundle. Keep source ownership in the current modular monolith;
do not add a publishable package or duplicate validation policy.

## Technical Context

- Node.js 24 TypeScript source and one generated ESM bundle.
- Existing validators and YAML dependency are bundled at build time.
- One pinned development-only bundler; zero Hub runtime dependencies.
- Existing local-Hub and fake-GitHub journeys remain the acceptance gate.

## Structure

```text
scripts/build-hub-validator.mjs              deterministic artifact build/check
assets/hub-ci/hub-validator.mjs              generated standalone artifact
src/app/hub-okf/ci/standalone.ts             bundle entrypoint
src/app/hub-okf/ci/workflow.ts               three-file bundle renderer
src/app/hub-okf/ci/upgrade.ts                exact CI-bundle PR lifecycle
```

## Safety and recovery

The workflow verifies the artifact checksum before execution. Upgrade recovery
requires exact base, branch, PR and all three file bytes. MCP never mutates
remote `main`; maintainers can close or decline the CI PR normally.

## Explicit non-goals

- npmjs, GitHub Packages or an internal package registry.
- A separately versioned shared-library repository.
- Backward compatibility for the unmerged workflow-only CI proposal.
