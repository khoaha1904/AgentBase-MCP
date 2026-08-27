# 13.01 — Published visualization projection

## Source authority

Input is one exact synchronized Published Hub commit plus an exact Domain ID.
Frontmatter `status` does not choose Published versus Draft; Git commit identity
does. The projection never reads the active proposal tree.

## Node admission

Projection chỉ nhận concept đã Published và vượt node-eligibility gate. Embedded
knowledge, governance documents và unresolved candidates không phải nodes; chúng
chỉ xuất hiện qua parent overview/query hoặc omissions. `Resource` nodes dùng
role provider-neutral và có thể đại diện queue/topic khi identity, query/link
value và boundary evidence đầy đủ.

## Output

One deterministic projection contains:

- commit and Domain identity;
- concept nodes with ID, path, type, title, description and parents;
- direct cross-Domain endpoints marked as non-expandable boundary nodes;
- accepted relationship edges with predicate, declared endpoints, display
  endpoints, evidence IDs and direction class;
- ordered `flow_steps` with action, mode and evidence;
- counts of open/needs-review Questions attached to their subject;
- explicit omissions and insufficiency reasons.

Question and Maintainer Guidance documents are not normal graph nodes. Resolved
Questions are not shown. A relation candidate is metadata only until it becomes
an accepted canonical relation.

The selected Domain owns primary nodes. A valid accepted edge from a primary
node to another Domain retains the direct endpoint as a boundary node and stops
there. Its Domain membership remains unchanged; the projection does not traverse
or import the external Domain neighborhood.

## Predicate directions

The descriptor registry is the only presentation-direction owner.

| Predicate | Display direction |
|---|---|
| `part-of`, `implemented-in`, `declared-by`, `deployed-as`, `runs-on` | structural, no runtime arrow |
| `provides`, `consumes`, `depends-on`, `publishes-to`, `writes-to` | declared subject → object |
| `triggered-by` | object → subject |
| `reads-from` | object → subject |

Every `flow_steps` entry renders its recorded `source → target`; the Agent may
not reverse or invent it.

Service-level runtime dependency uses the same accepted predicate authority:
an evidenced `System consumes Interface` relation is a directed runtime edge.
Flow steps remain sequence authority and are not silently converted into a
different dependency predicate.

## Determinism and bounds

IDs derive from existing concept IDs and declared endpoints. Same commit,
Domain and request produce byte-equivalent ordered JSON/YAML. Query packets are
bounded to an explicit selection; Domain snapshots include the complete
Published Domain within configured document/node/edge limits. Exceeding a bound
returns an actionable failure rather than truncating topology silently.

Layout, colors and x/y/z coordinates are presentation state and never enter OKF.
