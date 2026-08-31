# 06 — Visualization

> Status: Published projection, focused diagrams and explicit static Domain-site
> generation are implemented.

## Outcome

AgentBase turns the same exact Published knowledge into two visual products:

- a focused Architecture, Dependency or Sequence diagram during a question;
- a one-shot static 2D site for exploring one Domain.

Both use one evidence-preserving Published projection. They never read Local
Draft, invent topology or become a second knowledge authority.

## Focused diagrams

The user asks about a bounded part of the system. AgentBase selects related
concepts and accepted relations, then renders a suitable diagram. Architecture
may be partial; Dependency requires real dependency/runtime edges; Sequence
requires evidenced ordered Flow steps. Missing data produces a partial result
or explicit insufficient-data outcome.

## Static Domain site

The user explicitly requests a fixed site for one Domain and Published commit.
The output is a local, reviewable build that works without MCP, Hub credentials
or a live service. The user may copy it to a separately governed repository and
publish it, but AgentBase neither creates that repository nor pushes or enables
Pages automatically.

New Published knowledge requires a new generation. The site is not a watcher,
dashboard or live mirror.

## Knowledge and presentation boundary

Concepts, accepted relation direction, provenance, Flows, Questions and visible
omissions come from the Published projection. Colors, layout and coordinates are
presentation state and never enter the Hub.

The Domain is page context rather than a repeated graph node. A Repository is
shown as a compact selectable card inside its fixed grouping region, whose
boundary does not grow during interaction. Repository-owned knowledge may be
repositioned within that region, while shared, multi-repository and external
knowledge is labeled and remains outside it. Reloading or resetting the map
restores the deterministic generated layout; presentation coordinates never
enter Published knowledge.

Embedded knowledge remains owned by its parent Markdown concept. The Published
projection may render a concrete, exactly sourced embedded resource as a
visually distinct presentation-only reference when that dependency makes the
map useful. This does not promote the resource, create another document or
invent a runtime relation; an `embedded-in` link records only its published
parent context. A directly related concept from another Domain may appear as a
boundary endpoint, but the view does not traverse and import that Domain.

Evidence-backed `Embedded Relations` may add runtime arrows between the parent,
its embedded references and exact admitted concept identities. They are
presentation-only, never canonical OKF relationships, and unresolved endpoints,
unsupported predicates or missing evidence are omitted rather than inferred.

Ordered Flow steps are visible on first view and remain separately toggleable
from stable runtime relations. A Flow is presented as the label for those
ordered arrows rather than an isolated circular node. Selecting a System makes
its direct Published members stand out without converting hidden structural
containment into runtime topology.

Presentation-only resources are scoped to their parent unless Published
knowledge carries the same exact strong external identity. Equal names never
cause grouping. Evidence summaries may group citations by repository file for
readability while retaining every exact source behind an explicit disclosure.

Before generation or publication, AgentBase warns that output visibility must
be at least as restricted as the Published knowledge it copies.

## Non-goals

- Full-Hub or live multi-Domain UI.
- Automatic topology completion.
- Another graph database, watcher, daemon or live server.
- Automatic Domain-site repository creation, push or publication.
- Writing presentation settings into OKF.

## Downstream Capability Contract

- [Published visualization](../capabilities/13-visualization/README.md)
