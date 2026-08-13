# Data Model: Client MCP Registration

## Expected Client Entry

One immutable normalized target shared semantically by both providers.

- `name`: exact `agentbase`
- `transport`: exact `stdio`
- `command`: absolute admitted Node executable
- `args`: absolute admitted `src/cli.ts`, then `mcp`
- `scope`: effective user-global scope
- `environment`: empty
- `checkoutIdentity`: absolute real checkout root plus bounded entrypoint identity

Validation rejects relative/missing paths, unsafe checkout escape, shell command
composition, a missing MCP entrypoint and environment fields.

## Client Descriptor

Concrete provider behavior for `codex` or `claude-code`.

- stable client ID and display name
- admitted executable real path and bounded version/help identity
- shell-free get/add/remove argument builders
- named-entry output normalizer
- provider config path used only for bounded identity/snapshot recovery

Only the two admitted descriptors exist in this capability.

## Client Pre-state

- client ID and executable identity
- named entry classification: `absent` or `exact`
- exact normalized entry when present
- provider config presence, file type, permissions and pre-mutation digest
- owner-private snapshot reference and digest when a config file exists

`conflict`, unavailable, unsupported and uninspectable are failures, not admitted
pre-states.

## Registration Transaction

- schema version and transaction ID
- checkout identity and expected entry digest
- ordered selected client IDs
- immutable pre-states
- phase: `prepared`, `adding`, `rolling-back`, `committed` or `recovery-required`
- per-client state: `unchanged`, `add-started`, `added`, `verified`,
  `remove-started`, `removed`
- bounded failure category and affected client, never raw provider output

Transitions:

```text
preflight -> prepared -> adding -> committed -> receipt removed
                         |
                         +-> rolling-back -> receipt removed
                                           |
                                           +-> recovery-required -> retry recovery
```

An exact pre-existing entry stays `unchanged`. Only a pre-state of `absent` may
enter an add/remove transition.

## Recovery Receipt

Owner-private atomic JSON under the AgentBase-MCP global config directory.

- contains the Registration Transaction fields required for recovery
- references snapshots only inside its private transaction directory
- contains digests/identities, not raw client configuration or credentials
- is non-symlink, regular, mode `0600`; parent/transaction directory mode `0700`
- belongs to exactly one checkout/expected-entry identity

A malformed, unsafe or mismatched receipt blocks new registration and produces
manual recovery guidance. It is deleted only after verified commit or verified
rollback; retained evidence is never placed in the repository.

## Registration Result

Per selected client:

- `already-registered`: exact before and unchanged
- `registered`: absent before, added and verified

Whole operation:

- `registered`: every selected result committed
- `rolled-back`: failure occurred and all new entries were verified absent
- `recovery-required`: automatic rollback could not safely complete

Credential result remains the existing independent `created`, `preserved` or
`skipped` outcome.
