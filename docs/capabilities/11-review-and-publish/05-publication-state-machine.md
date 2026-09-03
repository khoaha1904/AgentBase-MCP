# 11.05 — Publication state

> Status: Core Git/pull-request recognition is implemented; no separate state store is required.

## Outcome

Publication status is derived from Git and a matching pull request rather than
stored in a second state machine prone to staleness.

```text
accepted commit remains after remoteBase     → Local Draft
+ matching open PR                     → In Review
proposal identity exists in remote target branch → Published
```

## Rules

- **Local Draft**: the accepted proposal remains in pending ancestry after the
  admitted Published base.
- **In Review**: Local Draft has an exactly matching open pull-request branch/base/head.
  This is a derived display state; it does not replace Local Draft or write to the Hub.
- **Published**: only when Synchronize recognizes the proposal in the fetched
  remote target branch through a commit, proposal/diff trailer or stable patch identity.
- Pull request closed without merge: the proposal remains a Local Draft and can
  be edited/republished through the review workflow; MCP does not reopen it or
  silently create another pull request.
- GitHub unavailable: publication review state is `unknown`; Local Draft is not
  lost, and an old receipt is not presented as current pull-request truth.

The publication receipt and transaction phase serve only retry/recovery. They do
not determine whether knowledge is Published. A legacy transaction missing a
profile ID/prior Published state can rebind to the active profile only when the
exact Main/Published/candidate state still matches; a difference stops for human
inspection rather than being guessed.

## Transitions

| Trigger | Result |
|---|---|
| Accept exact reviewed proposal | Local Draft commit |
| MCP creates/adopts exact open PR | derived In Review |
| PR closed without admitted merge | Local Draft |
| Maintainer merges and MCP synchronizes | Published |
| Network/permission failure | prior Git-backed state remains |

MCP does not automatically merge, approve, close, reopen, delete a branch or
change state to “fix” the lifecycle.

## Minimal implementation impact

Do not add a database, status file, polling daemon or background watcher. When
`In Review` must be displayed, the explicit publication/status flow reads the
matching pull request; ordinary Hub query does not call GitHub. Current pending
ancestry, publication receipts and synchronization recognition provide the
required foundation.
