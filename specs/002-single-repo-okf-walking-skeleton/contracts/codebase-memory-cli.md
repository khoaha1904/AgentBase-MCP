# Contract: Codebase Memory v0.10.1 One-Shot Adapter

## Managed package boundary

The provider factory accepts:

- an exact repository root;
- an AgentBase-owned cache or mirror root selected after the mutation spike;
- bounded timeout and output-size limits.

AgentBase declares exact runtime dependency `codebase-memory-mcp@0.10.1`. It
resolves the package root and private native executable without `PATH` or user
configuration, records npm package integrity plus executable SHA-256, and rejects
a missing/non-executable file or identity other than `v0.10.1`.

The official dependency postinstall selects the platform archive, downloads it
over HTTPS, verifies the release checksum and publishes the executable inside
the package. If scripts were disabled and the binary is missing, AgentBase may
run the exact package-owned recovery installer once with visible diagnostics.
It never implements a second downloader or falls back to a global copy.

## Invocation

After bootstrap, every engine operation invokes the resolved native file using
the ordinary one-shot shape:

```text
<absolute-binary> cli <tool> <schema-derived flags>
```

The implementation uses argument arrays without a shell. JSON stdout is bounded
and parsed strictly. Progress and diagnostics on stderr are bounded separately.
The adapter never invokes the native `install`, `update`, `uninstall`, `config`,
UI or MCP/daemon entrypoint. Provider upgrades occur only through a reviewed
AgentBase dependency change and lockfile update.

## First supported operations

```text
indexRepository(repositoryRoot)
repositoryOverview(project)
searchStructure(project, boundedPattern)
traceCalls(project, functionName, direction, depth)
sourceSnippet(project, qualifiedName)
```

Exact flags and response fields are finalized only after the approved
`v0.10.1` disposable-fixture spike. Captured response fixtures become the
offline adapter contract. The public AgentBase result exposes provider-neutral
facts and limitations, not raw engine records.

## Lifecycle

- One command owns one child process and waits for its exit.
- No command starts or connects to the coordination daemon or watcher.
- `index_repository` may use the provider's supervised temporary worker; the
  operation is not complete until that worker has exited.
- Timeouts terminate only the exact spawned process group and return a typed
  failure.
- Exact-build, coordination ABI, cache-root and project-lock conflicts return a
  typed provider-conflict result; they do not trigger retries with another
  binary or cache root.

## Repository-mutation gate

Before live-repository use, the spike compares complete before/after manifests
of a disposable fixture copy. If explicit indexing creates or changes tracked
repository files and no reviewed non-mutating provider setting exists, the
adapter must index an AgentBase-owned stable mirror. Cleanup is bounded to paths
created and owned by that workflow.

The adapter may not add `.codebase-memory/`, `.gitattributes`, `.gitignore` or
other files to the selected repository without a later explicit product
decision.

## Result and failures

The public result union distinguishes:

- managed bootstrap unavailable, offline or integrity failure;
- unsupported platform/architecture;
- success with normalized evidence and limitations;
- incompatible binary;
- provider conflict;
- timeout;
- non-zero provider exit;
- malformed or oversized stdout;
- unsafe source path;
- incomplete requested scope;
- unexpected repository mutation.

Diagnostics contain exit status, bounded safe text and operation identity. They
do not contain credentials, environment dumps, absolute source roots or raw
provider cache paths.

## Verification

- Offline tests replay sanitized captured `v0.10.1` outputs through a fake child
  process boundary.
- An opt-in real integration command uses the managed package-private binary.
- Canonical `npm run verify` never downloads or executes the native binary.
- The accepted fixture query returns every declared critical fact in no more
  than three authored files.
