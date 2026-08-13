# MCP Contract: AgentBase Hub

## `prepare_hub_okf`

Input:

- `mode`: `new | refresh`
- `source_repository`: absolute selected source root
- `evidence_digest`: exact prepared observation identity

Additional input: subject directory and evidence signals selected by the coding agent from the Codebase Memory round. MCP derives the normalized repository identity from the exact source root using the same source-state boundary as evidence collection.

Output: authoring session ID, private writable bundle path, Hub/base identity and selected schemas. No remote write occurs. The coding agent authors the files in this workspace.

## `finalize_hub_okf_proposal`

Input: exact authoring session ID.

Output: immutable proposal ID, tree/diff digest and validation result. Finalize enforces new/refresh policy and performs no remote write.

## `inspect_hub_okf_proposal`

Input: exact proposal ID.

Output: immutable metadata, phase, full bounded file-tree/content diff and validation status. No credential required in the response.

## `submit_hub_okf_proposal`

Input: exact proposal ID plus explicit confirmation of its proposal digest.

Output: exact publication receipt or visible phase/recovery state. It pushes only the deterministic proposal branch and opens, or recovers, one PR.

## `recover_hub_okf_submission`

Input: exact proposal ID.

Output: reconciled local/remote phase. Recovery never rewrites an already pushed branch and never merges.

The user-facing Create OKF action is orchestrated by the coding agent across these primitives; MCP does not contain a model or author prose. All tools derive Hub identity from fixed MCP configuration. None accepts a token, remote URL, target override, force flag or merge flag.
