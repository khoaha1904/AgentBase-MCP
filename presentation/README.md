# AgentBase presentation

This directory carries the approved presentation story with the product so the
runtime and its explanation cannot silently diverge.

## Authority and artifacts

- [`vi/PLAN.md`](vi/PLAN.md) is the narrative contract: audience, outcome,
  sequence, depth and factual boundaries.
- [`vi/slides/`](vi/slides/) is the canonical Vietnamese content source.
- [`preview.html`](preview.html) is a generated, standalone review snapshot of
  that source. It is intentionally committed so reviewers can open the exact
  deck without a renderer. It is presentation output, not Product,
  Architecture or Capability Contract authority.
- The local renderer workspace is
  `../presentation/agentbase-mcp-deck/` relative to the `AgentBase/` workspace.
  It also publishes the same snapshot at
  `https://learn.khoa.cc/agentbase-mcp-deck/preview.html`.

Do not edit `preview.html` directly. Change the canonical Markdown and renderer
source together, rebuild, then review the generated snapshot.

## Presentation contract

AgentBase is presented to a mixed product-and-engineering audience. Engineers
remain the primary audience, but the main story must be understandable without
knowing MCP, OKF, code graphs or the repository layout in advance.

Use this narrative:

```text
Problem -> Promise -> Proof -> How -> Governance and limits -> Now what
```

This is deliberate:

1. Show the multi-repository problem before introducing technology.
2. State the simple product promise, then show one concrete proof early.
3. Explain only enough mechanism to make the proof credible.
4. Keep human authority, limitations and the adoption ask in the main deck.
5. Put implementation stages and runtime architecture after the close as an
   explicitly optional technical appendix.

Do not turn the main deck into a component tour or a rigid What/Why/How list.
The audience should see the useful outcome before paying the cost of technical
detail. A section warning helps navigation, but it is not a substitute for
moving deep material out of the main story.

## Delivery rules

- Target 20-22 minutes for the 15-slide main deck, then questions.
- Enter the technical appendix only when the room or remaining time benefits.
- One slide carries one sentence the audience should remember.
- Use one controlled Crawler story across proof, discovery, visualization and
  planning; label retained qualification snapshots as historical evidence.
- Never imply that structural validation proves completeness or current runtime
  state.
- State release scope and non-claims explicitly. Do not present deferred
  benchmark, public-security or scale claims as shipped outcomes.
- Every demo claim must name its source revision or Published Hub commit.
- Read the talk track aloud and verify desktop, projector and mobile layouts
  before delivery.

## Rebuild and review

From the local renderer workspace:

```sh
node scripts/build-preview.mjs
```

The build writes the standalone HTML to both the renderer workspace and this
directory. Review keyboard navigation, touch controls, speaker notes, the
15-to-appendix boundary and the public URL after every content change.
