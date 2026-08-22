# CLI Contract

```text
npm run benchmark:okf -- batch <suite> [UTC-run-id]
```

The command accepts only a manifest whose workflow is `batch-initial-ingest`,
validates all pinned fixtures, creates one immutable result directory and runs
one isolated model process. It exits nonzero for lifecycle or structural failure
while retaining available evidence. It never Accepts, Publishes or invokes a
provider.
