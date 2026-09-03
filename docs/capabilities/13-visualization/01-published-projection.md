# 13.01 — Published visualization projection

## Source authority

Input is one exact synchronized Published Hub commit plus an exact Domain ID.
Frontmatter `status` does not choose Published versus Draft; Git commit identity
does. The projection never reads the active proposal tree.

## Node admission

Projection admits Published concepts that pass the node-eligibility gate as
concept nodes. It may additionally expand a standardized Embedded Knowledge row
with a concrete kind and resolved Published evidence into a presentation-only
resource reference. That reference is visibly marked `embedded`, links only to
its owning concept through `embedded-in`, and does not acquire an OKF identity,
document or canonical runtime relation. Generic rows, unresolved evidence and
governance documents are not expanded. `Resource` concept nodes continue to use
a provider-neutral role and may represent a queue/topic when identity,
query/link value and boundary evidence are sufficient.

## Output

One deterministic projection contains:

- commit and Domain identity;
- concept nodes with ID, path, type, title, description and parents;
- evidence-backed embedded resource references with their owning document,
  concrete kind and exact sources;
- direct cross-Domain endpoints marked as non-expandable boundary nodes;
- accepted relationship edges with predicate, declared endpoints, display
  endpoints, evidence IDs and direction class;
- ordered `flow_steps` with action, mode and evidence;
- counts of open/needs-review Questions attached to their subject;
- explicit omissions and insufficiency reasons.

An embedded reference is parent-scoped by default. If two Published rows carry
the same exact normalized ARN, the projection may coalesce them into one visual
reference with every owner and source retained. Equal names, technology labels
or source-local addresses never cause cross-parent grouping.

Question and Maintainer Guidance documents are not normal graph nodes. Resolved
Questions are not shown. A relation candidate is metadata only until it becomes
an accepted canonical relation.

An optional `Embedded Relations` table may add presentation-only runtime edges.
Each row names `Source`, `Relation`, `Target` and `Evidence`. `self` resolves to
the containing concept, an exact admitted concept identity resolves directly,
and a name resolves only to one unique embedded row in the same parent. The
bounded predicates are canonical runtime predicates plus `monitors` and
`redrives-to`; structural predicates are not admitted. Every evidence ID must
resolve through the containing Published concept. Unresolved, ambiguous,
unsupported or unevidenced rows are omitted with a warning.

The selected Domain owns primary nodes. A valid accepted edge from a primary
node to another Domain retains the direct endpoint as a boundary node and stops
there. Its Domain membership remains unchanged; the projection does not traverse
or import the external Domain neighborhood.

## Predicate directions

The descriptor registry remains the direction owner for canonical predicates.
A valid `Embedded Relations` row is the only additional, presentation-only
direction authority; its declared source and target are preserved.

| Predicate | Display direction |
|---|---|
| `part-of`, `implemented-in`, `declared-by`, `deployed-as`, `runs-on` | structural, no runtime arrow |
| `provides`, `consumes`, `depends-on`, `publishes-to`, `writes-to` | declared subject → object |
| `triggered-by` | object → subject |
| `reads-from` | object → subject |
| `monitors`, `redrives-to` | embedded-relation source → target |

Every `flow_steps` entry renders its recorded `source → target`; the Agent may
not reverse or invent it.

Service-level runtime dependency uses the same accepted predicate authority: an
evidenced `System consumes Interface` relation is a directed runtime edge. Flow
steps remain sequence authority and are not silently converted into a different
dependency predicate.

## Determinism and bounds

Concept IDs derive from existing concept IDs and declared endpoints. Embedded
reference IDs derive from exact strong identity when present, otherwise from
their parent plus row identity. Same commit, Domain and request produce
byte-equivalent ordered JSON/YAML. Query packets are bounded to an explicit
selection; Domain snapshots include the complete Published Domain within
configured document/node/edge limits. Exceeding a bound returns an actionable
failure rather than silently truncating topology.

Layout, colors and x/y/z coordinates are presentation state and never enter OKF.
The static renderer may omit the Domain node because the whole page represents
that Domain, render Repository concepts as fixed grouping regions, and suppress
structural links already expressed by containment. Multi-repository, shared and
external nodes remain outside repository regions. This changes no projection
membership, identity or canonical relationship.
