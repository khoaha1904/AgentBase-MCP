# CLI Contract — `abs`

## Public commands

```text
abs --help
abs status
abs hub connect --url https://<host>/<owner>/<repository>.git --branch <exact-branch>
abs hub sync
```

`abs --help` lists these three commands and a short description. It does not
list `okf`, proposal phases, benchmark actions or the technical `mcp` launcher.
Connect may show a masked token prompt; an empty line means reuse the existing
shared token.

## `abs status`

- Returns exit code `0`.
- Emits compact, secret-free local status.
- Does not mutate Hub, credentials or knowledge.

## `abs hub connect`

### Success

- Returns exit code `0`.
- Emits the existing secret-free Hub setup result.
- The validated destination profile is active.
- A non-empty masked token replaces the shared owner-private credential;
  otherwise the existing shared credential is reused.

### Failure

- Returns exit code `1` with bounded secret-free guidance.
- The previous active profile remains active.
- A replacement credential newly entered by this invocation is rolled back.
- No synchronize, publish, accept, bootstrap or knowledge action occurs.

### Forbidden inputs and behavior

- No `--token`, authenticated URL, arbitrary executable/argv, force, merge or
  automatic login.
- No MCP call accepts or obtains a token.
- Token bytes never appear in output or errors.

## `abs hub sync`

- Returns the existing explicit Hub synchronization result.
- Does not connect, select credentials, publish, accept or copy knowledge across
  profiles.

## Internal compatibility

`node src/cli.ts`, `mcp`, `okf ...` and lifecycle subcommands may remain callable
for skills, MCP clients and verification during migration, but they are not
publicly documented or shown by `abs --help`.
