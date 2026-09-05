# 04.02 — Selection, disposition and uncertainty

> Status: Implemented for single-repository Init; Group 5 dossier disposition is
> implemented and verified.

```text
evidence-bearing candidates/observations
        ↓ one bounded guidance call
technology detection → standalone/dossier disposition → generic role
        ↓
MCP-rendered editable OKF skeletons
        ↓
Agent enrichment → changed-document validation
```

A candidate needs a stable identity basis, independent query/link value and
exact owned evidence. The caller may not assert a provider/product/schema to
override mapping. Outcomes are `exact`, `suggested`, `embedded`, `ambiguous` or
`unsupported`; there is no confidence number.

- `exact/suggested`: may create a skeleton for a released role.
- `embedded`: keep it in the Repository dossier or another useful parent; do not
  create a separate file.
- `ambiguous/unsupported`: retain evidence plus limitation/Question; do not
  force it into a similar type.

A suggested role always carries a proposal-review limitation. Exact structured
mapping is preferred when source supports it, but omitted low-value evidence is
only a coverage diagnostic and does not make a truthful partial proposal invalid.

Schema selection occurs only after standalone promotion. A catalog role does not
justify a document or path; compact Profile placement uses `knowledge/` for all
promoted non-Repository/non-Domain/non-Question roles.
