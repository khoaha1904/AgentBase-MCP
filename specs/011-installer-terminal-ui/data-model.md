# Data Model: Installer Terminal UI

## Terminal capabilities

- interactive TTY
- cursor/ANSI support
- color support
- Unicode support
- terminal width and narrow classification

## Picker state

- ordered items: Codex, Claude Code
- focused index
- selected client ID set
- optional validation message
- rendered line count used only for bounded inline redraw

## Setup presentation state

- current action: clients, GitHub access, registration or complete
- credential outcome: created, preserved or skipped
- per-client outcome: registered or already registered

No presentation state is persisted.
