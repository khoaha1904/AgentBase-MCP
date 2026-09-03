# 08.05 — Sensitive-value filtering

> Status: Repository authoring/publication guards and query redaction are implemented.

## One shared guard

Authoring, proposal validation, Hub query and current-source response reuse one
bounded obvious-sensitive guard over property/field name and candidate value.
It rejects credentials, tokens, private keys, passwords, connection strings,
signed URLs and equivalent obvious secret material. It is not a generic DLP
engine.

- Ingest/Refresh filters an unsafe candidate entry, reports a warning and keeps
  other safe entries/concepts progressing;
- if an unsafe entry is nevertheless present after authoring/manual edit,
  proposal validation blocks the whole proposal until it is removed;
- query redacts only an offending value and continues returning safe concept
  knowledge, provenance and a sensitivity warning;
- current-source read refuses known secret-bearing paths and filters its answer;
- removal from Published Hub uses a reviewed proposal, and credential rotation
  remains an external owner action.

Source references may state that a system uses Parameter Store/secret storage,
but never include or retrieve the secret value. Hub access is one shared trust
boundary; no per-Domain or per-field ACL is added.
