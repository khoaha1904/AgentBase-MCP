# Verification: Own Upstream Runtimes

## Accepted source and behavior

- Codebase Memory: `v0.10.8`, commit
  `46ae198fc11cda80e817acbc5f5908d7c2de7032`, MIT.
- diagram-design: `2.6.5`, commit
  `648c2a597839301e06df1e7434a08bde9f42eed3`, MIT.
- Pristine `v0.10.8` passes the representative graph, search, trace, coverage,
  source-immutability and non-persistence qualification retained in
  `fixtures/codebase-memory-v0.10.8/qualification.json`.
- The accepted private provider schema digest is
  `e02c6bd225b2b107ec414b2d6888b907997d331c0991f01de86e013707a5ae50`.
  Its two explained backward-compatible differences from `v0.10.1` are recorded
  in `fixtures/codebase-memory-v0.10.8/qualification-comparison.md`.
- AgentBase retains its `v0.10.1` public descriptors. The official listing is
  exactly 43 tools, including the same nine Code Graph actions.

## Deterministic source/profile evidence

- Codebase Memory snapshot: 1,009 files, 119,236,409 bytes; largest retained
  file 31,377,416 bytes. Source digest:
  `9c0634644e777be1c1997f203987fae9c0b703f4042c397353410cd01e300b68`.
- diagram-design snapshot: 422 files, 9,256,784 bytes; largest retained file
  321,385 bytes.
- Parser profile: `agentbase-mvp-12-v1`, 12 languages. Profile digest:
  `9608592e0ae98032cf5fadf57ce1064a302526e7ce4c3e301763f5152010355b`.
- One mixed fixture indexes representative Bash, Dockerfile, Go,
  HCL/Terraform, Java, JavaScript, JSON, Markdown, Python, TSX, TypeScript and
  YAML files without a partial parse. Its Rust control file alone is reported
  as a visible unsupported skip without failing the index.
- Both inventories and inactive-foundation checks pass. The Codebase Memory
  Graph UI frontend and its npm dependency tree are absent; the shared upstream
  C runtime scaffolding remains inactive. No diagram dependencies/skills are
  activated. The future diagram profile is static HTML/SVG with system fonts
  and no network asset, browser or PNG requirement.

## Linux x64 native lane

- Host: Node `v24.18.0`, Git `2.43.0`, GNU Make `4.3`, GNU patch `2.7.6`, GCC/G++
  `13.3.0`.
- Clean owned build time observed on this VPS: 532.02 seconds. This is evidence,
  not a performance promise.
- Admitted executable SHA-256:
  `fc9df9744c2130f5d4064833a25e3e482fc727b0b8735c8447c492e82067ae98`.
- The post-Graph-UI-exclusion cold build produced the same executable SHA-256
  as both earlier Linux cold builds because the removed frontend was never part
  of the `ui=false` build. The new artifact binds the new source digest and then
  passed admission, the 12-language profile, 43-tool MCP index/query
  qualification and the complete 59-test gate.
- Artifact manifest binds Linux x64, upstream/source/profile identity, accepted
  tool surface and adapter version. Runtime admission, representative real
  graph qualification, source immutability, lifecycle cleanup and all drift
  rejection tests pass.
- Canonical verification passes 59/59 tests. The post-exclusion native gateway
  probe listed 43 tools and completed all representative checks in 6,849.976 ms.

The build host lacked system `zlib.h`; qualification temporarily supplied the
unpacked approved Debian development headers/libraries through compiler search
paths without installing or changing machine inventory. Enterprise hosts must
provide the equivalent approved system development library before preparation.

## Commands

```sh
npm run verify:upstreams
npm run check:upstream-foundations
node scripts/benchmark/qualify-codebase-memory-profile.mjs
node --test src/app/codebase-memory-mcp/server.test.ts
node scripts/benchmark/qualify-codebase-memory-mcp.mjs
npm run verify
```

## Remaining enterprise release gate

macOS arm64 has not been qualified in the company environment. Linux development
of capability 044 may close, but AgentBase MUST NOT claim macOS arm64 release
support until the same source/profile builds with approved Node 24 and internal
registry, passes the same admission/tool/fixture qualification and its platform
manifest is appended here. No Linux-only code adjustment may be used to
manufacture that result.
