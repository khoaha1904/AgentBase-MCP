# 09.01 — Initial Ingest

> Status: The baseline, Capability 046 discovery coverage runtime and G5-C1
> compact dossier authoring are implemented and verified. G5-C2 semantic quality
> admission is deferred and inactive.

## User interaction

The user invokes Ingest for one repository or a batch of explicit roots. The
skill asks only for minimal owner decisions such as a proposed/confirmed Domain;
it does not require a custom prompt, provider login or cross-repository investigation.

## Stages

```text
1. Preflight   Hub + repository/Domain + exact remote-default source
2. Discover    graph + MCP fixed baseline/census → private Discovery Seed
3. Investigate five lanes + exact source → submitted Inventory
4. Author      freeze Receipt → Repository dossier + independent knowledge
5. Validate    deterministic coverage + source/evidence/OKF/Profile integrity
6. Finalize    immutable proposal → preview
```

Stage boundaries/checkpoints are deterministic. Agent reasoning occurs only in
semantic discovery/investigation and must select an outcome for each important
group: materialized candidates, a Question or an ignored reason. Candidate
records separately select a concept-versus-embedded disposition. MCP groups
structure, assigns lanes/P0 and validates coverage; the Agent decides meaning.
Investigation stops when no progress is made.

Preflight requires an active Remote Hub. It resolves exact remote default-branch
commit before graph creation through same-host Hub-token HTTPS. It reuses current
checkout only on a clean exact match and otherwise uses an AgentBase-private
mirror/worktree outside the source repository. Scan itself does not create a
graph. Without a Remote Hub there is no OKF Init/Local Draft.

## Success

Success does not require full repository coverage or a concept quota. A run
succeeds when every discovery lane is covered, absent-after-check or visibly
limited, every important group has a dossier/standalone/Question/ignored
outcome and the proposal is valid, useful and provenance-bearing. Missing
lower-priority coverage can still be reviewable with a Question/limitation.

The current heuristic Seed uses a not-detected `limited` result for empty lanes;
it cannot establish verified absence. Runtime source locations remain separately
accountable without imposing a concept count. Capture, limited-lane and sampled-
group limitations survive into the Receipt and the Repository's existing
coverage-debt field at Finalize (zero Coverage passes and zero omitted changed
paths for Initial Ingest). This is recovery context, not a semantic score.

Missing low-value details are diagnostics. Important ambiguity becomes a
Question. An integrity/validation failure creates an Incomplete run and does not
enter query/publish. A P0 source/authority/adapter gap, P0-hiding pagination or
diagnostic, or unresolved P0 overflow also creates an Incomplete run.

## Repair budget

Changed-document validation retains the implemented single automatic authoring
repair budget. If deterministic failures remain, retain the repairable/
Incomplete session and stop; do not open another discovery loop automatically.

## Exit boundary

Ingest stops at proposal preview. Accept, Publish and provider enrichment require
separate authorization/workflows. A batch preserves complete proposals for other
repositories when one repository fails.

## Implementation/qualification note

The implemented baseline renders a rich Repository dossier, compact Domain
index and selected `knowledge/` skeletons before the Agent enriches them; the
Agent still does not build frontmatter from scratch. Explicit Batch Initial
Ingest remains isolated per member and atomic after every member satisfies the
current deterministic structural/evidence admission.

Prepared embedded rows are Receipt-bound mechanics. The Agent can improve labels
and prose but must retain candidate-owned source evidence; Finalize checks that
evidence in the parent instead of comparing the exact suggested name. MCP restores
a missing row from the Receipt in the normalized proposal without requiring an
Agent repair.

Capability 046 does not add schema/catalog, public scanner tool or concept
quota. It reuses pinned Codebase Memory and exposes normalized diagnostics to
the private Seed. It does not retrofit Published repositories; that remains
future Full Discovery Refresh or an intentional qualification-data re-ingest.
