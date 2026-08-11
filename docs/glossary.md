# Glossary

- **Code Intelligence:** Local indexing and queries used to navigate source
  structure and relationships while coding.
- **Engine:** A replaceable implementation that parses source and maintains the
  detailed graph, such as a supported Codebase Memory MCP version.
- **Adapter:** AgentBase-owned code that presents one stable contract over an
  engine and translates engine output.
- **Local graph:** Detailed, disposable, machine-local data optimized for coding
  navigation. It is not shared OKF knowledge.
- **Observation:** A normalized, provenance-bearing claim selected from local
  graph or authorized investigation evidence.
- **OKF:** The durable, governed knowledge representation produced from reviewed
  observations and investigation.
- **Ingest:** One evidence round that proposes additions or changes against
  existing knowledge.
- **Re-ingest:** A later ingest that starts from existing OKF state and adds
  support, conflict or review signals rather than replacing everything.
- **Detach:** An explicit governed action that stops relying on prior evidence
  without pretending it never existed.
- **Stale:** Knowledge whose supporting evidence may no longer describe the
  current source revision and therefore requires re-verification.
- **Conformance suite:** Engine-independent fixtures and assertions that define
  what an adapter must provide to AgentBase.
