# Data Model: Hub Query Quality

All values are transient projections from one exact synchronized Published
commit. None are persisted into AgentBase-Hub.

## Published concept record

Represents one valid non-reserved OKF Markdown concept.

| Field | Type | Rule |
|---|---|---|
| `commit` | 40-hex string | Same admitted Published commit for every record in one request |
| `identity` | string | Existing concept ID derived from path |
| `path` | normalized relative `.md` path | Unique inside the bundle |
| `type` | string | Required OKF field |
| `title` | string | Frontmatter title, first H1 or identity fallback |
| `description` | string | Existing OKF one-line summary or empty |
| `tags` | string[] | String entries only, normalized/deduplicated for search |
| `sections` | Markdown section[] | Ordered, bounded, at least root when body text exists |
| `outboundLinks` | concept identity[] | Resolved portable Markdown links only |
| `domains` | Domain identity[] | Canonical `part-of` membership only |

Invalid or oversized concepts keep current safe omission behavior.

## Markdown section

Represents a retrieval unit within one concept body.

| Field | Type | Rule |
|---|---|---|
| `id` | string | Deterministic from concept identity and ordinal |
| `conceptIdentity` | string | Existing parent concept |
| `ordinal` | non-negative integer | Source order; unique within concept |
| `headingPath` | string[] | Active H1-H6 hierarchy before this text |
| `text` | string | Original section text used for excerpts |
| `searchText` | string | Deterministically normalized index input |

Heading changes start a new section. Heading text remains in `headingPath` and
is searchable. Content before the first heading uses an empty heading path.
Empty sections are omitted. Sections never become public concept identities.

## Search index record

Library-facing projection for one Markdown section.

| Field | Source |
|---|---|
| `id` | Markdown section ID |
| `conceptIdentity` | parent concept |
| `identityPathTitle` | concept identity, path and title |
| `description` | concept description |
| `typeTags` | type and tags |
| `heading` | joined heading path |
| `body` | section search text |
| `linkContext` | resolved portable link endpoint identity/title |
| `relationContext` | accepted predicate/action/mode and endpoint identity/title |

Arbitrary frontmatter, sources/evidence text and actor metadata are excluded.

## Exact address match

Pre-index match for exact identity, path or title.

| Field | Rule |
|---|---|
| `kind` | `identity`, `path` or `title` |
| `conceptIdentity` | one exact Published concept |
| `precedence` | identity/path before title, all before lexical results |

Ambiguous exact titles use canonical path as deterministic order and do not
silently become an identity.

## Lexical section hit

Raw established-engine result before concept collapse.

| Field | Rule |
|---|---|
| `sectionId` | resolves to one Markdown section |
| `score` | finite non-negative library score |
| `matchedTerms` | bounded normalized terms from engine match metadata |
| `matchedFields` | allowlisted indexed fields only |

Prefix, fuzzy and stemming expansion are initially disabled.

## Public concept match

One public result after exact/lexical ordering and section collapse.

| Field | Rule |
|---|---|
| existing concept summary fields | preserved |
| `rank` / `matchedBy` | existing compatibility fields retained |
| `relevance` | additive method, score and bounded matched fields/terms |
| `section` | additive best heading path, ordinal and omitted match count |
| `excerpt` | bounded original text around a real matched term |
| `scope` | additive Domain eligibility reason when scoped |
| `context` | bounded portable links/canonical relations/Flow steps |
| `contextOmitted` | non-negative count |

One concept appears at most once. Exact matches precede lexical matches;
lexical ties end with canonical path order.

## Domain eligibility

| Role | Meaning |
|---|---|
| `member` | Canonical `part-of` traversal reaches selected Domain |
| `repository-associated` | Accepted structural chain reaches a Repository that is a Domain member |
| `boundary` | One direct accepted relation/Flow connects to an eligible concept |

Role is query evidence only and never changes stored relationships. Boundary
expansion stops at one endpoint.

## Direct context item

Discriminated union:

- `link`: portable OKF outbound link or derived backlink; untyped.
- `relationship`: accepted AgentBase predicate with source, target, direction
  and evidence IDs.
- `flow-step`: accepted Flow identity/order/action/mode/source/target and
  evidence IDs.

All context arrays are deterministic, bounded and include an omitted count.

## State flow

```text
Published Markdown
  → valid concept records
  → heading-aware section/index records
  → exact lookup or lexical section hits
  → one collapsed concept match
  → optional exact Markdown read
```

No state transition writes to the Hub. A new Published commit creates a new
transient projection on the next request. The process may retain exactly one
complete projection keyed by commit. A replacement becomes visible only after
its graph, sections and lexical index all build successfully; failure cannot
relabel or reuse the prior projection for the new commit.
