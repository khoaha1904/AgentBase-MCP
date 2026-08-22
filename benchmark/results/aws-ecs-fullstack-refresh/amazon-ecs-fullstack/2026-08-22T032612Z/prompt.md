You are executing the AgentBase single-repository Refresh V3 qualification.

Source repository (read-only): <SOURCE_ROOT>
Artifact directory (the only benchmark output path): <OUTPUT_ROOT>
Canonical Repository ID: repository-amazon-ecs-fullstack-app-terraform-69902021744a
Repository subject: repositories/amazon-ecs-fullstack-app-terraform
Schema catalog version: 7.0.0
Confirmed primary Domain: Digital Experience (domains/digital-experience); evidence agentbase://owner-guidance/domains/digital-experience

This isolated harness already contains an accepted local Hub baseline for this
Repository. Do not read benchmark expectations, previous results or other
benchmark artifacts. Use the packaged `agentbase-refresh` workflow.

1. Call `get_hub_status` and `preflight_hub_ingest` exactly once. Call
   `index_repository` exactly once with `repo_path`, canonical Repository ID as
   `name`, and `mode: fast`; then call `get_architecture` exactly once with that
   canonical Repository ID as `project`. The Hub must already be local-only and
   the Repository match unambiguous. Do not configure another Hub.
2. Call `prepare_hub_okf` exactly once with `mode: refresh`, the source path,
   subject `repositories/amazon-ecs-fullstack-app-terraform`, and the smallest semantic signals covering
   concepts you may update. Do not send guidance or an evidence digest.
3. Investigate in returned order: `sourceChanges`, `continuity.knownGaps`, then
   one bounded discovery pass. For every changed path, first inspect the exact
   Git diff from `continuity.observedSource.commit` to `source.commit`. Treat all
   hunks in the single source commit as one consistent change; a partial read of
   a large changed file is not a substitute for its changed hunks. Resolve claims
   to exact current source. Do not full-scan for completeness or use provider CLI.
4. Author only inside the returned bundle. OKF is durable knowledge plus exact
   evidence, not copied source or a second graph. Change-prone configuration
   values should be live references; a small non-sensitive snapshot is optional
   and explicitly non-current. Preserve foreign evidence, Maintainer Guidance,
   unknown extensions and accepted claim identities.
5. Omission, age or graph/search absence never means deletion. Any removal,
   supersession or retraction requires an explicit Finalize lifecycle intent,
   bounded reason and exact current-repository evidence. Do not invent one.
6. Call `validate_okf_changes` with every changed concept and exact path-derived
   identity. Repair at most once from exact content failures.
7. Call `finalize_hub_okf_proposal` exactly once. A useful change must produce
   one reviewable draft; call `inspect_hub_okf_proposal` exactly once and verify
   its grouped review. If Finalize reports `no_change`, stop and report it.
8. Never Accept, publish, submit, synchronize, bootstrap, clone or call provider
   CLI. The harness captures finalized proposal bytes; do not copy Hub state.

Your final response briefly reports changed paths, updated knowledge, retained
uncertainty, Questions/limitations and the prepared proposal identity.
