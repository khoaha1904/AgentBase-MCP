# 09.01 — Initial Ingest

> Status: The baseline is qualified and the Capability 046 discovery coverage
> runtime is implemented; released-skill requalification is pending.

## User interaction

The user invokes Ingest for one repository or a batch of explicit roots. The
skill asks only for minimal owner decisions such as a proposed/confirmed Domain;
it does not require a custom prompt, provider login or cross-repository investigation.

## Stages

```text
1. Preflight   Hub + repository/Domain + exact remote-default source
2. Discover    graph + MCP fixed baseline/census → private Discovery Seed
3. Investigate five lanes + exact source → submitted Inventory
4. Author      freeze Receipt → guidance/skeletons → OKF proposal
5. Validate    Seed/Receipt coverage + OKF integrity + preview
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
succeeds when every discovery lane is covered, absent-after-check or limited,
every P0 group has an outcome and the proposal is valid, useful and
provenance-bearing. Missing P1/P2 coverage can still be `Ready for review` with
a Question/limitation.

Missing low-value details are diagnostics. Important ambiguity becomes a
Question. An integrity/validation failure creates an Incomplete run and does not
enter query/publish. A P0 source/authority/adapter gap, P0-hiding pagination or
diagnostic, or unresolved P0 overflow also creates an Incomplete run.

## Repair budget

Validation permits at most one Agent repair round for exact failures. If failures
remain, retain the repairable session/diagnostics and stop; do not open another
discovery loop automatically.

## Exit boundary

Ingest stops at proposal preview. Accept, Publish and provider enrichment require
separate authorization/workflows. A batch preserves complete proposals for other
repositories when one repository fails.

## Implementation/qualification note

MCP renders canonical Repository, confirmed Domain, selected concept and index
skeletons before the Agent enriches them; the Agent does not build frontmatter
from scratch. Catalog 7 qualification with Sol creates a valid partial seven-concept
ECS full-stack bundle with a System, frontend/backend Components, an Interface
and a delivery Flow; internal AWS resources remain embedded. Explicit Batch
Initial Ingest is implemented offline with isolated sequential member checkpoints
and one atomic proposal.

Prepared embedded rows are Receipt-bound mechanics. The Agent can improve labels
and prose but must retain candidate-owned source evidence; Finalize checks that
evidence in the parent instead of comparing the exact suggested name. MCP restores
a missing row from the Receipt in the normalized proposal without requiring an
Agent repair.

Capability 046 does not add schema/catalog, public scanner tool or concept
quota. It reuses pinned Codebase Memory and exposes normalized diagnostics to
the private Seed. It does not retrofit Published repositories; that remains
future Full Discovery Refresh or an intentional qualification-data re-ingest.
