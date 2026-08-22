# CLI and MCP contracts

## Offline command

```sh
node src/cli.ts okf hub-ci --root <hub-checkout> --format github
```

`json` is the default local format. `github` prints Markdown. Exit `1` only for
blocking integrity/safety failures, never for freshness age or warnings.

## Existing-Hub actions

- `preview_hub_ci_upgrade {}` returns exact base, workflow digest and
  `missing|current|outdated` without mutation.
- `submit_hub_ci_upgrade { expected_base, expected_workflow_digest }` requires
  the preview identities and creates/recovers one workflow-only PR.

Neither action accepts token, repository, branch, workflow bytes or release ref.

