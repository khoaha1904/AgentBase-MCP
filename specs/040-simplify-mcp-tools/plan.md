# Implementation Plan: Simplify MCP Tools

**Branch**: `040-simplify-mcp-tools` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

## Summary

Filter the pinned provider manifest to nine released graph descriptors, replace
only the public `index_repository` descriptor with AgentBase's accepted schema,
and delete four redundant schema adapters. Preserve internal validators and all
Hub actions. Update product skills and living requirements to the same surface.

## Technical Context

- TypeScript/Node modular monolith; no dependency or persistent-state change.
- Owners: `app/codebase-memory-mcp`, product skills and current MCP/schema/
  benchmark requirements.
- Existing MCP end-to-end test remains the single surface contract; test count
  does not grow.

## Implementation Slices

1. Record the exact 42-tool released contract.
2. Curate graph descriptors and the controlled indexing schema.
3. Delete four public schema descriptors/routes while retaining core policy.
4. Align the seven product skills and historical/current benchmark boundary.
5. Run focused MCP checks and the canonical gate.

## Constitution Check

The change deletes public ambiguity, preserves current evidence workflows and
adds no dependency, process, state or abstraction. Historical artifacts remain
immutable; current behavior is updated in living requirements.
