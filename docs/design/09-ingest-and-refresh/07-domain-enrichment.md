# 09.07 — Domain Enrichment

> Status: The AWS/SQS MVP is implemented offline; real AWS qualification has not run.

The qualification-only mock provider path belongs to capability 053 and is
implemented. It uses a temporary Published fixture and stops at proposal/inspection;
it neither replaces real AWS qualification nor changes Domain Enrichment authority.

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
