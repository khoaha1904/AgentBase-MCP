# Data Model: Own Upstream Runtimes

## UpstreamSnapshot

- `schema_version`
- `project`
- `upstream_url`
- `upstream_version`
- `upstream_commit`
- `license`
- `inventory_digest`
- deterministic relative-path/SHA-256 inventory

Invariant: imported bytes match the inventory, contain no nested `.git`, and
are never modified by build or runtime.

## ParserProfile

- `schema_version`
- `profile_id` and `profile_version`
- ordered accepted language IDs
- grammar shim/directory mapping
- profile patch digest
- supported platform set

Invariant: the declared language set equals retained grammar bytes, compiled
grammar shims and registered language factories.

## PlatformArtifactManifest

- `schema_version`
- `provider` and `provider_version`
- `upstream_commit` and `source_digest`
- `profile_id`, `profile_version` and `profile_digest`
- `platform` and `architecture`
- `executable_sha256`
- `tool_manifest_sha256`
- `adapter_version`
- diagnostic compiler/build identity

Invariant: the manifest and executable live in one admitted platform directory;
all identity fields are checked before provider startup.

## UpstreamPatchSet

- ordered patch paths and SHA-256 values
- source revision the patches apply to
- short responsibility statement

Invariant: patches apply only to disposable build staging. Failure leaves the
pristine snapshot and previous artifact unchanged.

## State transitions

```text
local approved checkout
  -> imported pristine snapshot
  -> inventory verified
  -> disposable staged copy
  -> profile patch applied
  -> native artifact built and probed
  -> artifact + manifest atomically admitted
```

Any failure before the final transition deletes only staging. No runtime action
performs these transitions automatically.
