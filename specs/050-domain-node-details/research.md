# Research: Domain node details

## Decision

Use native browser DOM, CSS and `<dialog>` on top of the existing Cytoscape
static site. Do not add a Markdown renderer or UI framework.

## Rationale

The generated site is intentionally offline and already has all selected
Published metadata needed for overview/detail interactions. Text insertion via
`textContent` is safer and smaller than rendering arbitrary Markdown as HTML.

## Alternatives

- Full Markdown-to-HTML renderer: rejected; expands attack surface and is not
  needed for an overview.
- React/Vite application: rejected; violates the existing static asset boundary.
- New MCP document endpoint: rejected; static Domain sites must remain offline.
