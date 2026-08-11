# Product Vision

## Outcome

AgentBase helps coding agents understand a repository quickly and helps teams
turn selected technical evidence into durable, reviewable knowledge without
pretending that one automated scan is complete truth.

The product has two related but independently useful parts.

## Part 1: Local Code Intelligence

Part 1 builds a detailed local representation of source structure and
relationships so an agent can navigate relevant code instead of rereading the
whole repository for every task.

Desired properties:

- local-first and useful without cloud credentials;
- deterministic where practical and low in AI usage;
- fast incremental refresh after source changes;
- detailed enough for coding navigation;
- safe to discard and rebuild;
- not required to be byte-identical across machines;
- accessible through a stable AgentBase contract even if the engine changes.

Part 1 should reuse a proven external engine when it meets the contract. The
project should not compete on writing every parser, indexer and graph query
engine from scratch.

## The bridge: Observations

A raw code graph is too detailed, unstable and implementation-specific to be
the durable knowledge format. AgentBase therefore needs a narrow bridge:
selected observations.

An observation states a high-level claim derived from evidence and includes at
least:

- a stable kind and subject;
- source identity and location or other reproducible evidence;
- the analyzer and engine identity;
- confidence and limitations;
- collection time or source revision;
- enough information to verify it again.

Only observations cross from local Code Intelligence into OKF investigation.

## Part 2: Governed OKF Knowledge

Part 2 investigates, proposes, reviews and accumulates useful knowledge from
observations and other authorized evidence. It may use significantly more AI
than Part 1 and should expose uncertainty instead of hiding it.

Desired properties:

- AI-assisted investigation with human-reviewable proposals;
- provenance and source-revision binding;
- cumulative re-ingest rather than overwrite-by-latest-scan;
- confidence informed by independent supporting or conflicting observations;
- explicit stale, detach, supersede and reject operations;
- no implicit deletion because a later machine did not observe a prior fact;
- stable high-level concepts instead of a copy of every syntax node.

## Product boundary

AgentBase owns the contract between the two parts and the governed knowledge
lifecycle. A third-party engine may own local parsing and graph mechanics.

This separation allows Part 1 to improve or change engines without making OKF
data depend directly on one vendor's private graph schema.

## Primary success measures

- A coding agent retrieves a small, relevant subgraph faster and with fewer
  tokens than reading the repository broadly.
- The same source revision produces acceptably stable observations through the
  supported adapter contract.
- Two non-identical local graphs can contribute compatible observations to the
  same OKF knowledge base.
- Re-ingest adds support, conflict or review state without silently destroying
  accepted knowledge.
- An engine upgrade can be tested and rolled back without corrupting OKF data.

## Non-goals for the clean foundation

- Porting all features from the legacy implementation.
- Building a universal source parser or graph database.
- Sharing raw local graph databases as team knowledge.
- Requiring Terraform, Terragrunt or cloud credentials for basic local coding
  assistance.
- Claiming fully automatic or perfectly accurate repository understanding.
