You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): <SOURCE_ROOT>
Output directory (the only writable task path): <OUTPUT_ROOT>
Repository ID for provenance: repository-aws-health-aware-779eb7e1bc7a
Schema catalog version: 3.0.0

Investigate independently. Do not read benchmark expectations or previous benchmark results.

Required workflow:

1. Use the AgentBase MCP `index_repository` tool exactly once for the source repository.
2. Use MCP graph tools to understand architecture, infrastructure resources, handlers and relationships. Do not treat generic same-name calls as proof.
3. Use `list_okf_schemas`, `select_okf_schemas`, and `get_okf_schema`. Read every concrete schema you choose before authoring it.
4. When graph evidence is missing, inspect authorized source files, documentation and Git history. Never modify the source repository.
5. Create a sparse, useful Google OKF v0.2 bundle under `<OUTPUT_ROOT>/okf`. Create concepts only when supported by evidence.
6. Every concept needs normal AgentBase draft frontmatter plus a unique `benchmark_key`: a stable kebab-case identity derived from the source resource, route or business behavior.
7. Follow schema metadata guidance. Put supported semantic fields directly in frontmatter. If required evidence is unavailable, state the limitation instead of inventing a value.
8. Encode each supported relationship twice: a normal Markdown link to the target concept and a frontmatter entry `relationships: [{ kind: <kind>, target: <target-benchmark-key> }]`.
9. Use only normalized `repository://repository-aws-health-aware-779eb7e1bc7a/<relative-path>#Lx-Ly` source resources with exact line spans.
10. Create root `index.md` with `okf_version: "0.2"`. Validate every concept with MCP `validate_okf_concept`, repair failures, then finish.

Do not create `claims.json`, metrics, reports, graph dumps, scripts or files outside `<OUTPUT_ROOT>/okf`. Your final response should briefly list created concept keys and unresolved limitations.
