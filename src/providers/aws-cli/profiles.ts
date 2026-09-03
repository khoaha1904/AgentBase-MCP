export const AWS_STS_PROFILE = Object.freeze({ family: "aws.sts.caller-identity", version: 1 });
export const AWS_SQS_PROFILE = Object.freeze({ family: "aws.sqs.queue", version: 1 });

const GLOBAL = ["--output", "json", "--no-cli-pager", "--no-cli-auto-prompt", "--color", "off"] as const;

export function awsVersionArgs(): readonly string[] { return ["--version"]; }
export function callerIdentityArgs(): readonly string[] { return ["sts", "get-caller-identity", ...GLOBAL]; }
export function queueUrlArgs(name: string, owner: string, region: string): readonly string[] {
  return ["sqs", "get-queue-url", "--queue-name", name, "--queue-owner-aws-account-id", owner,
    "--region", region, ...GLOBAL];
}
export function queueAttributesArgs(url: string, region: string): readonly string[] {
  return ["sqs", "get-queue-attributes", "--queue-url", url, "--attribute-names",
    "QueueArn", "VisibilityTimeout", "MessageRetentionPeriod", "ReceiveMessageWaitTimeSeconds",
    "--region", region, ...GLOBAL];
}
