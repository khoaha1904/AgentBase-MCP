# Implementation Plan: Installer Terminal UI

**Branch**: `011-installer-terminal-ui` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

## Summary

Refine the existing dependency-free installer into a restrained inline TUI.
Render AgentBase-MCP identity before quiet dependency preparation, parse arrow
keys as logical input, redraw only the client-picker region, show three setup
actions and translate internal registration results into readable completion
copy. Preserve the existing raw terminal, token and registration boundaries.

## Technical Context

**Language/Version**: Node.js `>=24.12 <25` and existing Bash launcher

**Primary Dependencies**: Node standard library only

**Storage**: Unchanged credential and registration recovery files

**Testing**: `node:test` with fake TTY streams, captured ANSI/plain transcripts and existing registration doubles

**Target Platform**: ANSI-capable Unix-like terminals plus no-color, narrow, dumb-terminal and non-TTY fallbacks

**Project Type**: Repository-root interactive installer

**Constraints**: No alternate screen, full-screen clear, mouse, new dependency, secret echo or change to registration/token authority

## Constitution Check

- **Evidence Before Abstraction — PASS**: one concrete two-item installer UI; no generic TUI framework.
- **Local-First Explicit Authority — PASS**: rendering changes no mutation authority; non-TTY remains mutation-free.
- **Agent-Navigable Ownership — PASS**: terminal interaction stays cohesive in `scripts/install.mjs`; no metric-driven split.
- **Cumulative Knowledge — PASS**: no graph or Hub knowledge behavior changes.
- **Specification and Verification — PASS**: Capability 011 uses `AB-INSTALL-018..024` with focused deterministic transcripts.

Post-design gate passes with no dependency, baseline mark, migration or provider change.

## Project Structure

```text
scripts/install.mjs       # input parsing, inline rendering and setup orchestration
scripts/install.test.mjs  # keyboard, fallback, safety and completion transcripts
docs/specs/installation.md
README.md
docs/handoff.md
specs/011-installer-terminal-ui/
```

**Structure Decision**: Keep small render/key helpers in the existing installer
owner. They change together with this one terminal flow. Do not create a TUI
module or forwarding wrapper solely for line-count metrics.

## Design

1. Detect interactive, ANSI, color, Unicode and narrow capabilities separately.
2. Render a cyan-accented but text-complete brand header before dependency work.
3. Capture successful `npm ci` output; surface bounded diagnostics only on failure.
4. Parse `ESC [ A/B`, Space, Enter, Ctrl+C and existing number shortcuts.
5. Redraw only the picker block, hiding the cursor during selection and restoring
   it on selection, cancellation and failure. Dumb terminals use append-only text.
6. Label steps `1/3 Clients`, `2/3 GitHub access`, `3/3 Connect clients`, then
   render readable result rows and the new-session next step.

## Rollback

UI state is ephemeral. Raw mode and hidden cursor are restored in `finally`.
Credential and client registration rollback remain exactly Capability 010's
responsibility.

## Complexity Tracking

No violation or exception.
