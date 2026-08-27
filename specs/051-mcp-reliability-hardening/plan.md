# Implementation plan: MCP reliability hardening

**Branch**: `051-mcp-reliability-hardening`
**Spec**: [spec.md](spec.md)

## Sequence

1. P0 redaction and truthful query failure behavior.
2. P0 provider parser contract fixtures.
3. P1 bounded promotion of useful architecture signals.
4. P1 real Crawler qualification and one non-Crawler generic fixture.
5. P2 query relevance measurement only; semantic search remains deferred.

The upstream Codebase Memory patch-upgrade rehearsal is owner-deferred for this
capability. The pinned v0.10.8 runtime remains the baseline and no admission
authority or provider runtime is changed.

Every step starts only after its requirement text is current. A broad gap returns
to `docs/present/` and `docs/design/` before implementation resumes.

## Runtime impact

- P0 adds negligible processing and no new dependency; query may fail explicitly
  where it previously returned incomplete data.
- P1 may increase Discovery Seed/model context and therefore ingest time, but
  existing bounds remain mandatory.
- P2 is measurement-only and has no runtime impact. The Crawler qualification
  dataset reports top-five lexical recall only; it does not claim semantic
  relevance.

## Reuse

Reuse the pinned Codebase Memory runtime, existing discovery Seed/Receipt,
existing MiniSearch projection, exact Published reader and existing test harness.
No second knowledge authority is introduced.
