# Contract: First Hub Remote Bootstrap

## Input

- exact GitHub HTTPS URL for a repository the user already created;
- explicit mode `all-to-main` or `base-to-main-knowledge-pr`.

The reviewed response before mutation exposes exact base, active head and
ordered proposal IDs/commits. The action accepts no token argument.

## Preconditions

- active Hub is `local-only`;
- local tree/ref/config are admitted and serialized;
- base identity is exact;
- every later first-parent commit is a valid knowledge proposal;
- target repository identity matches the URL and has zero heads/tags;
- an existing retry receipt, if any, matches the complete immutable intent.

## All to main

- push exact active head to new remote `main` once;
- create no publication branch or PR;
- fetch/admit exact remote state;
- persist remote configuration and completed receipt;
- report all knowledge commits as included bootstrap history.

## Base to main, knowledge to PR

- push exact base to new remote `main` once;
- fetch/admit and persist remote configuration;
- if knowledge exists, publish the complete pending prefix through one
  deterministic branch and PR using the normal lifecycle;
- if no knowledge exists, finish with no branch/PR.

## Recovery

- Before `main` push, retry requires an empty remote.
- After `main` push, retry admits only an exact remote `main` equal to the
  receipt's expected commit; any other ref/drift fails.
- Failure after base-only push preserves all local knowledge and resumes the
  exact branch/PR without another changed `main` push.
- Permission failures name the required access category and direct the user to
  replace the global token; no output includes token bytes.
