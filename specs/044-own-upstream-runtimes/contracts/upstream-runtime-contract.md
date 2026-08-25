# Contract: Owned Upstream Runtime

## Preparation input

- AgentBase repository root.
- Exact supported current platform: `linux-x64` or `darwin-arm64`.
- Configured dependency registry and approved Node/native toolchain.
- Verified Codebase Memory snapshot, parser profile and patch set.

## Preparation output

One ignored platform directory containing exactly:

- executable `codebase-memory-mcp`;
- `artifact-manifest.json` binding source/profile/platform/tool/executable
  identity.

Preparation is successful only after version and captured-tool-schema probes
pass. Publication is an atomic same-filesystem switch.

## Runtime admission

Runtime accepts only the artifact for the current platform whose manifest:

1. has the exact supported schema;
2. binds the accepted upstream/profile/adapter identities;
3. names the exact repository-owned executable;
4. matches its executable SHA-256 and file permissions; and
5. matches the captured AgentBase tool-manifest digest and reported provider
   version.

No path override, `PATH` search, installer, updater, download or hidden rebuild
is allowed.

## Failure contract

Missing prerequisites, inventory/patch drift, failed compile/probe, unsupported
platform and admission mismatch are distinct visible failures. They produce no
provider process, no partial evidence and no client-registration mutation. A
previously admitted artifact is preserved.

## Public compatibility contract

- MCP tool count remains 43.
- Code Graph surface remains the current controlled index action plus eight
  query/read actions.
- Tool arguments/results and captured drift validation remain unchanged.
- Graph cache remains private/disposable; source remains read-only.
- No UI, HTTP port, daemon, watcher or new product skill is enabled.
