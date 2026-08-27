# Implementation plan: mock Domain Enrichment qualification

**Branch**: `053-mock-domain-enrichment-qualification`
**Spec**: [spec.md](spec.md)

## Route

Full Feature route. The change crosses Domain Enrichment, provider verification,
Question/proposal lifecycle and qualification safety, but remains fixture-only:
no production provider boundary or Hub schema changes.

## Sequence

1. Reconcile the high-level and low-level mock boundary and lock requirements
   `AB-ENRICH-011..014`.
2. Reuse the existing Crawler-shaped offline fixture pattern and write a bounded
   hypothesis report for selected producer/consumer candidates.
3. Extract a reusable deterministic mock AWS/SQS process runner or adapter from
   the existing E2E runner; keep the real `AwsCliAdapter` as the code under test.
4. Add a qualification script/test that creates an ephemeral Published base,
   prepares an exact enrichment manifest and runs through proposal inspection.
5. Cover confirmed, expected-ARN mismatch, denied/not-found unresolved and
   retryable failure/retry outcomes; assert no network, list calls or Hub
   mutation.
6. Reconcile docs/spec/tasks with implementation and run the repository gate.

## Candidate fixture shape

Use two or more Crawler-shaped repositories with explicit evidence IDs:

```text
repo-crawler-publisher / Function ──publishes-to──> crawler-events Resource
repo-crawler-worker    / Function <──triggered-by── crawler-events Resource
```

The fixture provider map owns the deterministic queue name, account, region,
URL, ARN, allowlisted attributes and scripted failure outcome. It does not infer
or discover additional resources.

## Runtime impact

- Qualification-only files/tests add no runtime dependency, daemon, index or
  production process.
- Existing Domain Enrichment remains sequential and bounded.
- Temporary state is isolated and recoverable; canonical Hub and source fixtures
  are read-only.
- Any future production mock mode would be a separate capability requiring a
  new security/authority review.

## Review gate

Before implementation, verify that the plan does not silently add provider
truth, automatic inference, a new public tool or a publication path for mock
observations. If any gap appears, update the high-level and low-level documents
first.
