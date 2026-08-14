# Living Requirements: Agent-driven OKF Benchmark

- **Status:** Active
- **Established by:** Capability `012-agent-okf-benchmark`
- **Last updated:** 2026-08-14

### AB-BENCH-001 — Immutable benchmark inputs

Every comparable run pins source commits, expectation files, schema catalog,
prompt, agent executable version, model and reasoning effort.

### AB-BENCH-002 — Real explicit host agent

Model-backed benchmarking is one explicit opt-in action. One bounded
non-interactive host-agent process runs per repository in an isolated result
workspace with AgentBase MCP required. AgentBase adds no model SDK or credential
storage.

### AB-BENCH-003 — MCP-led investigation

The agent indexes the repository once, uses graph tools and schema list/select/
read/validate tools, then may inspect authorized source, documentation and Git
history. It writes only a sparse OKF bundle and records limitations rather than
inventing missing evidence.

### AB-BENCH-004 — Semantic golden contract

Repository expectations name concept instances with bounded semantic identity
terms, concrete schema types, required metadata, required source paths and
directed relationships. Agent-authored keys connect relationships but are not
golden slugs. Expectations do not prescribe prose or exact Markdown bytes.

### AB-BENCH-005 — Independent quality metrics

Finalization reports OKF conformance, concept and schema precision/recall,
metadata completeness, provenance coverage, relationship coverage and
unexpected output separately.

### AB-BENCH-006 — Source immutability and visible failure

A run begins and ends on the same clean pinned source. Missing output, agent or
MCP failure, timeout, malformed artifacts and source drift fail visibly and
cannot produce passing finalization.

### AB-BENCH-007 — Reviewable historical artifacts

Each run retains exact prompt, run configuration, JSONL agent events, final
message, OKF bundle, metrics and report under its repository and UTC run ID.

### AB-BENCH-008 — Offline canonical gate

Canonical verification covers process/configuration boundaries and semantic
scoring with a fake executable. Real model execution is always separate.
