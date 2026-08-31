# Internal qualification command contract

```text
node scripts/qualification/hub3-sqs-fixture.mjs
```

The command has no arguments and prepares exactly one reviewable enrichment
proposal for the active `khoaha1904/hub-3#main` profile. It prints JSON containing
the proposal ID, diff digest, provider outcome, resolved candidate decision and
bounded AWS CLI argv summary. It does not Accept, submit, merge or synchronize.

The command fails before authoring when the active Hub repository or branch is
not the exact allowlisted target, the Published base is not current, the factual
Question revision is absent/stale, provider output is not trusted terminal
evidence or proposal validation fails.

After review, ordinary existing commands advance distinct transitions:

```text
node src/cli.ts okf hub inspect --proposal <id>
node src/cli.ts okf hub accept --proposal <id> --digest <sha256-digest>
node src/cli.ts okf hub submit --proposals <id>
# maintainer merges the returned PR externally
node src/cli.ts hub sync
```

There is no public `--mock` option and no new MCP tool.
