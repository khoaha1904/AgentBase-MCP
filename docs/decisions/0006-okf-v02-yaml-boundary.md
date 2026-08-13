# ADR 0006: Use `yaml` Behind a Bounded OKF Frontmatter Adapter

- **Status:** Accepted
- **Date:** 2026-08-12
- **Capability:** `002-single-repo-okf-walking-skeleton`

## Context

Open Knowledge Format v0.2 concept files use YAML frontmatter and require
consumers to tolerate unknown extension keys. AgentBase must parse that data
without a hand-written YAML implementation, duplicate-key ambiguity, alias
expansion or accidental loss of protected human/imported content.

The boundary has two different preservation promises:

- protected documents are never parsed and reserialized during rebuild; their
  exact bytes are copied;
- a mutable AgentBase-generated draft may be reserialized, in which case
  unknown frontmatter values must remain equivalent but comments, anchors,
  quoting and key order are not promised.

## Decision

Use production dependency `yaml@2.9.0`, pinned exactly in `package.json` and
`package-lock.json`, behind `core/knowledge`. No YAML library values or AST
types may cross that capability's public entrypoint.

The adapter will:

1. reject frontmatter larger than 64 KiB before parsing;
2. call `parseDocument` with YAML 1.2 core schema, strict parsing, string keys
   and unique keys;
3. reject every reported parse error or unsupported tag;
4. convert with `maxAliasCount: 0`, rejecting aliases rather than expanding
   them;
5. validate that the result is one plain mapping and bound post-parse nesting,
   collection size and scalar size;
6. normalize OKF's allowed bare `verified: { by, at }` mapping to a one-event
   sequence at the AgentBase model boundary;
7. preserve unknown parsed values whenever a mutable AgentBase draft is
   rewritten;
8. keep raw protected-document bytes outside the serializer entirely.

Frontmatter delimiter extraction, Markdown body handling and OKF field
validation remain AgentBase responsibilities. The library does not decide OKF
conformance, producer ownership, trust or review state.

## Evidence

The package's official documentation states that strict parsing and unique-key
checking are enabled, duplicate keys are reported as `DUPLICATE_KEY`, and
`maxAliasCount` limits alias expansion:

- <https://eemeli.org/yaml/#options>
- <https://eemeli.org/yaml/#documents>
- <https://www.npmjs.com/package/yaml/v/2.9.0>

Local acceptance on Node `v24.18.0` confirmed:

- a duplicate `type` key produces `DUPLICATE_KEY`;
- conversion with `maxAliasCount: 0` rejects an alias;
- an unknown nested extension value survives parse/render/parse by value;
- a bare `verified` mapping remains available for AgentBase normalization;
- the installed dependency graph contains only `yaml@2.9.0` for this addition;
- `npm audit --omit=dev` reports zero known vulnerabilities at decision time.

The accepted registry integrity is:

```text
sha512-2AvhNX3mb8zd6Zy7INTtSpl1F15HW6Wnqj0srWlkKLcpYl/gMIMJiyuGq2KeI2YFxUPjdlB+3Lc10seMLtL4cA==
```

## Alternatives considered

### `js-yaml@5.2.3`

It provides schema and resource limits and is actively maintained, but the
selected package offers a document API suited to controlled unknown-value
round trips and adds no transitive dependency. AgentBase still supplies its own
frontmatter bounds and model validation with either option.

### Hand-written YAML or a restricted key/value parser

Rejected. OKF permits nested standard and extension values; a partial parser
would create silent interoperability failures and a security surface that the
project would own indefinitely.

### Preserve every YAML token for mutable drafts

Rejected for the MVP. Exact raw-byte preservation is required for protected
documents. Requiring comment/anchor/quoting preservation while automatically
modifying an AgentBase-owned draft would add an AST-editing contract that the
product loop does not need yet.

## Consequences

- Capability 002 adds one exact production dependency.
- Parsing and serialization stay behind one small adapter with focused hostile
  input tests.
- Protected knowledge retains exact bytes independent of YAML serializer
  behavior.
- Mutable AgentBase drafts retain unknown values but may receive normalized
  YAML presentation after a real content change.
- A future dependency upgrade requires the duplicate-key, alias, unknown-value
  and bare-`verified` conformance fixtures to pass before acceptance.
