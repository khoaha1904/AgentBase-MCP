# AgentBase presentation — approved Vietnamese plan

## Talk contract

- Vietnamese main deck for a mixed PM, PO, SM and engineering audience.
- Engineers are the primary audience; prior AgentBase, MCP, OKF and Code Graph
  knowledge is not assumed.
- Main deck: 15 slides, 20-22 minutes, then questions.
- Optional technical appendix: one divider plus seven slides, about seven
  minutes when the room benefits.
- Product and architecture story, not a benchmark report.
- Current internal enterprise release only. No perfect-completeness,
  benchmark-proven ROI/scale or public hostile-environment claim.

## Narrative

```text
PROBLEM
Repeated reconstruction across repository boundaries

PROMISE
Shared, source-backed knowledge for agents and people

PROOF
One concrete Crawler impact route, shown early

HOW
Evidence -> proposal -> human review -> Published Hub -> use

GOVERNANCE AND LIMITS
Valid is not complete; humans retain publication authority

NOW WHAT
Run a bounded domain pilot and measure review usefulness
```

The talk starts and ends at product level. Technical depth is an optional dive
after the close, not a toll every audience member must pay before seeing value.

## Main deck — 15 slides

1. AgentBase.
2. The multi-repository context problem.
3. Simple promise: Markdown Knowledge Hub + MCP + AI agent.
4. Early proof: one reviewed Crawler route narrows a change request.
5. Why knowledge must compound.
6. Foundation: OKF structure, MCP access and exact source evidence.
7. Lifecycle: evidence to proposal to human-reviewed Published knowledge.
8. Demo setup: retry and visibility for failed Crawler jobs.
9. Feature Discovery: accepted scope and visible unknowns.
10. Domain Hub: human-readable projection with provenance.
11. Task Planning: shared scope narrows exact-source investigation.
12. Maintenance: Delta Refresh and bounded Coverage Refresh.
13. Positioning: AgentBase adds a lifecycle beside Markdown and RAG.
14. Release boundary and proposed internal pilot.
15. Close: context agents can explain; knowledge teams can correct.

## Optional technical appendix — 8 slides

16. Technical deep-dive divider and takeaway for non-engineers.
17. Preflight.
18. Discover.
19. Investigate.
20. Author.
21. Validate.
22. Human review and Publish.
23. Runtime architecture and trust boundaries.

## Demo and evidence rules

- Use one Iroco2 CUR Analyzer-to-backend scenario across the main deck.
- The main demo uses the current compact Profile qualification snapshot at
  Published Hub commit `bf2e99273acc83469a70f2a5b1dd06c93d9d01d5` after the
  reviewed backend refreshes and an explicitly mocked provider qualification.
  It is not presented as live production state.
- Retained Crawler artifacts may appear only as clearly historical technical
  evidence outside the main controlled story.
- Curate the trace; never show a wall of raw transcript.
- Diagram and Domain Hub are projections of accepted knowledge, not inferred
  truth sources.
- Unknowns remain visible.
- Feature Discovery scopes; Task Planning performs selective source inspection.
- Structural validation proves contract compliance, not semantic completeness.
- Demo slides must preserve the exact source/Hub revisions in their sources or
  visible metadata.

## Final-pass checklist

1. One slide, one sentence the audience should remember.
2. The useful outcome appears by slide 4.
3. Each transition asks the question answered by the next slide.
4. Stable vocabulary: Repository, Domain, evidence, proposal, Local Draft,
   Published Hub, Delta Refresh and Coverage Refresh.
5. Verify every factual claim and sample commit.
6. Read the main talk aloud in under 22 minutes without the appendix.
7. Validate standalone HTML on desktop, projector-sized viewport and mobile.
