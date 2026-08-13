# Open Knowledge Format Reference

- **Reviewed:** 2026-08-12
- **Target:** Google Open Knowledge Format `v0.2`
- **Pinned source commit:** `3fcbb9f828c2f23d109c855ee403c3a4c81f3a96`
- **Reusable pattern record:**
  `/home/khoa/workspace/agentstack/docs/patterns/open-knowledge-format.md`

## Normative source

- Specification:
  <https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md>
- Reference implementation and samples:
  <https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf>
- Google Cloud announcement:
  <https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing/>
- LLM Wiki pattern formalized by OKF:
  <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>

## AgentBase meaning

In AgentBase, “OKF” means a conformant Open Knowledge Format bundle, not one
custom `OKF.md` summary.

The minimum shape is:

- one directory tree as the knowledge bundle;
- one non-reserved Markdown file per concept;
- parseable YAML frontmatter and a non-empty `type` on every concept;
- bundle-relative file paths as concept IDs;
- standard Markdown links between related concepts;
- optional `index.md` for progressive disclosure and `log.md` for chronological
  changes, using their reserved structures;
- bundle-root `index.md` declaring `okf_version: "0.2"` for AgentBase output.

AgentBase-generated first drafts explicitly use `status: draft` and record a
`generated` actor/time. Important claims use `sources` and stable source IDs;
per-claim attribution may use matching Markdown footnotes. Human review uses
`verified` only after a person or process actually checks the concept.

Types such as `Software Repository`, `Software Component`, `Software Flow`,
`External Dependency`, `Open Question` or `Maintainer Guidance` are AgentBase
producer conventions. OKF deliberately does not register a universal type
taxonomy, and consumers must tolerate unknown types and extension fields.

## Non-equivalences

- OKF is a format, not the Code Intelligence graph.
- OKF is not a model, RAG system, database, Hub or review workflow.
- Conformance does not prove semantic correctness.
- A single Markdown report with custom JSON comments and protected ranges is not
  the AgentBase OKF target.
- Single-file atomic replacement does not solve bundle-level proposal recovery.
- Previous generated concepts are continuity context, not independent sources.

## Version rule

Do not silently follow the moving upstream `main`. A future OKF version requires
a source refresh, compatibility review and explicit change to the bundle-root
version. This reference and Capability 002 remain pinned to `v0.2` until then.
