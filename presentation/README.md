# AgentBase presentation

This directory carries the approved presentation story with the product so the
runtime and its explanation cannot silently diverge.

## Authority and artifacts

- [`vi/practical-use.md`](vi/practical-use.md) explains the current language and
  infrastructure coverage and illustrates real workflow boundaries with fictional
  two-column user/agent conversations. It is a companion, not an extra slide or
  benchmark transcript; no HTML rebuild is needed when only this guide changes.
- [`vi/PLAN.md`](vi/PLAN.md) is the narrative contract: audience, outcome,
  sequence, depth and factual boundaries.
- [`vi/slides/`](vi/slides/) is the canonical Vietnamese content source.
- [`preview.html`](preview.html) is a generated, standalone review snapshot of
  that source. It is intentionally committed so reviewers can open the exact
  deck without a renderer. It is presentation output, not Product,
  Architecture or Capability Contract authority.
- The local renderer workspace is
  `presentation/agentbase-mcp-deck/` relative to the `AgentBase/` workspace.
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
5. Introduce the five-stage overview before Stage 1 so the audience has a map of the process.
6. Put implementation stages and runtime architecture after the close as an
   explicitly optional technical appendix.

Do not turn the main deck into a component tour or a rigid What/Why/How list.
The audience should see the useful outcome before paying the cost of technical
detail. A section warning helps navigation, but it is not a substitute for
moving deep material out of the main story.

## Delivery rules

- Lead with Add repository / Update knowledge; command names remain
  `agentbase-ingest` / `agentbase-refresh`. Delta/Coverage are bounded strategies,
  not choices a first-time audience must diagnose. Advanced entries still exist.
- Show private preparation -> material-change preview -> explicit Publish.
  Direct policy writes and recognizes one complete remote commit; PR policy
  waits for team merge and sync. There is no required Accept/Local Draft step.
  Human approval authorizes sharing; it does not certify every claim or omission.
- Keep the optional five-stage technical explanation, but never imply three
  Coverage passes prove completeness or ordinary Update authorizes cloud reads.

- Target 20-22 minutes for the 15-slide main deck, then questions.
- Enter the technical appendix only when the room or remaining time benefits.
- One slide carries one sentence the audience should remember.
- Use one controlled Iroco2 story across proof, discovery, visualization and
  planning. Label its provider observation as qualification data rather than
  live production evidence; label retained Crawler artifacts as historical.
- Never imply that structural validation proves completeness or current runtime
  state.
- State release scope and non-claims explicitly. Do not present deferred
  benchmark, public-security or scale claims as shipped outcomes.
- Every demo claim must name its source revision or Published Hub commit.
- Explain Iroco2 in one sentence before the early proof: it estimates cloud carbon emissions; CUR is the AWS Cost and Usage Report.
- Keep slides 6–7 at product level when PM/PO/SM attend: structured documents, agent access, evidence, then review. Reserve exact transition names for the appendix.
- Label mock provider observations and illustrative agent conversations visibly. A source-backed graph does not establish deployed state or prove measured agent usefulness.
- On slide 10 use the full map as orientation, then open the public site and focus the Analyzer Queue for readable evidence; do not try to read every node on a projector.
- Read the talk track aloud and verify desktop, projector and mobile layouts
  before delivery.

## Rebuild and review

Current owner checkpoint: Markdown and standalone HTML are aligned for Add/Update
and Direct/PR publication. The renderer reads speaker notes directly from canonical
slide Markdown; visible layouts remain renderer-owned and require comparison after
content changes. Preserve the 15-main/9-appendix sequence and existing mock labels.
Do not restore the retired Accept/Local Draft lifecycle from older fragments.
PowerPoint is an optional export of the same deck, not a runtime release gate.

From the local renderer workspace:

```sh
node scripts/build-preview.mjs
```

The build writes the standalone HTML to both the renderer workspace and this
directory. Review keyboard navigation, touch controls, speaker notes, the
15-to-appendix boundary and the public URL after every content change.
