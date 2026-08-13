---
name: agentbase-okf
description: Author, refresh, validate, and review AgentBase Open Knowledge Format v0.2 bundle proposals from bounded repository evidence. Use when an AgentBase prepare operation returns a proposal workspace, when repository knowledge must become linked OKF concepts, or when rebuilding drafts while preserving maintainer guidance and other protected concepts.
---

# Author an AgentBase OKF proposal

Work only inside the exact prepared proposal's `bundle/` subtree. Treat the
current `okf/`, proposal metadata, evidence bundle, provider cache, and source
repository as read-only.

## Workflow

1. Read the proposal metadata and bounded repository evidence before authoring.
2. Read copied existing concepts as continuity context. Never cite previous
   generated prose as independent evidence.
3. Preserve every existing file byte-for-byte unless it is an explicit
   unverified `agentbase/` draft. When new evidence conflicts with protected
   knowledge, create a separate draft or an impactful open question.
4. Create the smallest useful linked concept set. Prefer one repository
   overview, independently useful components or flows, and only uncertainty
   that materially affects emitted knowledge. Do not create one aggregate
   report or speculative ontology.
5. Update the root `index.md` with `okf_version: "0.2"` and ordinary Markdown
   links for progressive disclosure. Consume an existing valid `log.md`; do not
   generate one for this MVP.
6. Run AgentBase validation and diff. Repair only proposal files. Present
   warnings, limitations, and the complete diff to the maintainer.
7. Stop before apply unless the maintainer explicitly authorizes applying that
   exact validated proposal.

## Concept rules

For every new or modified AgentBase concept:

- use one non-reserved `.md` file per concept and a descriptive `type`;
- set `status: draft`;
- set `generated.by` to the current `agentbase/<version>` producer and
  `generated.at` to the meaningful content-change time;
- omit `verified`; never impersonate a human or process verifier;
- preserve unknown frontmatter values when modifying an owned draft;
- attach important claims to `sources` entries from current repository evidence;
- use stable source IDs and matching Markdown footnotes for attributed claims;
- encode source code as
  `repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>`;
- never expose checkout roots, provider cache paths, secrets, credentials, or
  raw graph storage;
- relate concepts with normal bundle-relative Markdown links.

Unknown OKF types and extension fields are valid. Broken links are warnings,
not permission to invent the missing concept.

## Uncertainty and guidance

Create an `Open Question` draft only when resolving it could change useful
knowledge already emitted. Include what is known, what remains uncertain, and
which evidence would resolve it. Respect a matching maintainer defer directive
until it is removed or explicitly reopened.

Treat `Maintainer Guidance`, human-authored or human-verified concepts,
third-party concepts, ambiguous ownership, stable concepts, reference files,
and existing logs as protected. Do not rewrite them for style or normalization.

## Validation boundary

Use the repository's `okf validate` and `okf diff` stages. A successful
validation locks the generated tree digest; any later edit requires validation
again. Do not bypass stale-base, protected-content, source-path, producer-policy,
or conformance failures.
