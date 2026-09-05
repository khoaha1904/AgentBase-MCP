# 06 — Visualization

> Status: Published projection, focused diagrams and explicit static Domain-site
> generation are implemented. Exact-proposal semantic impact and its bounded
> text preview are implemented; optional visual proposal rendering remains
> deferred. G4-C4 Profile Domain projection and G5-C1 compact
> Domain/Repository projection are implemented and verified.

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

Every generated site visibly identifies its exact Published Hub commit and
states that it is generated presentation rather than AgentBase-Hub authority.
Removing that marker is a downstream publishing decision outside AgentBase; the
generator never presents a hosted page as proof that the underlying Hub is
public or current.

## Proposal review impact preview

The Knowledge Lifecycle may request one deterministic before/after view for an
exact finalized proposal. It may show changed concepts, accepted relation
direction, affected Domain/Repository boundaries, Questions, dangling
references and omissions. It reads the exact proposal/base only, carries their
digests and is discarded after review. Local Draft never enters ordinary
Published visualization, and the preview never substitutes for Git diff or
maintainer approval.

## Knowledge and presentation boundary

Concepts, accepted relation direction, provenance, Flows, Questions and visible
omissions come from the Published projection. Colors, layout and coordinates are
presentation state and never enter the Hub.

After Group 4 delivery, a Domain view starts from the corresponding Domain
Capsule. Shared and other-Domain concepts appear only as evidenced boundary
endpoints. Their visual placement never rehomes, copies or imports their
knowledge into the selected capsule.

The compact Profile target discovers roles from frontmatter rather than folder
names. Domain `index.md` supplies page context; Repository dossiers supply the
default human-readable Repository view, while independently useful documents in
`knowledge/` become graph/detail views only when their accepted identities and
relations justify them. Embedded dossier sections may be presented as bounded
details but never become synthetic canonical nodes.

The Domain is page context rather than a repeated graph node. A Repository is
shown as a compact selectable card inside its fixed grouping region, whose
boundary does not grow during interaction. Repository-owned knowledge may be
repositioned within that region, while shared, multi-repository and external
knowledge is labeled and remains outside it. Reloading or resetting the map
restores the deterministic generated layout; presentation coordinates never
enter Published knowledge.

An outside node related to one Repository is placed beside that Repository
region. A node related to multiple Repositories is placed between their regions;
only an outside node with no related Repository falls back to the shared
external lane. Placement uses Published relation endpoints and never changes
membership or infers topology.

Repository regions use a deterministic relation-aware ring when three or more
Repositories are visible. The ring keeps cross-repository arrows out of
unrelated Repository regions; one- and two-Repository maps retain the compact
linear arrangement. This is presentation state only and does not imply an
architectural order.

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
- Treating generated site or proposal-preview visibility as knowledge
  authority, access policy or publication state.

## Downstream Capability Contract

- [Published visualization](../capabilities/13-visualization/README.md)
