# Contract: Local Hub Git Model

## Refs

- configured remote `main`: shared accepted target;
- local `main`: active queryable tree = admitted remote base + pending proposals;
- `agentbase/publish-<id>`: one deterministic remote publication branch;
- private transaction refs: owned temporary refs used only during synchronization
  and removed after admitted completion.

## Proposal commit trailers

Each accepted proposal commit records stable non-secret metadata equivalent to:

```text
AgentBase-Proposal-ID: <id>
AgentBase-Subject: <normalized subject>
AgentBase-Source-ID: <repository identity>
AgentBase-Evidence-Digest: sha256:<hex>
AgentBase-Diff-Digest: sha256:<hex>
AgentBase-Schema-Catalog: <version>
```

Exact trailer spelling is implementation-owned but versioned and tested. Commit
author/committer dates use immutable proposal creation/acceptance metadata rather
than a fake epoch.

## Accept invariants

- local clone identity and parent are admitted;
- local working tree/index are clean before materializing reviewed bytes;
- authored tree and diff digest match review;
- exactly one commit advances local `main`;
- remote refs remain unchanged;
- failure leaves the prior local `main` and proposal workspace recoverable.

## Publication invariants

- selection is a contiguous dependency-safe pending prefix;
- remote base still matches admitted base;
- branch head is the exact last selected accepted commit;
- one non-force push and one exact PR are allowed;
- local `main` remains active regardless of publication failure.

## Synchronization invariants

- fetch cannot change local `main`;
- original local ref is retained until candidate validation completes;
- recognized published proposals are not replayed;
- remaining proposals preserve ordering and semantic diff;
- conflicts expose exact paths/commits and no automatic destructive command;
- successful completion atomically advances local `main` and admitted base.
