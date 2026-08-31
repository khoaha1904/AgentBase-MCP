# Quickstart: qualify AIT visual context and the Hub fixture

1. Run `node src/cli.ts status` and confirm the active target is
   `khoaha1904/hub-3`, branch `main`, with local/remote current and no recovery.
2. Run focused tests:
   `node --test scripts/qualification/hub3-sqs-fixture.test.mjs src/app/hub-okf/test-support/mock-aws-sqs.test.ts`.
3. Run `node scripts/qualification/hub3-sqs-fixture.mjs` and inspect its proposal
   ID, digest, confirmed outcome and exact bounded AWS argv.
4. Inspect and Accept with the commands in
   [contracts/qualification-cli.md](contracts/qualification-cli.md).
5. Submit the accepted proposal, review the returned PR, merge it externally and
   run `node src/cli.ts hub sync`.
6. Read both Questions at the synchronized Published commit: the queue
   provider-identity Question is resolved and the operational-ownership Question
   remains open.
7. Prepare the Phase 1 Crawler Architecture packet and review it as a Discovery
   Impact Map against `AB-CONTEXT-VIS-001..004`.
8. Run `npm run verify` before closing the capability.
