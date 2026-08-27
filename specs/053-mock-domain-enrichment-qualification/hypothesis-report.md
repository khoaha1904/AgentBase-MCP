# Qualification hypothesis report

> Scope: synthetic Crawler-shaped fixture only. This is not a claim about the
> reset Crawler Domain or a live AWS account.

## Investigation boundary

The existing offline Domain Enrichment E2E already contains three selected
Repository concepts assigned to `domains/crawler`, evidence-owned Questions and
queue candidates. The fixture is intentionally used as a qualification source:
it exercises multi-repository ownership while keeping provider values
deterministic.

The real `serverless-data-pipelines-demo` source repository remains a single
repository and has no SQS/SNS resource declaration. Therefore these candidates
are hypotheses for workflow qualification, not extracted production facts.

## Candidate hypotheses

| Candidate | Hypothesized relation | Source evidence | Mock identity | Confidence | Expected outcome |
|---|---|---|---|---|---|
| `candidate-111111111111111111111111` | publisher Repository → `publishes-to` → consumer Repository via `crawler-events` | explicit interaction evidence in selected source concepts | `arn:aws:sqs:ap-southeast-1:123456789012:crawler-events` | high for workflow shape, none for live existence | confirmed |
| `candidate-222222222222222222222222` | `crawler-results` identity candidate | identity evidence only; expected ARN intentionally differs | actual `arn:aws:sqs:ap-southeast-1:123456789012:crawler-results` | medium | rejected expected identity |
| `candidate-333333333333333333333333` | `crawler-review` maintainer decision | candidate evidence, no automatic semantic answer | `arn:aws:sqs:ap-southeast-1:123456789012:crawler-review` | unresolved by design | access denied / manual |
| `candidate-444444444444444444444444` | regional `crawler-results` identity | exact region candidate | `arn:aws:sqs:us-east-1:123456789012:crawler-results` | high for retry behavior only | throttled, then retry |

The mock account and names are test constants. They must never be copied into
canonical Hub knowledge as provider observations.

## Review conclusion

The fixture is sufficient to test candidate preparation, exact scope matching,
bounded provider calls, reconciliation and proposal safety. It is not sufficient
to qualify Crawler's real AWS topology. Real qualification requires a fresh
Published dataset with source-backed SQS evidence or an owner-authorized AWS
read-only session.
