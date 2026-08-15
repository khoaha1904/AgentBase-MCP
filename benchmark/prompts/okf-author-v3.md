You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): {{SOURCE_ROOT}}
Output directory (the only writable task path): {{OUTPUT_ROOT}}
Repository ID for provenance: {{REPOSITORY_ID}}
Schema catalog version: {{CATALOG_VERSION}}

Investigate independently. Do not read benchmark expectations or previous benchmark results.

## Shared authoring contract

1. Before writing, make a private candidate list at stable resource or business behavior granularity. Merge duplicate views of the same thing and omit speculative concepts.
2. For every candidate, choose the most concrete supported concept type. Use only evidence-supported metadata; record limitations instead of inventing values.
3. Every concept must have normal AgentBase draft frontmatter and one unique `benchmark_key`: a stable kebab-case identity derived from its source resource, route, or business behavior.
4. Every source must use `repository://{{REPOSITORY_ID}}/<relative-path>#Lx-Ly` with normalized relative paths and exact line spans.
5. Assess the applicable relationship guidance for every candidate. Encode every evidence-supported relationship twice: `relationships: [{ kind: <kind>, target: <target-benchmark-key> }]` in frontmatter and a resolving Markdown link to the target concept. If evidence does not support a relationship, state the limitation rather than inventing one.
6. Root `index.md` must contain only: frontmatter whose sole key is `okf_version: "0.2"`; one Markdown heading; and `* [Title](relative/concept.md) - optional description` list entries after the heading. Add no root prose, paragraphs, tables, or extra frontmatter keys.
7. Before finishing, check every key, concrete type, required metadata value, source line span, relationship target, Markdown link, and root index entry for consistency. Keep the bundle sparse.

## Arm-specific workflow

1. Use the AgentBase MCP `index_repository` tool exactly once for the source repository.
2. Use MCP graph tools to understand architecture, infrastructure resources, handlers, and relationships. Do not treat generic same-name calls as proof.
3. Use `list_okf_schemas`, `select_okf_schemas`, and `get_okf_schema`. Read every concrete schema you choose before authoring it, including its metadata and relationship guidance.
4. When graph evidence is missing, inspect authorized source files, documentation, and Git history. Never modify the source repository.
5. Create the bundle only under `{{OUTPUT_ROOT}}/okf`.
6. Validate every concept with MCP `validate_okf_concept` and repair every reported failure.
7. After all concepts exist, call MCP `validate_okf_relationships` with every concept as `{ identity: <exact benchmark_key>, path: <bundle-relative path>, content: <exact full Markdown> }`. Repair every failure and repeat validation until it is valid, then perform the shared final review.

Do not create `claims.json`, metrics, reports, graph dumps, scripts, or files outside `{{OUTPUT_ROOT}}/okf`. Your final response should briefly list created concept keys and unresolved limitations.
