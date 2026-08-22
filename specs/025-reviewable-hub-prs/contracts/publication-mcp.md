# MCP contract: submit_hub_okf_proposals

## Input

```json
{ "proposal_ids": ["<accepted proposal id>"] }
```

IDs must be one non-empty dependency-safe pending prefix in local Git order.

## Output

```json
{
  "id": "<stable publication id>",
  "mode": "batch | stack",
  "repository": "owner/hub",
  "remoteBase": "<main commit>",
  "proposalIds": ["<id>"],
  "commits": ["<accepted commit>"],
  "branch": "<final unit branch>",
  "headCommit": "<final unit commit>",
  "pullRequest": { "number": 1, "url": "https://github.com/.../pull/1" },
  "units": [
    {
      "proposalIds": ["<id>"],
      "branch": "agentbase/...",
      "headCommit": "<commit>",
      "baseBranch": "main | agentbase/...",
      "pullRequest": { "number": 1, "url": "https://github.com/.../pull/1" }
    }
  ]
}
```

Batch mode has one unit for the complete selection. Stack mode has one unit per
proposal in order. The top-level branch/head/PR fields remain compatibility
aliases for the final unit. First Hub bootstrap always requests batch mode.

## Failure

The tool returns a bounded error through the existing MCP error envelope.
Remote `main` is never changed. Exact branches/PRs created before a partial
stack failure remain recoverable by retrying the same selection.
