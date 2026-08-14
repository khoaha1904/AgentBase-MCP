# Contract: Installer Terminal UI

## Capable interactive terminal

- Show AgentBase-MCP before dependency preparation.
- Show `1/3 Clients`, then both client rows.
- Up/Down changes focus with wraparound.
- Space toggles the focused item.
- Enter continues only with a non-empty selection.
- Ctrl+C or EOF cancels and restores cursor/raw mode.

## Visual semantics

- `›` or `>` identifies focus.
- `[x]` and `[ ]` identify selection independently of color.
- Cyan is the only brand/focus accent; semantic success/error copy remains readable without it.
- Redraw erases only lines owned by the picker.

## Fallbacks

- `NO_COLOR` emits no SGR color codes but keeps ANSI redraw when supported.
- `TERM=dumb` emits append-only plain prompts and accepts number toggles plus Enter.
- Non-TTY performs dependency preparation only and emits no ANSI sequence.

## Completion

Map `registered` to `Connected` and `already-registered` to `Already connected`.
End with one instruction to open a new selected coding-client session.
