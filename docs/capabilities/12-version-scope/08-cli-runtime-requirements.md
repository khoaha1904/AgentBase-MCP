# CLI runtime requirements

> Status: implemented baseline — `abs` public dispatch and shared-token Hub
> connect are verified by the repository gate.

High-level authority: [`docs/product/00-product-scope-and-authority.md`](../../product/00-product-scope-and-authority.md)
and [`docs/product/README.md`](../../product/README.md).

## Baseline and gap

Before this capability, `src/cli.ts` exposed the internal `okf`, `mcp`,
observation, benchmark and foundation routes directly. Hub connection also
required a separate masked token helper and per-profile credential lookup.
That baseline was functional for developers but too broad and confusing for an
owner-facing product command.

The implemented change is contained: one dispatcher adds the public `abs`
surface, while old routes remain callable for compatibility. Hub identity,
Published/Draft state, MCP tools and lifecycle ownership remain unchanged.

## Public grammar

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
  → load shared token (or active legacy profile token)
  → masked prompt
       blank ───────────────→ reuse loaded token
       non-empty ───────────→ stage replacement token
  → validate remote + Hub through existing attach action
       success ─────────────→ destination profile active; shared token kept
       reported failure ────→ prior profile/token restored
```

The token is owner-private process input and the existing `config/hub/env`
credential file. It never enters arguments, authenticated URLs, MCP inputs,
output, errors, Git configuration, Hub files or knowledge records. The same
shared token is the default for every configured repository/branch; the remote
permission check remains authoritative.

Profile configuration stores only exact remote identity and independent local
state; it does not store a production/test rank. Environment-specific labels
remain outside the public CLI contract. Switching profiles never clones
knowledge from one Hub into another.

If no shared token exists, a blank prompt is rejected unless the active legacy
profile has a credential that can be promoted. Per-profile credential files are
legacy compatibility input, not the current selection model.

## Error and recovery contract

- Missing URL/branch, malformed URL, empty token or non-interactive setup without
  a stored token returns exit code `1` with bounded guidance.
- Remote permission, unavailable branch or invalid Hub returns exit code `1`;
  the previous active profile and shared token remain unchanged.
- A replacement token is rolled back on reported failure. An uncatchable process
  termination may leave owner-private credential state, but never activates the
  destination profile.
- Unknown public commands return a non-zero result and do not expose internal
  command inventory.

## Compatibility and ownership

- `node src/cli.ts`, `mcp`, `okf ...` and lifecycle subcommands remain internal
  routes until their callers migrate; they are omitted from public help.
- `src/cli.ts` composes; Hub configuration/credential modules own persistence;
  workspace setup owns validation and activation; MCP tools remain unchanged.
- `package.json` maps the installed executable name `abs` to the existing
  dispatcher rather than introducing a wrapper.

## Verification

Focused tests cover help, status, sync, first token entry, blank reuse,
shared-token defaulting, rollback and token redaction. The repository gate is:

```bash
npm run verify
```

The gate currently passes typecheck, dependency architecture, secret scan,
specification checks and 107 tests.
