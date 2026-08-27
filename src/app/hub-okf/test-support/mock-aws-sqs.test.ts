import assert from "node:assert/strict";
import test from "node:test";

import { AwsCliAdapter, AwsCliError } from "../../../providers/aws-cli/index.ts";
import { createMockAwsSqsRunner } from "./mock-aws-sqs.ts";

const ACCOUNT = "123456789012";
const REGION = "ap-southeast-1";

test("[AB-ENRICH-011][AB-ENRICH-014] mock runner follows bounded SQS CLI contract", async () => {
  const mock = createMockAwsSqsRunner({ accountId: ACCOUNT, queues: [{ name: "crawler-events", accountId: ACCOUNT, region: REGION }] });
  const adapter = new AwsCliAdapter(mock.runner);
  assert.deepEqual(await adapter.preflight(ACCOUNT), { accountId: ACCOUNT, cliVersion: "2.30.0" });
  const verified = await adapter.verifySqsQueue({ name: "crawler-events", accountId: ACCOUNT, region: REGION, observedAt: "2026-08-27T00:00:00Z" });
  assert.equal(verified.identity.value, `arn:aws:sqs:${REGION}:${ACCOUNT}:crawler-events`);
  assert.equal(verified.observation.values.VisibilityTimeout, 30);
  assert.deepEqual(mock.calls.map((args) => args.slice(0, 3)), [["--version"], ["sts", "get-caller-identity", "--output"], ["sqs", "get-queue-url", "--queue-name"], ["sqs", "get-queue-attributes", "--queue-url"]]);
  await assert.rejects(mock.runner(["sqs", "list-queues", "--region", REGION]), (error: unknown) => error instanceof AwsCliError && error.kind === "failed");
});

test("[AB-ENRICH-011][AB-ENRICH-014] mock runner preserves unresolved and retryable outcomes", async () => {
  const mock = createMockAwsSqsRunner({ accountId: ACCOUNT, queues: [
    { name: "denied", accountId: ACCOUNT, region: REGION },
    { name: "eventual", accountId: ACCOUNT, region: REGION },
  ], failures: [
    { name: "denied", accountId: ACCOUNT, region: REGION, operation: "get-queue-url", kind: "unauthorized", message: "mock access denied" },
    { name: "eventual", accountId: ACCOUNT, region: REGION, operation: "get-queue-url", kind: "throttled", message: "mock throttling", retryable: true },
  ] });
  const adapter = new AwsCliAdapter(mock.runner);
  await assert.rejects(adapter.verifySqsQueue({ name: "denied", accountId: ACCOUNT, region: REGION, observedAt: "2026-08-27T00:00:00Z" }),
    (error: unknown) => error instanceof AwsCliError && error.kind === "unauthorized");
  await assert.rejects(adapter.verifySqsQueue({ name: "eventual", accountId: ACCOUNT, region: REGION, observedAt: "2026-08-27T00:00:00Z" }),
    (error: unknown) => error instanceof AwsCliError && error.kind === "throttled" && error.retryable);
  const retried = await adapter.verifySqsQueue({ name: "eventual", accountId: ACCOUNT, region: REGION, observedAt: "2026-08-27T00:00:00Z" });
  assert.equal(retried.identity.value, `arn:aws:sqs:${REGION}:${ACCOUNT}:eventual`);
});
