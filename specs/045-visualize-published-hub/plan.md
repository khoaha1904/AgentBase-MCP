# Implementation Plan: Visualize Published Hub

**Branch**: `045-visualize-published-hub` | **Date**: 2026-08-25 | **Spec**: [spec.md](spec.md)

## Summary

Extend the existing exact-commit Hub graph reader with one deterministic,
presentation-neutral projection. Expose one goal-level MCP tool used by two
separate public skills: a bounded diagram workflow using a narrow owned
diagram-design wrapper, and an explicit one-shot static 3D Domain site builder.

## Technical Context

**Language/Version**: TypeScript on Node.js `>=24.12 <25`; static browser JS.

**Primary Dependencies**: Existing YAML/MCP runtime, retained diagram-design
`2.6.5`, pinned `three@0.183.0`; existing development `esbuild` is not required
at visualization runtime.

**Storage**: Exact Published Hub checkout as input; caller-owned local diagram
or Domain-site output only.

**Testing**: One design-level deterministic fixture owner plus one model-backed
skill qualification after packet correctness passes.

**Target Platform**: AgentBase Linux x64/macOS arm64; generated site on modern
static-hosted browsers with WebGL.

**Project Type**: Local stdio MCP modular monolith plus generated static site.

**Performance Goals**: Diagram packet within current MCP request bounds; smooth
interaction for the eight-repository qualification Domain. Record timings as
evidence, not universal promises.

**Constraints**: Published-only, one Domain, no live service, no remote assets,
no credentials in output, no invented topology, maximum 64/256 diagram
nodes/edges and 500/2,000 Domain-site nodes/edges.

**Scale/Scope**: Three diagram types, one 3D site theme, two public skills, one
internal skill and one MCP tool.

## Constitution Check

### Before design

- **Evidence Before Abstraction:** Reuses real current OKF relations/Flow steps;
  missing data is an explicit outcome.
- **Local-First Explicit Authority:** Generation is explicit and bounded; no
  watcher, daemon, remote asset or automatic publication.
- **Agent-Navigable Ownership:** Core projection, application builders, MCP
  action, public skills and renderer wrapper have separate named owners.
- **Cumulative Knowledge:** Visualization is derived and never writes Hub.
- **Specification and Verification:** Capability 045 and AB-VIS requirements
  precede implementation; deterministic gates precede model qualification.
- **Dependency approval:** Owner approval of this plan authorizes the one pinned
  Three.js dependency already verified in the company registry audit.

### After design

All gates pass. The design adds no competing knowledge store or implicit
lifecycle authority. Diagram-design is narrowed behind AgentBase topology, and
the 3D site remains a replaceable presentation artifact.

## Design Decisions

### 1. Add a projection beside, not inside, query behavior

Keep `loadHubGraph` as the parsing boundary. A new projection filters governance
documents, validates one Domain, resolves active Question badges and converts
accepted relations through a single predicate descriptor registry. Direct
cross-Domain endpoints become non-expandable boundary nodes; traversal stops at
that edge.

### 2. Add one tool with two explicit modes

`prepare_hub_visualization` returns a bounded packet in `diagram` mode and
atomically writes a complete static build in `domain-site` mode. No raw node,
edge, traversal or layout tools are exposed.

### 3. Narrow the upstream diagram skill

`use-diagram-design` carries only the approved Architecture, Dependency and
Sequence instructions/assets. It consumes an immutable packet; free-form
reasoning may style but may not change topology.

### 4. Generate a dependency-light 3D site

Tracked native browser assets import a copied local Three.js module. The site
uses a seeded stable layout and DOM controls for search/filter/sidebar. No
React, Vite, force simulation package or backend is introduced.

### 5. Qualify code before replacing knowledge

First pass deterministic fixtures and renderer boundaries. Then reset only Hub
knowledge through Git and ingest the richer eight-repository Sock Shop Domain.
README, CI, Git history and recoverability remain intact.

### 6. Keep service dependency at the useful System boundary

The qualification batch represents each independently useful microservice as a
System. Extend only System relationship guidance with `consumes -> Interface`
so exact runtime-call evidence can supply Dependency edges. Do not add duplicate
Components, generic System-to-System `depends-on`, or reinterpret Flow steps as
dependency predicates.

## Failure and Recovery

| Failure | Required result |
|---|---|
| Published commit changes mid-read | Stop; no mixed snapshot or output. |
| Missing/oversized topology | Return exact insufficiency/bound failure. |
| Unsafe or non-empty site target | Stop before writing target bytes. |
| Site staging/render/digest failure | Remove staging; preserve existing target. |
| Three.js asset unavailable/drifted | Stop with local dependency instruction. |
| Diagram renderer changes packet topology | Qualification fails; do not release skill. |
| Browser lacks WebGL | Show readable unsupported-browser message. |

## Project Structure

```text
docs/present/13-visualizing-published-knowledge.md
docs/design/13-visualization/
specs/045-visualize-published-hub/

src/core/knowledge/visualization/
├── predicate-descriptors.ts
└── published-projection.ts

src/app/hub-okf/visualization/
├── diagram-packet.ts
├── domain-site.ts
├── domain-site-assets/
│   ├── app.js
│   └── app.css
└── visualization.test.ts

.agents/skills/
├── agentbase-diagram/
├── agentbase-domain-site/
└── use-diagram-design/
```

**Structure Decision:** Preserve the modular monolith. Core owns deterministic
knowledge projection; the Hub application owns local presentation artifacts;
MCP wiring stays in the existing Hub tool owners.

## Complexity Tracking

No constitution violation or justified complexity exception.
