# AgentBase presentation — approved Vietnamese main plan

## Talk contract

- Vietnamese working deck; English comes after content approval.
- Technical audience already familiar with the project environment.
- Target: 25–30 minutes plus questions.
- Product and architecture story, not a benchmark report.
- Benchmark/qualification artifacts are not part of the main deck.

## Narrative

```text
WHY
Team context → multi-repo problem

DESIGN BASIS
Compounding knowledge → OKF → MCP → source evidence

HOW KNOWLEDGE IS BUILT
Preflight → Discover → Investigate → Author → Validate

HOW IT BECOMES SHARED
Human review/publish → Refresh

HOW IT IS USED
MCP architecture → one Crawler story
→ Feature Discovery → diagram → Domain Hub → Task Planning handoff

POSITION
Markdown / RAG / AgentBase → close
```

## Main deck — 23 slides

1. AgentBase.
2. Mental model: Markdown Knowledge Base ↔ MCP ↔ AI Agent.
3. Event-driven team context.
4. The 15-repository relationship problem.
5. Knowledge must compound.
6. Why OKF.
7. MCP connects knowledge to the agent.
8. Knowledge begins with source evidence.
9. Five-stage overview.
10. Preflight.
11. Discover.
12. Investigate.
13. Author.
14. Validate.
15. Human review and Publish.
16. Refresh reuses the five stages; Crawler C0 → C1 is the build-up proof.
17. Runtime architecture: agent reasons, MCP protects boundaries.
18. Demo setup: retry and visibility for failed Crawler jobs.
19. Feature Discovery trace plus impact diagram.
20. Domain Hub drill-down to evidence.
21. Task Planning handoff from shared scope to exact source.
22. Positioning against plain Markdown and RAG.
23. Close: source-backed, reviewable, compounding.

## Demo rules

- One safe Crawler scenario across the whole chapter.
- Curated chat excerpts, never a wall of raw transcript.
- Diagram is a projection of accepted knowledge, not an inferred truth source.
- Unknowns remain visible.
- Domain Hub is a human-readable Published OKF projection, not new authority.
- Feature Discovery scopes; Task Planning performs selective source inspection.
- Do not claim that the sample flow proves production deployment state.

## Final-pass checklist

1. One slide, one sentence the audience should remember.
2. Each transition asks the question answered by the next slide.
3. Stable vocabulary: repository, revision, Domain, evidence, proposal,
   Published Hub and Refresh.
4. Verify every factual claim and sample commit.
5. Read the full talk track aloud and remove repetition.
6. Validate projector and mobile layouts before translating to English.
