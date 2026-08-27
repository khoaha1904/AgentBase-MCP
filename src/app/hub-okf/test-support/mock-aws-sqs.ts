import {
  AwsCliError,
  type AwsCliFailureKind,
  type AwsProcessRunner,
} from "../../../providers/aws-cli/index.ts";

export type MockAwsSqsQueue = Readonly<{
  name: string;
  accountId: string;
  region: string;
  arn?: string;
  attributes?: Readonly<Record<string, string>>;
}>;

export type MockAwsSqsFailure = Readonly<{
  name: string;
  accountId: string;
  region: string;
  operation: "get-queue-url" | "get-queue-attributes";
  kind: AwsCliFailureKind;
  message: string;
  retryable?: boolean;
  attempts?: number;
}>;

export type MockAwsSqsRunner = Readonly<{
  runner: AwsProcessRunner;
  calls: string[][];
}>;

function queueKey(name: string, accountId: string, region: string): string {
  return `${accountId}/${region}/${name}`;
}

function failureKey(failure: MockAwsSqsFailure): string {
  return `${failure.operation}/${queueKey(failure.name, failure.accountId, failure.region)}`;
}

function fail(failure: MockAwsSqsFailure): never {
  throw new AwsCliError(failure.kind, failure.message, failure.retryable ?? false);
}

/**
 * Deterministic process-boundary fake for the released AWS/SQS adapter.
 * It intentionally understands only the four bounded calls used by the adapter.
 */
export function createMockAwsSqsRunner(input: Readonly<{
  accountId: string;
  cliVersion?: string;
  queues: readonly MockAwsSqsQueue[];
  failures?: readonly MockAwsSqsFailure[];
}>): MockAwsSqsRunner {
  const calls: string[][] = [], queueByKey = new Map(input.queues.map((queue) => [
    queueKey(queue.name, queue.accountId, queue.region), queue,
  ]));
  const failures = new Map((input.failures ?? []).map((failure) => [failureKey(failure), failure]));
  const attempts = new Map<string, number>();
  const runner: AwsProcessRunner = async (args) => {
    calls.push([...args]);
    if (args.length === 1 && args[0] === "--version") {
      return { stdout: "", stderr: input.cliVersion ?? "aws-cli/2.30.0 Python/3.13" };
    }
    if (args[0] === "sts" && args[1] === "get-caller-identity") {
      return { stdout: JSON.stringify({ Account: input.accountId }), stderr: "" };
    }
    const regionIndex = args.indexOf("--region"), region = regionIndex >= 0 ? args[regionIndex + 1] : undefined;
    if (typeof region !== "string") throw new AwsCliError("failed", "mock SQS call is missing region");
    const nameIndex = args.indexOf("--queue-name");
    if (nameIndex >= 0) {
      const name = args[nameIndex + 1], ownerIndex = args.indexOf("--queue-owner-aws-account-id");
      const accountId = ownerIndex >= 0 ? args[ownerIndex + 1] : undefined;
      if (typeof name !== "string" || typeof accountId !== "string") throw new AwsCliError("failed", "mock SQS URL call is incomplete");
      const key = queueKey(name, accountId, region), failure = failures.get(`get-queue-url/${key}`);
      const attempt = (attempts.get(`get-queue-url/${key}`) ?? 0) + 1;
      attempts.set(`get-queue-url/${key}`, attempt);
      if (failure && attempt <= (failure.attempts ?? 1)) fail(failure);
      const queue = queueByKey.get(key);
      if (!queue) throw new AwsCliError("not-found", "mock AWS did not resolve the exact queue");
      return { stdout: JSON.stringify({ QueueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/${name}` }), stderr: "" };
    }
    const urlIndex = args.indexOf("--queue-url"), url = urlIndex >= 0 ? args[urlIndex + 1] : undefined;
    if (typeof url !== "string") throw new AwsCliError("failed", "mock SQS attributes call is incomplete");
    const match = url.match(/^https:\/\/sqs\.[^/]+\.amazonaws\.com\/(\d{12})\/([A-Za-z0-9_.-]+)$/);
    if (!match?.[1] || !match[2]) throw new AwsCliError("malformed", "mock SQS URL is invalid");
    const accountId = match[1], name = match[2], key = queueKey(name, accountId, region);
    const failure = failures.get(`get-queue-attributes/${key}`), attempt = (attempts.get(`get-queue-attributes/${key}`) ?? 0) + 1;
    attempts.set(`get-queue-attributes/${key}`, attempt);
    if (failure && attempt <= (failure.attempts ?? 1)) fail(failure);
    const queue = queueByKey.get(key);
    if (!queue) throw new AwsCliError("not-found", "mock AWS did not resolve the exact queue");
    const Attributes = { QueueArn: queue.arn ?? `arn:aws:sqs:${region}:${accountId}:${name}`,
      VisibilityTimeout: "30", MessageRetentionPeriod: "345600", ReceiveMessageWaitTimeSeconds: "0",
      ...(queue.attributes ?? {}) };
    return { stdout: JSON.stringify({ Attributes }), stderr: "" };
  };
  return { runner, calls };
}
