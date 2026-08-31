# 09.07 — Domain Enrichment

> Status: The AWS/SQS MVP is implemented offline; real AWS qualification has not run.

Capability 053's historical mock qualification used a temporary Published
fixture and stopped at proposal/inspection. Capability 064 supersedes that
development-fixture boundary for the workspace's disposable `hub-3`: the fake
still replaces only the AWS CLI process, while AgentBase uses the ordinary real
adapter, reconciliation, proposal, Accept and Publish lifecycle. This does not
replace real AWS qualification or add a public mock mode.

## Entry and authority

The user selects a Domain and explicit Published repositories/candidates, then
states that the provider CLI is logged in. The skill confirms batch membership/scope;
MCP does not log in, retain credentials or scan an account to find work automatically.

## Input

Domain Enrichment starts from knowledge merged into Published Hub `main`:

- Repository concepts and source/provider references at the exact Published commit;
- Questions/limitations requiring external verification;
- resource identity and relation candidates;
- evidence-backed provider/account/region hints.

Local Draft and repositories still in unmerged Init/Refresh pull requests are not
Enrichment input. A non-local repository still uses Published Hub knowledge/reference;
the workflow does not clone it or build a Code Graph for remote-only sources.

## Execution

```text
confirmed Domain + repo/candidate membership
        ↓
bounded candidates read from Hub
        ↓
sequential provider CLI verification
        ↓
identity/relation/question reconciliation
        ↓
one Domain Enrichment Draft → one Accept → one PR
```

Provider calls must target a specific resource/candidate; they do not blindly
list/scan every account, region or service. A name, ARN, account, region or
non-sensitive observed value is added only with provider provenance and observation time.

## Outcomes

- confirm or reject a resource identity match;
- add cross-repository/cross-Domain relation evidence;
- retain a duplicate identity as a candidate/Question; concept merge/alias is deferred;
- resolve or update governed Questions;
- retain a limitation when permission/resource evidence is insufficient.

## Batch/failure

Domain Enrichment uses atomic membership, sequential execution and per-member/
candidate checkpoints like Batch Ingest. One batch creates one proposal/pull
request and is not split after Accept. A failure does not publish partial
membership; the user retries or confirms new membership.

## Non-goals

- Do not Refresh repository code.
- Do not Accept/Publish automatically.
- Do not persist provider response dumps or secrets.
- Do not turn an external observation into timeless current truth.

## Development provider fixture

The fixture is allowed only for an explicitly guarded development
qualification target. AgentBase receives ordinary AWS CLI response bytes; no
mock marker, alternate evidence class, provider fork or Hub role is introduced.
Once the ordinary proposal is reviewed, the authorized qualification may use
the existing explicit Accept, pull-request publication, merge and synchronize
transitions. Failure before Accept leaves Published and Local Draft unchanged.

A provider observation may resolve a factual identity/relation Question through
the existing evidence rule. It does not answer operational ownership, intent or
another maintainer decision. Those Questions remain open without owner guidance.

- **AB-ENRICH-015** — A development AWS fixture replaces only the bounded
  process runner beneath `AwsCliAdapter`; every downstream outcome is processed
  by the ordinary enrichment and governance contracts without mock metadata.
- **AB-ENRICH-016** — Fixture publication fails closed unless an exact
  qualification target allowlist admits the active Hub identity and branch.
  The workspace qualification admits only `khoaha1904/hub-3` on `main` and
  never `khoaha1904/AgentBase-Hub`.
- **AB-ENRICH-017** — An owner-authorized fixture run preserves Prepare, Run,
  Finalize, inspect, Accept, submit, external merge and synchronize as distinct
  transitions; no failure automatically advances the next transition.
- **AB-ENRICH-018** — Exact provider evidence may automatically resolve only
  factual provider identity/relation Questions. Maintainer-decision Questions
  require exact owner guidance or remain open.
