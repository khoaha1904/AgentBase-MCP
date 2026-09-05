# 02.07 — AgentBase OKF Profile 1.0 and layout admission

> Status: Profile 1.0 declaration and admission are implemented and verified.
> G5-C1 compact paths in
> [02.10](10-compact-profile-layout-requirements.md) are the current layout;
> earlier type-relative paths are historical development context.
>
> Release evidence: Required

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)

Architecture Contracts:
[Ownership](../../architecture/ownership.md),
[Dependencies](../../architecture/dependencies.md),
[Flows](../../architecture/flows.md),
[State and trust](../../architecture/state-and-trust.md), and
[Runtime](../../architecture/runtime.md).

## Current → target

Base OKF `0.2` remains readable. Profile 1.0 adds one pure declaration/parser,
deterministic compact-layout classification, physical-home validation and
Domain selector mapping. Hub CI, authoring, query and visualization share that
same boundary; malformed or unsupported declarations fail visibly.

## Benefit → impact

One reusable admission boundary prevents later authoring, query, migration and
visualization capabilities from inventing different path rules. It preserves
base-OKF readability and makes unsupported profile state fail visibly.

The change is medium-sized with moderate path-validation risk. Legacy MCP tools,
inputs and outputs do not change; an unprofiled Hub keeps its current CI
behavior. A Hub that creates `shared/agentbase-profile.md` incorrectly will now
fail Hub CI rather than being treated as a custom concept.

## Profile declaration

Profile 1.0 is the valid OKF concept `shared/agentbase-profile.md` with:

```yaml
type: AgentBase OKF Profile
resource: agentbase://okf-profile/1.0
agentbase:
  profile:
    id: agentbase-okf
    version: "1.0"
    okf_base: "0.2"
    layout: compact-domain-capsules-v1
    extensions:
      - canonical-relationships-v1
      - external-identities-v1
      - flow-steps-v1
      - maintainer-guidance-v1
      - observed-revisions-v1
      - observed-values-v1
      - questions-v1
      - repository-identity-v1
      - technology-metadata-v1
```

The extension list is exact, sorted and duplicate-free. Other ordinary OKF
frontmatter remains open-world and is preserved. Root `index.md` continues to
carry only `okf_version: "0.2"`; the profile is a concept rather than root
metadata or local configuration.

## Domain Capsule layout

- Every concept has one physical home below `domains/<slug>/` or `shared/`.
- A Domain capsule contains its sole Domain concept/navigation at
  `domains/<slug>/index.md`; its identity and stable external selector are both
  `domains/<slug>`.
- Repository dossiers use `repositories/`, Questions use `questions/`, and all
  other standalone AgentBase or valid unknown types use `knowledge/`. Type is
  read from frontmatter and never inferred from a folder.
- `shared/agentbase-profile.md` is the only Profile concept and the sole
  concept permitted directly below `shared/`. Other concepts remain below a
  compact collection; concepts cannot remain at the bundle root or in global
  type-first directories.
- `shared/index.md` and every `domains/<slug>/index.md` are required. Root
  navigation resolves the profile and every capsule; shared navigation resolves
  the profile and shared concepts; each capsule index resolves every concept in
  that home. Category indexes are not authored.

Physical home is derived from the path. This capability does not infer or
validate semantic Domain participation from home; existing relationship
validation continues to own `part-of` evidence.

## Classification and failure

The classifier returns exactly one state:

- `profile-1.0` with the parsed declaration and validated homes;
- `legacy-unprofiled` when the well-known profile concept is absent; or
- `unsupported` when the declaration, version or Profile 1.0 layout is invalid.

Diagnostics are stable, sorted and capped at 128 entries with an exact omitted
count. Profile classification performs no writes. Generic bundle parsing still
preserves legacy and foreign OKF; only profile-aware mutation capabilities will
later require `profile-1.0`.

## Requirements

- **AB-PROFILE-001** — Profile 1.0 has one exported identity and exact
  declaration contract: path `shared/agentbase-profile.md`, type `AgentBase OKF
  Profile`, resource `agentbase://okf-profile/1.0`, profile ID `agentbase-okf`,
  version `1.0`, base `0.2`, layout `compact-domain-capsules-v1` and the sorted extension
  families listed above.
- **AB-PROFILE-002** — Absence of the well-known concept returns
  `legacy-unprofiled`. A present but malformed, unknown-version or conflicting
  Profile concept returns `unsupported`; neither is silently promoted to
  Profile 1.0.
- **AB-PROFILE-003** — Every admitted Profile 1.0 concept derives exactly one
  physical home from `domains/<slug>/` or `shared/`. Root concepts, global
  type-first concepts and paths outside those homes fail admission.
- **AB-PROFILE-004** — AgentBase-owned concept types use the compact
  home-relative collections above. Every capsule has exactly one matching
  Domain concept at `domains/<slug>/index.md`, and a Domain or Profile concept
  in any other path fails admission.
- **AB-PROFILE-005** — An unknown base-OKF concept type below a valid physical
  home remains admitted and round-trippable without type/category inference or
  loss of unknown frontmatter/body content.
- **AB-PROFILE-006** — Domain selector conversion is strict and reversible:
  `domains/<slug>` maps only to `domains/<slug>/index.md`, whose exact concept
  identity is the selector itself. Invalid, file-suffixed or nested values are
  rejected.
- **AB-PROFILE-007** — Profile 1.0 requires root, shared and capsule navigation:
  root resolves `shared/agentbase-profile.md` and every capsule index;
  `shared/index.md` resolves the profile and every shared concept; each capsule
  index resolves every concept in that home. Missing or unsafe targets fail
  admission through the existing OKF/index boundary.
- **AB-PROFILE-008** — Profile/layout diagnostics are deterministic, unique,
  sorted and limited to 128 entries with an exact omitted count. Classification
  reads one already loaded bundle and creates no registry, cache or Hub state.
- **AB-PROFILE-009** — Hub CI invokes the shared classifier when the well-known
  profile concept is present and reports unsupported Profile/layout diagnostics
  as blocking errors. An unprofiled legacy Hub retains its current validation
  behavior and receives no implicit migration.
- **AB-PROFILE-010** — Profile admission changes no MCP tool name/input/output.
  Bootstrap, authoring, migration, query and visualization consume the same
  compact classifier. Release manifests retain `qualified_scale: null` while
  declaring only the separately verified Profile read/author compatibility.

## Implementation and verification map

- `src/core/knowledge/documents/agentbase-profile.ts` owns constants, declaration
  parsing, home/layout admission, Domain mapping and bounded diagnostics.
- `src/core/knowledge/documents/agentbase-profile.test.ts` covers
  `AB-PROFILE-001..008` and the unchanged release declaration boundary.
- `src/app/hub-okf/ci/validation.ts` consumes the public core classifier;
  its adjacent focused test covers `AB-PROFILE-009..010` and legacy behavior.
- `src/core/knowledge/index.ts` is the only public capability export.
- The generated self-contained Hub validator is rebuilt after implementation.

## Deferred boundaries

- Capacity and real-model benchmarks.
- G5-C2 semantic-quality admission.
