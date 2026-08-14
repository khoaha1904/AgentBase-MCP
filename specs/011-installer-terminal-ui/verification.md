# Verification: Installer Terminal UI

**Date**: 2026-08-13

## Focused evidence

`node --test scripts/install.test.mjs` passed 10 scenarios covering branded
three-step setup, combined and chunked arrows, Space multi-select, empty
validation, masked paste/Backspace, preserved/skipped credentials, readable
registration outcomes, `NO_COLOR`, 40-column, `TERM=dumb`, non-TTY and
cursor/raw restoration.

## Visual PTY evidence

A real PTY run rendered AgentBase-MCP before dependency preparation, kept
successful `npm ci` quiet, displayed the three-action hierarchy and showed the
focused unchecked Codex row with keyboard help. Ctrl+C restored the cursor/raw
terminal and reported cancellation before client registration. No client was
selected or registered during this visual check.

## Canonical evidence

`npm run verify` passed the specification, type, architecture, full test and
diff gates. No dependency or architecture baseline mark was added.
