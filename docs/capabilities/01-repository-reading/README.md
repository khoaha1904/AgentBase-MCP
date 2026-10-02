# 01 - Repository reading

> Status: Source-only discovery and exact-source provenance replace the retired
> owned graph engine. Ordinary source investigation belongs to the host agent.

Product Contract:
[Repository understanding](../../product/01-repository-understanding.md)

## Contract map

- [Runtime requirements](05-runtime-requirements.md) - source discovery,
  census bounds, safe reads, Receipts and MCP composition.
- [Candidate discovery](../03-concept-discovery/01-candidate-discovery.md) -
  five-lane signal accounting and selective knowledge promotion.

## Current boundary

Preflight binds an Initial Ingest source snapshot; `discover_repository` builds
its private bounded Seed. The agent investigates exact source using existing
read/search tools and submits one Inventory through schema guidance. Delta
uses Git changes; Coverage uses bounded source investigation.

AgentBase ships no native graph provider, proxy, parser profile, indexing,
symbol lookup or call-path tracing. A separately registered upstream MCP has no
AgentBase-owned lifecycle. Hub-only query needs no source checkout or discovery.
