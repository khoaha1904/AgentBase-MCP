# CLI runtime requirements

> Status: `abs` public dispatch and the Group 1 built-in single-credential
> provider behavior are implemented.

High-level authority: [`docs/product/00-scope-and-authority.md`](../../product/00-scope-and-authority.md)
and [`docs/product/README.md`](../../product/README.md).

## Baseline and gap

Before this capability, `src/cli.ts` exposed the internal `okf`, `mcp`,
observation, benchmark and foundation routes directly. Hub connection also
used one shared token without naming its credential-provider boundary.
That baseline was functional for developers but too broad and confusing for an
owner-facing product command.

The implemented change is contained: one dispatcher adds the public `abs`
surface, while old routes remain callable for compatibility. Hub identity,
Published/Draft state, MCP tools and lifecycle ownership remain unchanged.

## Public grammar

Group 7 extends this grammar with `abs hub policy [--mode direct|pr]` and
`abs hub publish --proposal <id> --digest <digest> --mode direct|pr` under
[Direct publication](../11-review-and-publish/12-direct-publication-requirements.md).
Policy selection never publishes. Publish rejects policy mismatch;
CLI/MCP use the same Direct/PR entry. Hidden Accept/pending/submit routes are
removed, not aliased. The exact digest comes from
proposal inspection; executing Publish is confirmation to share those bytes.

```text
abs --help
abs status
abs hub connect --url <credential-free-https-repository-url> --branch <exact-branch>
abs hub sync
```

`abs --help` lists exactly these three commands. Help does not enumerate OKF,
proposal, benchmark, provider or `mcp` internals. `status` is read-only and
returns compact secret-free local state. `sync` is explicit and delegates the
existing synchronization action; it does not connect or publish.

## Connect sequence

```text
parse URL + branch
  → resolve the configured default enterprise credential
       found ───────────────→ masked prompt accepts blank reuse
       missing/replacement ─→ masked prompt requires provider credential
  → validate remote + Hub through existing attach action
       success ─────────────→ destination profile active; credential retained
       reported failure ────→ prior profile/default credential restored
```

The token is owner-private process input stored once by the built-in
single-credential provider. It never enters arguments, authenticated
URLs, MCP inputs, output, errors, Git configuration, Hub files or knowledge
records. Every Hub profile may resolve the same configured credential.

Profile configuration stores exact remote identity and independent local state;
it does not store or duplicate token bytes or a production/test rank.
Environment-specific labels remain outside the public CLI contract. Switching
profiles never clones knowledge from one Hub into another.

If a default credential already exists, connecting or switching to another Hub
reuses it without entering the token again. Otherwise connect requires the first
token. Future scoped or
multi-account providers may replace this implementation through the same
boundary without changing Hub profiles or connect semantics.

## Error and recovery contract

- Missing URL/branch, malformed URL or non-interactive setup without a resolved
  provider credential returns exit code `1` with bounded guidance.
- Remote permission, unavailable branch or invalid Hub returns exit code `1`;
  the previous active profile and credential-provider state remain unchanged.
- A replacement provider credential is rolled back on reported failure. An
  uncatchable process termination may leave owner-private staged credential
  state, but never activates the destination profile or changes another
  profile's credential.
- Unknown public commands return a non-zero result and do not expose internal
  command inventory.

## Compatibility and ownership

- `node src/cli.ts`, `mcp`, `okf ...` and lifecycle subcommands remain internal
  routes until their callers migrate; they are omitted from public help.
- `src/cli.ts` composes; Hub configuration/credential modules own persistence;
  workspace setup owns validation and activation; MCP tools remain unchanged.
- `package.json` maps the installed executable name `abs` to the existing
  dispatcher rather than introducing a wrapper.
- Entrypoint detection resolves the invoked path through its real path so the
  installed `abs` command also dispatches when invoked through a symbolic link.

## Verification

Focused tests cover help, status, sync, first token entry, blank-input Hub
switching, cross-profile knowledge isolation, rollback and token redaction. The
repository gate is:

```bash
npm run verify
```

The gate runs living-contract checks, typecheck, dependency architecture,
dead-code/dependency analysis, secret scan and the complete test suite.
