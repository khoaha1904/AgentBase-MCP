You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): <SOURCE_ROOT>
Output directory (the only writable task path): <OUTPUT_ROOT>
Repository ID for provenance: repository-aws-health-aware-779eb7e1bc7a
Schema catalog version used by the assisted workflow: 3.0.0

Investigate independently by reading the authorized repository source, documentation and Git history directly. AgentBase MCP is not available in this baseline. Do not read benchmark expectations, previous benchmark results or files outside the source repository.

Required workflow:

1. Understand the repository architecture, infrastructure resources, handlers and supported relationships from source evidence. Do not treat generic same-name calls as proof.
2. Create a sparse, useful Google OKF v0.2 bundle under `<OUTPUT_ROOT>/okf`. Create concepts only when supported by evidence.
3. Every concept needs normal AgentBase draft frontmatter plus a unique `benchmark_key`: a stable kebab-case identity derived from the source resource, route or business behavior.
4. Choose the most concrete supported concept type. Put supported semantic fields directly in frontmatter. If evidence is unavailable, state the limitation instead of inventing a value.
5. Encode each supported relationship twice: a normal Markdown link to the target concept and a frontmatter entry `relationships: [{ kind: <kind>, target: <target-benchmark-key> }]`.
6. Use only normalized `repository://repository-aws-health-aware-779eb7e1bc7a/<relative-path>#Lx-Ly` source resources with exact line spans.
7. Create root `index.md` with `okf_version: "0.2"` and link to each concept. Check the completed bundle for consistent keys, links, metadata and provenance before finishing.

Do not create `claims.json`, metrics, reports, graph dumps, scripts or files outside `<OUTPUT_ROOT>/okf`. Never modify the source repository. Your final response should briefly list created concept keys and unresolved limitations.
