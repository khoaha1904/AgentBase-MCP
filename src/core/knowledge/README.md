# Knowledge core

This capability owns portable OKF knowledge rules. Its public API is
[`index.ts`](index.ts); callers outside this directory must not import private
files directly.

## Areas

- [`schemas/`](schemas/README.md) — versioned concept catalog, selection and
  validation guidance.
- `documents/` — portable OKF parsing and linked-document validation.
- `query/` — bounded reads and continuity over accepted knowledge.
- `proposals/` — local proposal validation and atomic apply.
- `governance/` — confirmed domains, directives and live-claim policy.

Keep a concern here only when it is provider-neutral knowledge policy. Git,
Source discovery, MCP transport and workflow orchestration belong to their
existing provider or application capability.
