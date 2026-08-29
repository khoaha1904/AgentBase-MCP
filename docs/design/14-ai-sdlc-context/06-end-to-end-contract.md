# 14.06 — End-to-end benchmark contract

## Input and tool boundary

Input is Feature `feature:readiness-health-contract` with Epic/Bug context and
source revision `98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`. Existing
`us:health-endpoint` is not called.

The without arm may call only tracker read tools. The with arm may also call
`search_hub_okf`, `read_hub_okf_concept` và tám read/index Code Graph tools,
and index exactly one local root. Shell, mutation, cross-repository index,
source escape and budget breach make an arm incomplete.

## Output

```json
{
  "feature_summary": "...",
  "user_story": {"title":"...","statement":"...","acceptance_criteria":["..."]},
  "tasks": [{"id":"T1","title":"...","reason":"...","scope":["..."],"dependencies":[],"acceptance":["..."],"evidence_refs":["e1"]}],
  "questions": ["..."],
  "known_unknowns": ["..."],
  "evidence_refs": [{"id":"e1","kind":"tracker|hub|codegraph","path":"...","commit":"..."}]
}
```

US/task text and arrays remain bounded. Evidence refs must resolve to retained
tool trace; direct arm may cite tracker IDs only and cannot cite source facts.

## Expected tiers

- Critical: US preserves readiness goal and ECS health-check alignment; tasks are
  ordered and do not invent deployment facts.
- Important: explicit `/status` compatibility, blue/green implications,
  source-specific task boundaries and test/verification acceptance.
- Optional: documentation or rollout detail only when evidence supports it.

## Current evidence

Pair `2026-08-29T05-45-00Z` ran both arms and comparison is `needs_review`:
full AgentBase preserves critical quality and adds source-specific task boundary
and compatibility outcome. An earlier comparison was incomplete because the
isolated Hub was unseeded and path line spans were not normalized; the runner was
fixed without changing raw evidence. The owner must still inspect output before
acceptance.

## Deferred

No company-private Discovery skill integration, no 2×2 origin matrix and no
multi-repository task planning until this two-arm fixture has clean evidence.
