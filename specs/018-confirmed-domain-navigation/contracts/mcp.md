# MCP Contract: Confirmed Domain Prepare

`prepare_hub_okf` adds optional input:

```json
{
  "confirmed_domain": {
    "identity": "domains/commerce",
    "title": "Commerce"
  }
}
```

When present, a successful result includes:

```json
{
  "confirmedDomain": {
    "identity": "domains/commerce",
    "title": "Commerce",
    "evidenceResource": "agentbase://owner-guidance/domains/commerce"
  }
}
```

The result also includes `Domain` in selected schemas. The caller uses the
evidence resource as a `sources[].resource` on the Domain and on each authored
membership edge owner. Absence of `confirmed_domain` preserves existing
evidence-led behavior and does not select Domain by itself.

Malformed identity/title or extra object properties fail before the runtime
creates a session. This input grants no cloud, repository or publication
authority.
