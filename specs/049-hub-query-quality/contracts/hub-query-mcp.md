# MCP Contract: Published Hub Search and Read

## Compatibility

Tool names and existing input fields remain unchanged:

- `search_hub_okf`
- `read_hub_okf_concept`

Search output changes are additive. Exact read output is unchanged.

## `search_hub_okf`

### Input

```json
{
  "query": "order queue consumer",
  "domain": "domains/commerce",
  "types": ["Component", "AWS::SQS::Queue"],
  "global": false,
  "limit": 5
}
```

Rules:

- `query`: 1–256 characters of free text or an exact identity/path/title.
- `domain`: optional exact Domain identity/path.
- `types`: optional 1–32 exact type values.
- `global`: optional explicit broad-search acknowledgement.
- `limit`: optional 1–100, default remains 20.
- No Lucene/library syntax is exposed. Prefix/fuzzy operators are not public.

### Successful discovery

```json
{
  "status": "ok",
  "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "matches": [
    {
      "identity": "components/orders-api",
      "path": "components/orders-api.md",
      "type": "Component",
      "title": "Orders API",
      "description": "Checkout entrypoint.",
      "domains": ["domains/commerce"],
      "rank": 2,
      "matchedBy": "body",
      "excerpt": "Creates an order and publishes OrderPlaced to the orders queue.",
      "relevance": {
        "method": "bm25+",
        "score": 4.12,
        "matchedFields": ["body", "relation"],
        "matchedTerms": ["order", "queue"]
      },
      "section": {
        "headingPath": ["Orders API", "Events"],
        "ordinal": 2,
        "omittedMatches": 1
      },
      "scope": {
        "domain": "domains/commerce",
        "role": "member"
      },
      "context": [
        {
          "kind": "relationship",
          "predicate": "publishes-to",
          "source": "components/orders-api",
          "target": "resources/orders-queue",
          "direction": "outbound",
          "evidence": ["queue-send"]
        }
      ],
      "contextOmitted": 0
    }
  ]
}
```

Compatibility rules:

- Existing summary fields, `rank`, `matchedBy` and optional `excerpt` remain.
- `relevance`, `section`, `scope`, `context` and `contextOmitted` are
  additive and may be absent when not applicable.
- One concept occurs once even when several sections match.
- Exact identity/path/title results precede lexical results.
- Library scores compare results only within one response and are not durable
  knowledge or cross-commit metrics.

### Scope clarification

Existing shape remains:

```json
{
  "status": "scope_required",
  "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "candidateDomains": []
}
```

No concept bodies or Local Draft data are returned in this state.

## `read_hub_okf_concept`

Input remains one normalized Published Markdown path:

```json
{ "path": "components/orders-api.md" }
```

Output remains:

```json
{
  "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "path": "components/orders-api.md",
  "excerpt": "---\ntype: Component\n...\n"
}
```

Despite the legacy `excerpt` property name, the value is the complete bounded
Markdown document. It comes from the same exact synchronized Published authority
as search.

## Errors and bounds

- Invalid query/domain/type/result/document bounds remain explicit errors.
- Oversized or invalid Published concepts keep existing safe behavior.
- Search never falls back to working-tree, Local Draft or remote-candidate bytes.
- Search/read cause no source probe, network request, mutation or write-back.
