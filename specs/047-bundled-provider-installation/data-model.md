# Data model: Bundled provider installation

## PlatformBundle

- `target`: exactly `linux-x64` or `darwin-arm64`
- `executable`: regular, non-symbolic executable file
- `manifest`: existing schema-version-1 Codebase Memory artifact manifest
- identity fields: provider/version, upstream commit, source digest, parser
  profile identity/digest, platform/architecture, accepted tool surface,
  adapter version and executable checksum

Validation is all-or-nothing. The manifest and executable are not valid
independently.

## ActiveRuntime

- private target-specific directory under the existing build/runtime root
- contains exactly the executable and manifest copied from a valid bundle
- states: `absent` → `active`; `active` → `unchanged` for exact rerun; `active`
  → `replaced` only after a different valid bundle is fully staged

No durable installer database is added. Exact file identities are sufficient.

## Release preparation

- input: pinned source, owned patch/profile, accepted surface and current build
  platform
- output: one PlatformBundle for that platform
- failure: prior PlatformBundle and every other platform directory are preserved
