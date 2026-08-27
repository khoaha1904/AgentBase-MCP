# Capability 050 — Domain node details

> Status: implemented and qualified.

## Objective

Make the generated static Domain map useful for browsing the complete Published
Domain context: every eligible knowledge concept is visible as a circular node,
selection opens a right-side overview, and a document action opens a readable
Published overview without introducing live Hub access or duplicated Hub fields.

## Owner decisions

- Query quality capability 049 is complete and is the scope authority reused by
  this feature.
- All non-governance concepts eligible for the selected Domain—canonical
  members, Repository-associated concepts and direct boundary endpoints—appear
  in the map immediately.
- Nodes are circular and their labels appear below the circle.
- Selecting a node opens a dismissible right-side drawer with its overview and
  direct accepted relations.
- `View document` opens an overlay assembled from the existing Published
  projection. It is explicitly an overview, not a second persisted `summary`
  field and not arbitrary HTML rendering of Hub Markdown.

## User scenarios

### US1 — See complete Domain knowledge (P1)

A maintainer opening a Domain map sees every eligible non-governance concept,
including concepts associated through a Repository, without first expanding
high-level nodes.

**Acceptance:** The initial node count equals the bounded Domain projection;
unrelated Domain neighborhoods remain absent and direct external endpoints
remain boundary nodes.

### US2 — Inspect a meaningful node (P1)

A maintainer selects any node and sees a right-side drawer containing title,
type, description, identity, membership, Questions and direct relations using
readable neighboring titles and stored direction.

**Acceptance:** The drawer opens on selection, can be closed, and selection does
not invent or recursively traverse relations.

### US3 — Read a document overview (P2)

A maintainer selects `View document` and sees a modal overview of the selected
Published concept without leaving the static page.

**Acceptance:** The overlay presents existing title, description, identity,
sources and direct relations as text, closes by button or Escape, and executes
no HTML from knowledge content.

## Requirements

- **FR-001** — The initial map MUST show every non-governance node admitted by
  the selected Domain scope and MUST NOT require lazy expansion to reveal them.
- **FR-002** — Domain eligibility MUST reuse canonical member,
  Repository-associated and one-hop boundary evidence; unrelated Domain
  neighborhoods MUST remain excluded.
- **FR-003** — Every graph node MUST use a circular visual body with its readable
  label below it while preserving type, boundary, Question and selection cues.
- **FR-004** — Node selection MUST open a dismissible right-side drawer with a
  bounded overview and direct stored relations.
- **FR-005** — Relation text MUST name readable endpoints, predicate and stored
  direction; missing topology MUST NOT produce relation text.
- **FR-006** — `View document` MUST open a bounded text-only overlay derived
  from existing Published projection values and MUST NOT add a Hub field,
  execute knowledge HTML or require a live endpoint.
- **FR-007** — Search, filters, 1–2 hop focus, reset, Flow toggle, Question
  badges, static/offline operation and exact Published attribution MUST remain.
- **FR-008** — The change MUST add no dependency, MCP tool, Markdown renderer,
  persisted layout, durable index, watcher or automatic publication.

## Edge cases

- A node without description or relations still opens a useful drawer and
  document overview with an explicit empty-state message.
- Closing the drawer clears selection; opening another node replaces its content.
- On narrow screens the drawer overlays the map rather than disappearing.
- A Domain at the existing node bound either renders completely or generation
  fails visibly; the browser never silently drops nodes.

## Success criteria

- **SC-001** — A fixture with canonical, Repository-associated and boundary
  concepts shows 100% of expected nodes on first render and zero unrelated
  Domain concepts.
- **SC-002** — Static asset checks prove circular nodes, labels below, drawer
  open/close and a text-only document overlay.
- **SC-003** — Existing visualization, query and Published-only tests remain
  green under the canonical repository gate.
- **SC-004** — Generated output stays deterministic and contains no credential,
  machine path, live endpoint or executable knowledge markup.

## Non-goals

- Rendering arbitrary Markdown as HTML, copying full frontmatter into the site,
  full-Hub navigation, Draft overlay, live search or automatic Pages deployment.
- Promoting Questions or Maintainer Guidance into default graph nodes.

## Implementation evidence

- Visualization projection and generated static-site tests pass with complete
  Domain-scope node admission, circular node styling, drawer controls and
  text-only document dialog assertions.
- Full repository test suite passes (82 tests), with no new dependency or MCP
  contract change.
