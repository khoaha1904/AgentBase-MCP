# MCP Contract: Local-First Hub

## Graph and schema tools retained

The exact safe Codebase Memory tools remain the code-question surface. Schema
catalog tools remain separate and move to the corrected concrete catalog version.

## Hub authoring actions

- `prepare_hub_okf`: prepare `new` or `refresh` workspace from an admitted source
  and exact local Hub active commit; no local-Hub commit or remote write.
- `finalize_hub_okf_proposal`: validate and lock authored OKF bytes.
- `inspect_hub_okf_proposal`: show exact local base, subject, schemas, evidence,
  content diff and digest.
- `accept_hub_okf_proposal`: commit exactly the reviewed proposal to local Hub
  `main`; no network publication.

## Local knowledge actions

- `list_pending_hub_okf`: return ordered proposal IDs, subjects, commits, parent,
  diff summary and publication state.
- `search_hub_okf`: bounded search of the admitted local active Hub tree.
- `read_hub_okf_concept`: read one exact normalized concept or index path from
  the admitted local active tree.

## Publication actions

- `submit_hub_okf_proposals`: accept one or more proposal IDs forming a safe
  pending prefix, push one deterministic branch and open/recover one PR.
- `synchronize_hub_okf`: fetch remote main, recognize published proposals and
  transactionally rebase remaining local proposals.
- `recover_hub_okf`: recover an interrupted publication or synchronization by
  exact transaction/proposal ID.

## Authority exclusions

No tool accepts token, arbitrary remote URL, target branch, force, reset, merge,
approve, branch delete or repository rename arguments. Repository migration and
MCP installation are operator workflows outside ordinary Hub tools.
