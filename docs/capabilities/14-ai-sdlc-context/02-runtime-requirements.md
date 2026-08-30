# 14.02 — Capability requirements

These `AB-CONTEXT-*` requirements are the normative AI SDLC Context Capability
Contract. Qualification results are Validation Evidence, not requirement
authority.

> Status: AB-CONTEXT-001..010 deterministic implementation approved; the first
> ECS real pair passed deterministic checks and remains pending owner review.

- **AB-CONTEXT-001** — Phase 1 qualifies Feature Discovery for BA/PO/DM using
  synchronized Published Hub only. It never requires application source, Code
  Graph, provider access or Local Draft.
- **AB-CONTEXT-002** — Discovery initiates AgentBase access on demand after it
  needs system/repository context. AgentBase does not prefetch Feature context,
  build a context packet or create a context store. In the fixed qualification,
  the shared prompt recognizes that tracker-only input cannot establish the
  requested system surface and requires one targeted search when the Hub search
  tool is available; query terms and exact reads remain workflow decisions.
- **AB-CONTEXT-003** — The assisted arm exposes only the existing
  `search_hub_okf` and `read_hub_okf_concept` tools at one pinned Published
  revision. It adds no query language, ranking logic, MCP tool, vector index,
  Hub schema or installed skill.
- **AB-CONTEXT-004** — One assisted qualification session permits at most three
  searches with `limit <= 8`, five exact reads and 64 KiB of completed Hub
  tool-result bytes. At least one search must complete for the fixed scenario.
  Any other MCP tool, application-source/Code Graph/Local Draft access or bound
  breach makes the arm incomplete.
- **AB-CONTEXT-005** — Empty, ambiguous, stale or insufficient Hub coverage is
  reported explicitly. Source access and invented facts are not fallback
  behavior in Phase 1.
- **AB-CONTEXT-006** — Qualification binds the discovery-only and
  discovery-plus-AgentBase arms to identical Feature/tracker inputs, generic
  prompt, model, reasoning effort, structured output contract, timeout and
  pinned dataset; arms run sequentially and expectations remain hidden. The
  only capability difference is the assisted arm's two-tool allowlist.
- **AB-CONTEXT-007** — Expected probes use `critical`, `important` and
  `optional` priorities. Missing or contradicting critical information cannot
  be offset by optional coverage, elapsed time, tokens or tool-result size.
- **AB-CONTEXT-008** — AgentBase passes the first qualification only when the
  assisted arm is no worse on critical quality, adds no unsupported critical
  claim, matches at least one important probe missed by the baseline and keeps
  system-specific claims traceable to its pinned Hub tool trace. Deterministic
  scoring is diagnostic; a real result needs explicit owner review to pass.
- **AB-CONTEXT-009** — Benchmark prompts, scenario and expectations live in
  AgentBase-Benchmark; durable qualification evidence lives only under its
  `results/`. Ordinary AgentBase use adds no stored context artifact. Per-run
  workspaces and isolated AgentBase state are disposable. The internal real
  runner requires the exact fixture Hub profile to be active and synchronized,
  admits its pinned local Published revision, then copies it into isolated
  state. It does not clone the fixture remotely, read Hub credentials or encode
  production/test roles in product configuration.
- **AB-CONTEXT-010** — Phase 1 does not add `agentbase-add-context` or another
  integration skill. Runtime productization requires passing evidence and a
  later owner-approved capability; failure returns to Hub coverage or minimal
  query guidance, not a new retrieval subsystem.
