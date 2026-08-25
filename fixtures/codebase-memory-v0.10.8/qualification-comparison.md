# Codebase Memory v0.10.8 qualification

Qualified pristine upstream tag `v0.10.8` at commit
`46ae198fc11cda80e817acbc5f5908d7c2de7032` against AgentBase's retained
`v0.10.1` fixture.

## Result

- All representative index, architecture, search, trace, coverage, source
  immutability and non-persistence checks pass.
- The same nine Code Graph actions required by AgentBase are present.
- No selected action was removed and all previously valid AgentBase arguments
  remain valid.

## Explained schema differences

| Action | Difference | Decision |
|---|---|---|
| `search_code` | Adds optional `debug` timing output and declares `limit >= 1`; upstream also guards invalid limits at runtime. | Accept for provider admission. AgentBase does not pass `debug` or invalid limits. |
| `check_index_coverage` | Removes schema-level `anyOf`; descriptions now state that `paths` or `scopes` is required and upstream rejects omission at runtime. | Accept for provider admission. AgentBase's coverage calls still provide a bounded path/scope. |

The provider schema digest therefore changes from
`dfcbd400b18a4e044b07f3c555b3896ae25453181db06c70c930a7cdab6ec115` to
`e02c6bd225b2b107ec414b2d6888b907997d331c0991f01de86e013707a5ae50`.
This is an explained backward-compatible provider change, not an OKF-authoring
behavior change.

AgentBase keeps its existing public tool descriptors. The accepted v0.10.8
manifest is used to admit the private provider; it does not silently expand the
public AgentBase surface.

## Owned-build comparison

The owned `v0.10.8` build reproduces every pristine `v0.10.8` qualification
field and all 14 representative behavior checks. Compared with `v0.10.1`:

- both expose the same nine required Code Graph actions;
- every index, architecture, search, trace, coverage, graph-fact, source
  immutability and non-persistence check remains `true`;
- only the provider version and the two explained schema changes above differ;
- AgentBase's released 43-tool surface remains unchanged.

The parser-profile qualification separately indexes one representative file for
each of Bash, Dockerfile, Go, HCL/Terraform, Java, JavaScript, JSON, Markdown,
Python, TSX, TypeScript and YAML. All 12 are accepted with no partial parse;
the Rust control file alone is visibly skipped as outside the profile.
