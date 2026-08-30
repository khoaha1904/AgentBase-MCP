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

Embedded knowledge is available through its parent rather than drawn as a fake
node. A directly related concept from another Domain may appear as a boundary
endpoint, but the view does not traverse and import that Domain.

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
