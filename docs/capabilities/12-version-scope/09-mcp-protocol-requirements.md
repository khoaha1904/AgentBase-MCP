# MCP protocol requirements

> Status: Wire compatibility and Group 1 capability-policy composition are
> implemented and verified.

Current wire-level behavior for the AgentBase MCP composition boundary. Product
direction remains in
[`docs/product/00-scope-and-authority.md`](../../product/00-scope-and-authority.md#mcp-protocol-direction),
while [the Architecture Contract](../../architecture/runtime.md) owns the
system boundary between business tools and protocol adapters.

## Supported protocol and transport behavior

- **AB-MCPMOD-001** — Stdio auto-negotiates the modern `2026-07-28` MCP era and
  retains `2025-11-25` compatibility. The supported-era policy is explicit and
  independently testable.
- **AB-MCPMOD-002** — High-level AgentBase tool registration remains independent
  of wire versions, transport negotiation and HTTP request handling. Business
  capabilities do not import protocol-adapter internals.
- **AB-MCPMOD-003** — Modern stdio, modern stateless Streamable HTTP and legacy
  compatibility expose the same policy-selected business tool contracts. Protocol
  modernization does not rename or remove a tool.
- **AB-MCPMOD-004** — Every advertised tool input declares JSON Schema 2020-12
  through the official SDK registration path. Conservative private tool-list
  caching and additive structured results must not change existing text or
  argument contracts.
- **AB-MCPMOD-005** — The repository exposes a reusable HTTP handler but does not
  open a production port or silently enable remote deployment, OAuth/OIDC or
  Tasks. Each requires separately accepted Product, Architecture and Capability
  Contracts plus a verified implementation plan.
- **AB-MCPMOD-006** — The web-standard Streamable HTTP handler constructs an
  isolated server per request, serves modern requests without a protocol
  session, advertises only the modern era during modern discovery and retains
  the SDK stateless legacy fallback. Response selection preserves related
  protocol notifications through the appropriate JSON or event-stream form.
- **AB-MCPMOD-007** — The high-level server factory applies one capability policy
  before registering tools. The shipped trusted-enterprise policy exposes the
  normal AgentBase tool set; policy selection is deployment composition, not a
  tool argument.
- **AB-MCPMOD-008** — Every advertised tool carries truthful read-only,
  destructive and idempotence annotations derived from its current behavior.
  An annotation improves client safety UX but never substitutes for workflow
  state validation or a future hardened deployment policy.
- **AB-MCPMOD-009** — Query/graph reads, local authoring, Hub lifecycle/remote
  publication and provider observation remain distinct capability classes for
  policy and metadata. Trusted composition exposes them together; business
  handlers still enforce their existing lifecycle, target and input invariants.
- **AB-MCPMOD-010** — The reusable HTTP handler receives the policy-selected
  tool set from its embedding application and opens no port itself. The shipped
  policy is supported only inside the trusted enterprise boundary; public or
  hostile-client deployment remains unsupported pending a hardened contract.
- **AB-MCPMOD-011** — Protocol tests prove trusted tool parity, accurate
  annotations and unchanged workflow-state validation across modern stdio,
  modern HTTP and legacy compatibility paths. A policy double proves that
  composition can omit a tool without changing its business handler.

## Release surface governance

- **AB-SURFACE-001** — The current release freezes ten public outcome-level
  skills, two internal supporting skills and thirty-six advertised MCP tools.
  Group 7 replaces Accept/pending/submit with one exact-confirmation Publish
  action; no retired action remains as a public compatibility alias.
  A count increase requires explicit Product approval or an accepted
  replacement/consolidation; a lower count is not itself a quality objective.
- **AB-SURFACE-002** — Every advertised MCP tool is named by at least one shipped
  public or internal workflow skill. Release evidence rejects orphan tools and
  catalog drift.
- **AB-SURFACE-003** — Public skills remain separated by user outcome: query,
  context, scan, single Init, Refresh, Batch Init, Domain Enrichment, focused
  diagram, Domain site and Hub lifecycle. Internal OKF-authoring and
  diagram-rendering skills remain delegation-only.
  G9-C1 presents existing Init/Refresh commands as Add repository/Update knowledge.
  Their instructions route new/existing identity mismatches within the same
  approved repository, without recursive handoff on ambiguity. Delta is the
  ordinary update strategy; requested missing-knowledge repair selects Coverage.
  Provider-dependent gaps only offer scoped Domain Enrichment until approved.
  Command IDs, explicit-only policy and separate Publish confirmation remain.
- **AB-SURFACE-004** — Shared tools such as Preflight, Prepare, validation,
  Inspect and Published query are deliberate workflow primitives, not duplicate
  public outcomes. State-changing lifecycle transitions remain separate instead
  of becoming one conditional multi-action tool.
- **AB-SURFACE-005** — Trusted-enterprise composition continues to advertise the
  frozen catalog. Existing capability policy remains the only current runtime
  filtering extension; this audit adds no dynamic skill-scoped tool registry or
  new compatibility layer.

## Acceptance evidence

Tool descriptions are concise routing hints. Detailed authoring guidance belongs
in schema responses and workflow skills. Wire schemas may factor identical
subschemas through local `$defs`/`$ref`; each tool remains self-contained, with
unchanged fields, required keys, enum/pattern/bounds and rejection behavior.
The full thirty-six-tool catalog remains advertised. Deterministic qualification
measures listTools bytes; a byte target does not authorize dropping constraints.

Focused protocol-policy, stdio and HTTP tests verify both eras, sessionless
modern discovery/listing, legacy initialization, JSON Schema declarations,
cache hints, trusted policy composition and unchanged business tool behavior.
The canonical repository gate remains `npm run verify`; hardened public
authorization and Tasks are not part of that offline evidence.
