# Research: Installer Terminal UI

## Specialist review

**Decision**: Use an inline, history-preserving TUI with cyan accent, pointer and
checkbox semantics, a three-step hierarchy and quiet successful dependency work.

**Rationale**: The specialist review found that the current npm-first numeric
prompt obscures product identity and selection state. Inline redraw resembles
modern coding CLIs without the fragility of a full-screen alternate buffer.

**Alternatives considered**: A third-party TUI package adds unnecessary update
and terminal compatibility surface. A fixed box wraps poorly on narrow terminals.
Color-only selection is inaccessible. Full npm output should appear only when it
contains failure diagnostics.

## Compatibility

**Decision**: Treat ANSI cursor support, color support and Unicode support as
separate capabilities. `NO_COLOR` removes color only; `TERM=dumb` selects a plain
append-only picker; narrow terminals drop decorative indentation/dividers.

**Rationale**: Input state must remain understandable through pointer and `[x]`
text even when styling is unavailable.
