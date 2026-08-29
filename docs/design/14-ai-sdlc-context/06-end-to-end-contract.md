# 14.06 — End-to-end benchmark contract

## Input và tool boundary

Input là Feature `feature:readiness-health-contract` cùng Epic/Bug context và
source revision `98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`. Existing
`us:health-endpoint` không được gọi.

Without arm chỉ được gọi tracker read tools. With arm được gọi thêm
`search_hub_okf`, `read_hub_okf_concept` và tám read/index Code Graph tools,
index đúng một local root. Shell, mutation, cross-repository index, source
escape và budget breach làm arm incomplete.

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

## Evidence hiện tại

Pair `2026-08-29T05-45-00Z` đã chạy đủ hai arm và comparison là `needs_review`:
full AgentBase giữ critical quality, thêm source-specific task boundary và
compatibility outcome. Một lần so sánh ban đầu bị incomplete vì isolated Hub
chưa được seed và path line-span chưa normalize; runner đã sửa, không sửa raw
evidence. Owner vẫn phải đọc output trước khi chấp nhận.

## Deferred

No company-private Discovery skill integration, no 2×2 origin matrix and no
multi-repository task planning until this two-arm fixture has clean evidence.
