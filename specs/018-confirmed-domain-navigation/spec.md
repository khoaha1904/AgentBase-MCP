# Feature Specification: Confirmed Domain Navigation

**Feature Branch**: `main`

**Created**: 2026-08-16

**Status**: Approved

**Input**: Let a maintainer explicitly bind repository knowledge to a known
business Domain without asking the agent to infer it, and keep the shared Hub
root from becoming the ingested repository's title.

## Owner Decisions

- Domain is optional owner input. It is never inferred from a repository or
  product name.
- A confirmed Domain has one exact canonical identity and display title. The
  authoring result exposes a stable owner-guidance evidence resource so Domain
  membership is not falsely attributed to repository source.
- The initial Shopping Cart qualification uses `domains/commerce` with title
  `Commerce`.
- Domain is logical navigation. Canonical System, component, interface, flow,
  resource and infrastructure files remain under their role-oriented roots.
- Existing nonblank lines in root and category indexes are shared Hub identity
  and navigation. A repository proposal may append navigation but not replace,
  reorder or restyle those lines.
- Question management and new/refresh lifecycle semantics remain unchanged.

## User Scenarios & Testing

### User Story 1 - Author within a confirmed Domain (Priority: P1)

As a maintainer ingesting a repository, I want to supply its known business
Domain so the generated graph has useful Domain → System navigation without an
agent guessing the boundary from code.

**Why this priority**: Domain scope is the main retrieval boundary for a Hub
containing many teams and systems.

**Independent Test**: Prepare authoring with the exact confirmed Domain
`domains/commerce`; the result selects Domain guidance, returns its identity,
title and owner-evidence resource, and a conformant authored bundle connects its
System to that Domain. Preparing without Domain context does not invent one.

**Acceptance Scenarios**:

1. **Given** an accepted Hub without a Commerce Domain, **When** a maintainer
   prepares one repository with confirmed Domain `domains/commerce`, **Then**
   authoring receives exact Domain guidance and can create the Domain plus its
   navigation using explicit owner evidence.
2. **Given** no confirmed Domain and no source evidence for one, **When** the
   repository is prepared, **Then** Domain is not selected or fabricated.
3. **Given** malformed or non-Domain canonical input, **When** prepare is
   requested, **Then** it fails before creating an authoring session.

---

### User Story 2 - Preserve shared Hub identity (Priority: P1)

As a Hub maintainer, I want every repository proposal to preserve the shared
root and existing category navigation so one project cannot rename the Hub or
rewrite navigation owned by earlier proposals.

**Why this priority**: A project-specific root breaks multi-domain navigation
as soon as more repositories are ingested.

**Independent Test**: Start from `# AgentBase-Hub`, append a valid Domains link
and finalize successfully; replace the heading or reorder an existing line and
observe finalization reject the proposal before acceptance.

**Acceptance Scenarios**:

1. **Given** a shared root and category indexes, **When** a new proposal only
   appends valid navigation lines, **Then** finalization accepts the index diff.
2. **Given** the same base, **When** a new proposal replaces its heading or any
   existing nonblank line, **Then** finalization rejects that index modification.
3. **Given** a confirmed Domain, **When** authoring completes, **Then** root
   retains its Hub heading and links the Domain entrypoint rather than becoming
   the repository title.

### Edge Cases

- The confirmed Domain may already exist; authoring reuses its canonical
  identity and must not create a duplicate Domain.
- A System may link more than one owner-confirmed Domain when separately
  authorized; this capability carries one confirmed Domain per repository
  authoring session.
- Blank-line and trailing-newline changes do not count as existing navigation,
  while every existing nonblank line retains order and exact bytes.
- A fresh malformed base without a conformant root remains invalid rather than
  being repaired implicitly by repository authoring.

## Requirements

### Functional Requirements

- **AB-SCHEMA-024**: Hub prepare MUST accept at most one optional confirmed
  Domain containing an exact `domains/<slug>` identity and non-empty title. It
  MUST reject malformed input before session creation, select Domain authoring
  guidance, return the exact identity/title and a deterministic owner-guidance
  evidence resource, and persist the context through final validation. Absence
  of this input MUST NOT authorize Domain inference.
- **AB-LOCAL-HUB-015**: New repository proposals MAY add navigation to an
  existing root or category `index.md`, but MUST preserve every existing
  nonblank line byte-for-byte and in order. Replacement, deletion or reordering
  MUST fail before proposal acceptance. The authoring contract MUST identify
  root and category headings as shared Hub identity rather than repository
  content.
- **AB-BENCH-041**: The next immutable Shopping Cart qualification MUST receive
  confirmed Domain `domains/commerce`, preserve the AgentBase-Hub root identity,
  expose Domain → System progressive navigation and remain subject to all V9
  validity, provenance, relationship and honest-uncertainty gates.

### Key Entities

- **Confirmed Domain**: Owner-authorized canonical Domain identity, display
  title and deterministic evidence resource carried by one authoring session.
- **Shared Index**: Root or category navigation whose accepted nonblank lines
  cannot be rewritten by a repository proposal.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every valid confirmed-Domain prepare returns exactly one canonical
  Domain identity, title and owner-evidence resource; every malformed case is
  rejected before a session directory exists.
- **SC-002**: Tests prove additive index navigation succeeds and root heading
  replacement, deletion and reordering all fail.
- **SC-003**: The rebuilt Shopping Cart bundle has a Commerce Domain reachable
  from root, its System reachable from Commerce, and the unchanged
  `AgentBase-Hub` root heading.
- **SC-004**: Canonical offline verification passes without a new dependency,
  daemon, persistent derived index or question representation.

## Assumptions

- The maintainer or calling agent already knows the intended Domain identity
  and title; discovery and question resolution are future workflows.
- `agentbase://owner-guidance/<domain-identity>` is stable provenance for the
  explicit prepare input, while repository resources continue to support code
  and system claims.
- The current single-Domain session is sufficient; multi-Domain assignment can
  be added only when a demonstrated repository requires it.
