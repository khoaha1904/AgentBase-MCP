# 14.02 — Capability requirements

These `AB-CONTEXT-*` requirements are the normative AI SDLC Context Capability
Contract. Qualification results are Validation Evidence, not requirement
authority.

New real-model A/B, onboarding and longitudinal stewardship execution is
deferred and is not a current internal enterprise release gate. Implemented
explicit context behavior, deterministic qualification support and all existing
`AB-CONTEXT-*` boundaries remain active for retained evidence and any later
campaign.

> Status: AB-CONTEXT-001..010 qualification baseline approved;
> AB-CONTEXT-011..016 manual runtime composition owner-approved after two
> bounded Crawler-Domain Feature qualifications; AB-CONTEXT-017..018 harden
> composition precedence and qualification isolation; AB-CONTEXT-019..023
> define the fair Phase 2 Task Planning audit; AB-CONTEXT-028..031 define the
> first Phase 3 cross-repository investigation audit without accepting a new
> default runtime workflow.

- **AB-CONTEXT-001** — Phase 1 qualifies Feature Discovery for BA/PO/DM using
  synchronized Published Hub only. It never requires application source, Code
  Graph, provider access or Local Draft.
- **AB-CONTEXT-002** — Discovery initiates AgentBase access on demand after it
  needs system/repository context. AgentBase does not prefetch Feature context,
  build a context packet or create a context store. In the fixed qualification,
  the shared prompt recognizes that tracker-only input cannot establish the
  requested system surface and requires one targeted search when the Hub search
  tool is available; query terms and exact reads remain workflow decisions.
- **AB-CONTEXT-003** — The fixed qualification assisted arm exposes only the
  existing `search_hub_okf` and `read_hub_okf_concept` tools at one pinned
  Published revision. It adds no query language, ranking logic, MCP tool,
  vector index, Hub schema or installed skill.
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
- **AB-CONTEXT-010** — The qualification implementation itself does not add
  `agentbase-add-context` or another integration skill. Runtime productization
  requires passing evidence and later owner approval; failure returns to Hub
  coverage or minimal query guidance, not a new retrieval subsystem.
- **AB-CONTEXT-011** — The released `agentbase-context` skill is a public,
  explicit-only compatibility entry to `agentbase-query`. Codex metadata MUST disable implicit
  invocation, and the skill instructions MUST require explicit invocation for
  clients without an equivalent policy field.
- **AB-CONTEXT-012** — Unified use starts with one `search_hub_okf` call with
  `limit <= 5`, scoped to the supplied exact Domain or explicitly global.
  Further bounded search/read requires a concrete evidence need under
  `AB-USE-002`; the historical one-search qualification remains unchanged.
- **AB-CONTEXT-013** — The search query MUST use the request's Feature, User
  Story or question, selecting distinctive capability anchors, relevant journey
  stages or handoffs and the actual decision. It MUST omit guessed technologies
  and generic request wording; simple questions do not require invented stages.
- **AB-CONTEXT-014** — When composed with another explicitly invoked skill,
  that primary skill owns the lifecycle and final deliverable.
  `agentbase-context` contributes only relevant Domain/System purpose,
  material Repository or Interface boundaries, accepted relations or Flow
  context, constraints, Questions, provenance and explicit unknowns without a
  duplicate report unless requested.
- **AB-CONTEXT-015** — Business/Feature context MUST use synchronized Published
  Hub only and identify snapshots, never live state. Explicit implementation
  verification MAY read an independently authorized local repository under
  `AB-USE-002`; compatibility invocation alone grants no source permission.
  No Local Draft, provider, web, mutation or lifecycle access is added. Host
  workflows retain their independently authorized tools.
- **AB-CONTEXT-016** — The manual skill adds no context store, schema, ranking
  subsystem, MCP tool, diagram or automatic integration with `fpt-discover` or
  another host workflow. Automatic invocation requires separate qualification
  and owner approval.
- **AB-CONTEXT-017** — An explicitly invoked primary workflow owns lifecycle
  and final output. Explicit `agentbase-query` or its `agentbase-context`
  compatibility entry supplies the same bounded evidence contribution, with
  no second invocation or duplicate report. Neither may replace host ownership.
- **AB-CONTEXT-018** — Real AIT qualification arms MUST run with an isolated
  Codex home. Global personal or product skills outside the suite's pinned
  workspace capability set MUST be unavailable to both arms.
- **AB-CONTEXT-019** — Phase 2 Task Planning qualification uses at least two
  sequential arms with the same tracker artifacts, User Story, clean pinned
  source, model, reasoning effort, timeout, read-only sandbox and output schema:
  source-native and source plus Code Graph. A third source-plus-graph-plus-Hub
  arm runs only for a named cross-repository, ownership or accepted-contract
  hypothesis.
- **AB-CONTEXT-020** — Every Phase 2 arm receives one disposable copy of the
  same source and ordinary bounded read-only shell access. The source-native
  arm receives neither AgentBase MCP nor Hub; it MUST NOT be weakened by
  hiding source or forbidding normal file/text search.
- **AB-CONTEXT-021** — The graph arm differs only by one disposable
  single-repository Code Graph session. It indexes the exact source root once,
  retains coverage limitations and has no Hub access.
- **AB-CONTEXT-022** — When a named Hub hypothesis admits the graph-plus-Hub arm,
  it retains the graph boundary and adds only synchronized Published Hub query
  at one exact commit. Local Draft, provider access, mutation, cross-repository
  graph combination and live-state claims remain forbidden.
- **AB-CONTEXT-023** — Phase 2 admission evaluates critical implementation
  boundaries, exact source evidence, compatibility/consumer decisions, tests,
  Task granularity and unknowns before elapsed time or tokens. Each incremental
  arm needs no critical regression or unsupported claim and either a meaningful
  quality gain or equal quality at meaningfully lower cost; one fixture proves
  only that fixture shape.
- **AB-CONTEXT-024** — Phase 2 implementation qualification uses two sequential
  arms with the same pinned source commit, feature, model, reasoning effort,
  timeout, version-pinned workspace instructions and editable disposable
  clone: source-native and source plus one local Code Graph. Published Hub is
  unavailable to both arms.
- **AB-CONTEXT-025** — Both implementation arms retain ordinary source reads,
  shell commands, workspace-write authority and the same declared path scope.
  Neither arm may mutate the source checkout, install dependencies, commit,
  push, deploy or change runtime state; only the graph arm may index and
  navigate its exact disposable clone.
- **AB-CONTEXT-026** — Implementation admission retains the complete patch,
  exact changed paths, tool trace, time and model usage, then independently runs
  the same focused tests, hidden semantic checks and repository verification.
  Missing required paths, out-of-scope edits, failed checks or capability leaks
  fail the arm before efficiency is considered.
- **AB-CONTEXT-027** — A graph-assisted implementation is a review candidate
  only when it has no correctness regression and either passes a requirement
  the control misses or preserves quality with at least ten percent lower wall
  time and total model tokens. Manual patch review may expose evaluator gaps;
  a new versioned evaluator replays exact retained patches without silently
  reinterpreting the original result. One fixture never enables graph by
  default.
- **AB-CONTEXT-028** — Phase 3 cross-repository investigation qualification
  compares source-native and source-plus-Hub arms with the same incident,
  independent copies of the same clean pinned repositories, model, reasoning
  effort, timeout, read-only shell authority and structured diagnosis contract.
- **AB-CONTEXT-029** — The assisted arm adds exactly one Published Hub search
  scoped to the incident Domain with `limit <= 5` and no exact read, Local
  Draft, Code Graph, provider, web or mutation access. Hub supplies routing
  evidence only; exact source establishes the causal contract and runtime state
  remains unknown.
- **AB-CONTEXT-030** — Every admitted diagnosis identifies a source-evidenced
  root cause, an end-to-end causal chain, the minimal repair boundary, ruled-out
  downstream behavior and explicit unknowns. Source references bind repository,
  path, line bounds and exact commit; the Hub arm also retains exact Published
  commit provenance and discloses source/Hub revision mismatch.
- **AB-CONTEXT-031** — Phase 3 comparison prioritizes correct upstream origin,
  handoff and causal explanation plus absence of unsupported live-state claims.
  Repository/file inspections, command position of first root evidence, Hub
  bytes, tokens and elapsed time are diagnostics. One fixture cannot establish
  general incident-tracing value or authorize default Hub use.
