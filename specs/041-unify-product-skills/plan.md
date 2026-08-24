# Implementation Plan: Unify Product Skills

**Branch**: `041-unify-product-skills` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

## Summary

Add one instruction-only `agentbase-query` skill over the existing Published
Hub and Code Graph primitives, narrow the two supporting skill descriptions,
and make the installer/catalog/UI metadata agree on six public plus two
internal workflows. Keep the MCP runtime and 42-tool inventory unchanged.

## Technical Context

- **Language/Version**: Existing Markdown skill artifacts and Node.js 24 installer scripts.
- **Primary Dependencies**: Existing Agent Skills format, current installer and existing MCP tools; no new dependency.
- **Storage**: User-scope skill directories already owned by installation; no new runtime state.
- **Testing**: Existing Node test inventory, skill validation and canonical `npm run verify`.
- **Target Platform**: Codex and Claude Code selected by interactive setup.
- **Constraints**: Same canonical names across clients; no custom alias, MCP router, model SDK or additional client-config mutation.
- **Scope**: One new skill artifact, current skill metadata/catalog, installer allowlist/tests and narrow living requirements.

## Constitution Check

- **Evidence Before Abstraction**: Official client documentation establishes Codex `$skill` and Claude `/skill`; no invented common alias.
- **Local-First Explicit Authority**: Query is read-only for source, Hub and remote state and adds no network or background behavior.
- **Agent-Navigable Ownership**: `agentbase-query` owns ordinary questions; graph and OKF authoring remain named internal support owners.
- **Cumulative Knowledge**: Query cannot mutate, resolve conflicts or promote source output to Published knowledge.
- **Specification and Verification**: Feature 041 owns the behavior and reuses requirement-linked installer checks without growing the test inventory.

All gates pass before design. The post-design shape adds no exception.

## Design

1. Create a concise instruction-only query skill with the approved Hub-first,
   Code-first, combined, attribution and degradation matrix.
2. Remove Hub routing ownership from `use-codebase-memory`; narrow both internal
   skill descriptions and UI labels to support-only behavior.
3. Give all six public workflows consistent UI metadata and exact client
   invocation examples without adding alias artifacts.
4. Change the fixed installer catalog from seven undifferentiated skills to
   eight classified entries while preserving transactional copy, conflict and rollback.
5. Align the product skill README, query/installation requirements and
   architecture count. Do not rewrite completed Feature 039 history.

## Project Structure

```text
.agents/skills/
  README.md
  agentbase-query/
    SKILL.md
    agents/openai.yaml
  agentbase-{ingest,refresh,batch-ingest,domain-enrichment,hub}/
  use-codebase-memory/     # internal support
  agentbase-okf/           # internal support
scripts/installation/
  product-skills.mjs
  product-skills.test.mjs
docs/design/
  00-architecture.md
  10-query-routing/
  12-version-scope/02-installation-requirements.md
```

**Structure Decision**: Reuse current product-skill and installer owners; no
new runtime capability or generic skill framework is introduced.

## Complexity Tracking

No constitution violation or complexity exception.
