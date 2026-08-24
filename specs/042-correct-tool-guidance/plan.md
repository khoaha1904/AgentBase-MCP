# Implementation Plan: Correct Tool Guidance

**Branch**: `042-correct-tool-guidance` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

## Summary

Keep all 42 released actions. Curate Code Graph descriptions/annotations at the
existing AgentBase adapter boundary, assign the two existing Question actions
to `agentbase-hub`, and extend the current MCP surface test without adding a
test case.

## Technical Context

- **Language/Version**: TypeScript on Node.js 24; Markdown Agent Skills.
- **Dependencies**: Existing MCP SDK and pinned Codebase Memory provider only.
- **Storage/Processes**: No change.
- **Testing**: Extend the existing official-listing test; run skill validation
  and `npm run verify`.
- **Constraints**: Exactly 42 tools, exact forwarding unchanged, no rename,
  router, model benchmark or dependency.

## Constitution Check

- **Evidence Before Abstraction**: The captured public listing demonstrates the
  stale description and inaccurate upstream hints.
- **Local-First Explicit Authority**: Metadata does not broaden authority;
  Question answers still stop at a review proposal.
- **Agent-Navigable Ownership**: Existing Question actions gain one public
  owner instead of a new skill.
- **Cumulative Knowledge**: Exact revision, proposal inspection and explicit
  Accept remain unchanged.
- **Specification and Verification**: Living requirements and the existing
  requirement-linked surface test change with behavior.

All gates pass before and after design.

## Design

1. Preserve pinned provider descriptors for drift checks, but derive curated
   public graph descriptors with AgentBase-owned descriptions and annotations.
2. Remove only references to unavailable AgentBase tools; retain all supported
   graph arguments and forwarded result behavior.
3. Extend `agentbase-hub` with an explicit Question-review subflow using the two
   already released tools. Do not alter `agentbase-query`.
4. Assert the invariant in the existing MCP listing test and update the narrow
   Code Graph/Question living requirements.

## Project Structure

```text
src/app/codebase-memory-mcp/tool-manifest.ts
src/app/codebase-memory-mcp/server.test.ts
.agents/skills/agentbase-hub/
docs/design/01-repository-reading/05-runtime-requirements.md
docs/design/11-review-and-publish/01-runtime-requirements.md
```

No new runtime owner or abstraction is introduced.

## Complexity Tracking

No constitution exception.
