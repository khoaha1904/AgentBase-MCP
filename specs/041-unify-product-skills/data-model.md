# Data Model: Product Skill Catalog

No persistent product data is added.

## Skill catalog entry

- `name`: stable canonical directory/frontmatter name.
- `audience`: `public` or `internal`.
- `goal`: one non-overlapping workflow responsibility.
- `implicit`: public skills may match natural language; internal descriptions
  match only when a public workflow needs the support responsibility.
- `client invocation`: derived presentation, `$name` for Codex and `/name` for
  Claude Code; not a second identity.

## Catalog invariants

- Six public entries and two internal entries.
- Every installed entry has one source `SKILL.md`.
- Names are unique and contain no `abs-*` or `speckit-*` entry.
- Classification does not change MCP authorization or state.
