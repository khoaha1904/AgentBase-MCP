# Implementation Plan: Hub Initialization

**Branch**: `035-hub-initialization` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

## Summary

Generalize the released CI-upgrade PR lifecycle into one deterministic Hub
Initialization lifecycle. Reuse its Git/GitHub, locking, retry and review
boundaries; derive only the missing README and non-current CI files.

## Technical shape

- Extract the standard Hub README renderer for new-Hub and existing-Hub reuse.
- Fetch exact remote `main` into a private local ref without replaying Local Drafts.
- Build an intent-specific file set and digest; create/recover one exact PR.
- Rename the two public MCP tools and runtime actions; retain no duplicate aliases.
- Extend the existing local-Hub and fake-GitHub journeys without increasing test count.

## Non-goals

- Repairing a missing root index in an invalid attached Hub.
- Editing an existing README.
- Resolving the currently divergent Local Draft ancestry.
