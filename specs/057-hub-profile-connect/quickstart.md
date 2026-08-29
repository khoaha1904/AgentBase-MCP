# Quickstart — AgentBase CLI Surface and Hub Connect

## Public help

```bash
abs --help
```

Expected result: only `status`, `hub connect` and `hub sync` are shown.

## Connect a Hub

```bash
abs hub connect \
  --url https://github.com/OWNER/HUB.git \
  --branch main
```

Expected result: a masked token prompt appears. Enter a token once; on later
connects press Enter on an empty prompt to reuse that shared token. The command
then validates the destination and `abs status` reports it active.

## Sync explicitly

```bash
abs hub sync
```

Synchronization is separate from connect and is never implicit.

## Failure/recovery checks

1. Use a non-interactive invocation without a stored token: connect fails and
   explains that a masked token is required.
2. Enter a replacement token but make destination attach fail: the previous
   shared token and active identity remain unchanged.
3. Seed a shared token and submit blank input: connect succeeds without asking
   GitHub CLI or copying a profile credential.
4. Search output, errors, Git config and repository files for the fixture token;
   zero matches are allowed.

An uncatchable process termination is not simulated as rollback: it may retain
the private destination token, while the atomic active-profile pointer remains
unchanged and a later connect safely reuses the token.

## Repository gate

```bash
npm run verify
```
