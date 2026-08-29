# 13 — Visualizing Published Knowledge

AgentBase has two ways to turn Published knowledge into visuals. They use the
same data but serve different purposes.

## 1. Draw a diagram while asking a question

`agentbase-diagram` is a lightweight workflow. The user asks about a specific
part; AgentBase selects related concepts/relations and draws one of the first
three types:

- Architecture: the main components and boundaries;
- Dependency: which component depends on which;
- Sequence: the order in which a flow runs.

The diagram describes only data with evidence. Missing relations produce a
partial diagram or an insufficient-data notice; the Agent does not connect
nodes merely to make the picture look complete.

## 2. Generate a Domain site once

`agentbase-domain-site` is a heavy workflow and runs only on an explicit user
request. It generates a static 2D knowledge map for one Domain from one exact
Published Hub commit. The site immediately shows every valid concept in Domain
scope, using labeled circular nodes, search/filter/focus/Flow toggles, a right-
side overview drawer and a document-overview overlay for the selected node.

The result is a fixed build directory. The user can review it, copy it to a
separate repository such as `Domain-Hub` and publish it with GitHub Pages. After
generation, the site needs no MCP, token or Hub connection; new data therefore
requires another generation.

## One shared data source

```text
Published OKF commit
        ↓
Published visualization projection
        ├── bounded packet → diagram
        └── full Domain snapshot → static 2D site
```

The projection keeps concepts, relations, direction, provenance and open
Questions. It does not store colors, coordinates or layout in the Hub. An
unaccepted relation candidate does not become an edge.

Projection nodes are concepts that pass the node-eligibility gate. Embedded
knowledge remains queryable in its parent but is not drawn as a fake node. When
a Resource such as SQS/SNS is promoted, the UI may show a transport node and
producer/consumer relations; a message contract is a separate node only when it
also has independent identity and query value.

A Published relation may point into another Domain. The view still belongs to
one Domain: the external end appears only as a boundary node and is not treated
as a repository in multiple Domains or used to expand the other Domain.

## Boundaries

- Read the Published Hub only; do not mix Local Draft.
- Do not replace knowledge search/query or Code Graph.
- Do not create a full-Hub UI or retain another 3D mode.
- Document overview is a text-safe overview from the Published projection; read
  the complete Markdown with `read_hub_okf_concept`.
- No watcher, daemon, live refresh or automatic Domain-site push.
- Warn before exposing internal knowledge through Pages or a broadly visible
  repository.
- Architecture may be partial; Dependency needs real edges; Sequence needs real
  `flow_steps`.

Earlier qualification used one Domain with eight repositories, runtime relations
and real Flow steps. That generated snapshot was reset to prepare a new
qualification dataset. Capability 054 uses a three-repository dataset with a
source-backed publisher/worker and SQS Resource, then regenerates
`domain-hub/crawler` only after ingest/query/projection checks pass. This
snapshot is a static Published fixture for UI review, not a new authority;
missing topology or resource evidence is reported instead of inferred.
