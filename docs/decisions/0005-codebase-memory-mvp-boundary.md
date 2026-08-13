# ADR 0005: Use the Managed Codebase Memory Package with a Private Direct-Index Workspace

- **Status:** Accepted for Capability 002 walking skeleton
- **Date:** 2026-08-12
- **Provider:** `codebase-memory-mcp@0.10.1`

## Context

AgentBase needs real graph evidence without asking users for a provider path,
reusing a global installation, modifying repository source or leaving an
unowned provider process. Capability 002 therefore begins with an exact shipped-
binary spike on a disposable copy of the 12-file TypeScript fixture.

The owner superseded the temporary user-supplied binary preview: AgentBase MCP
owns provider version and bootstrap.

## Managed distribution decision

Pin exact production dependency `codebase-memory-mcp@0.10.1` and approve only
that exact package's npm install script. The official wrapper downloads the
platform release archive, verifies its upstream checksum, allowlists archive
members, validates the executable and publishes it into package-private storage.

AgentBase:

- resolves the dependency package and private native file directly;
- records package integrity, reported version and executable SHA-256;
- never requests a user path or searches `PATH`;
- never reuses or changes a separately installed copy;
- never invokes native `install`, `update`, `uninstall` or `config`;
- upgrades only through a reviewed dependency and lockfile change.

For the accepted Linux x64 environment:

- npm package integrity:
  `sha512-/O013R5oM9dBLRzLbzOnhj8hAcFITbaTRUPrfqeFsj2DJADaogPnuTk3yNVorazpOmTmOk9pi+nFtkKsmX+Aog==`;
- release archive:
  `codebase-memory-mcp-linux-amd64-portable.tar.gz`;
- release archive SHA-256:
  `97c6580a13d772d040e936584f3c5234586ab03f31a77354af8a763851a39a7f`;
- extracted executable SHA-256:
  `3380cf3b868d749c63f564e7c6b81381a140942ec42253f785e158ab5144064f`;
- reported identity: `codebase-memory-mcp 0.10.1`.

## Cache and source decision

Use direct indexing of the selected repository with:

- an AgentBase-owned private `CBM_CACHE_DIR` outside `CBM_ALLOWED_ROOT`;
- `CBM_ALLOWED_ROOT` set to the exact selected repository;
- a deterministic AgentBase project name;
- `mode=fast` for the first structural path;
- `persistence=false` so no shareable graph artifact is written into source.

The disposable spike found:

- provider-default cache admission failed closed with `cache-private` because a
  parent cache directory was group-writable;
- `XDG_CACHE_HOME` did not change the provider's canonical cache root;
- an explicit `CBM_CACHE_DIR` with private directories succeeded;
- a real adapter integration correction confirmed that v0.10.1 rejects a
  cache nested inside the allowed repository; AgentBase therefore keeps its
  disposable graph cache in a private per-user temporary state root outside the
  checkout;
- all 13 fixture/source metadata file hashes were identical before and after;
- `.codebase-memory/`, `.gitattributes` and other repository files were not
  created;
- graph/config/log files were written only below the explicit cache root with
  directory mode `0700` and file mode `0600`;
- no Codebase Memory process remained after each command.

A mirror is therefore unnecessary for this version/flag combination. Any future
provider version must repeat the mutation test before retaining direct mode.

## Invocation and rollback boundary

Capability 002 uses native one-shot `cli` commands and waits for every process
to exit. It does not start a standing MCP server, watcher or UI. The index command
may start a supervised temporary coordination process, but accepted completion
requires zero remaining provider processes.

Rollback is bounded:

- current shared OKF is untouched by provider failure;
- source is read-only from AgentBase's perspective;
- incomplete cache data is namespaced by provider version, adapter schema and
  repository identity and is disposable;
- AgentBase never deletes a path that is not an exact owned cache/proposal path;
- dependency rollback means restoring the prior reviewed AgentBase package and
  lockfile, not calling the provider self-updater.

## Measured limitation

On the accepted machine, each cold one-shot query took roughly 9 seconds and
indexing the 12-file fixture took roughly 11 seconds because the provider starts
and stops temporary coordination infrastructure. This is acceptable only for
the walking-skeleton evidence path, not proof that Part 1 meets its eventual
interactive latency goal.

AgentBase must measure the complete vertical loop before choosing among later
options such as batching, a provider session owned by AgentBase MCP or another
engine. Capability 002 does not silently add a daemon to hide this result.

## Evidence

- `fixtures/codebase-memory-v0.10.1/manifest.json`
- `fixtures/codebase-memory-v0.10.1/fixture.json`
- `fixtures/codebase-memory-v0.10.1/responses/`
- <https://www.npmjs.com/package/codebase-memory-mcp/v/0.10.1>
- <https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.10.1>
