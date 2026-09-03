import {
  createProviderObservation,
  type ExternalIdentity,
  type ProviderObservation,
} from "../../core/knowledge/index.ts";
import { AwsCliError, runAwsCli, type AwsProcessRunner } from "./process.ts";
import {
  AWS_SQS_PROFILE, AWS_STS_PROFILE, awsVersionArgs, callerIdentityArgs,
  queueAttributesArgs, queueUrlArgs,
} from "./profiles.ts";

export type AwsAuthority = Readonly<{ accountId: string; cliVersion: string }>;
export type VerifySqsQueueInput = Readonly<{
  name: string;
  accountId: string;
  region: string;
  observedAt: string;
}>;
export type VerifiedSqsQueue = Readonly<{
  identity: ExternalIdentity;
  observation: ProviderObservation;
  queueUrl: string;
}>;

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new AwsCliError("malformed", "AWS CLI returned malformed JSON");
  return value as Record<string, unknown>;
}

function json(output: Readonly<{ stdout: string }>): Record<string, unknown> {
  try { return object(JSON.parse(output.stdout) as unknown); }
  catch (cause) { throw cause instanceof AwsCliError ? cause : new AwsCliError("malformed", "AWS CLI returned malformed JSON", false, cause); }
}

function exactString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value || value.includes("\n")) throw new AwsCliError("malformed", `AWS CLI response is missing ${key}`);
  return value;
}

function validRegion(value: string): boolean { return /^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(value); }
function validQueueName(value: string): boolean { return /^[A-Za-z0-9_-]{1,80}(?:\.fifo)?$/.test(value); }

export class AwsCliAdapter {
  readonly #run: AwsProcessRunner;

  constructor(run: AwsProcessRunner = runAwsCli) { this.#run = run; }

  async preflight(expectedAccountId: string): Promise<AwsAuthority> {
    if (!/^\d{12}$/.test(expectedAccountId)) throw new Error("expected AWS account ID is invalid");
    const versionOutput = await this.#run(awsVersionArgs());
    const versionText = `${versionOutput.stdout} ${versionOutput.stderr}`.trim();
    const version = versionText.match(/aws-cli\/(\d+)\.([0-9.]+)/i);
    if (!version?.[1] || version[1] !== "2") throw new AwsCliError("unsupported", "AWS CLI major version 2 is required");
    const identity = json(await this.#run(callerIdentityArgs()));
    const accountId = exactString(identity, "Account");
    if (accountId !== expectedAccountId) throw new AwsCliError("account-mismatch", "active AWS account does not match the confirmed account");
    return { accountId, cliVersion: `2.${version[2]}` };
  }

  async verifySqsQueue(input: VerifySqsQueueInput): Promise<VerifiedSqsQueue> {
    if (!validQueueName(input.name) || !/^\d{12}$/.test(input.accountId) || !validRegion(input.region)) {
      throw new Error("exact SQS queue scope is invalid");
    }
    const queueUrl = exactString(json(await this.#run(queueUrlArgs(input.name, input.accountId, input.region))), "QueueUrl");
    if (!/^https:\/\/[A-Za-z0-9.-]+\/[A-Za-z0-9_./-]+$/.test(queueUrl)) throw new AwsCliError("malformed", "AWS returned an unsafe queue URL");
    const response = json(await this.#run(queueAttributesArgs(queueUrl, input.region)));
    const attributes = object(response.Attributes), arn = exactString(attributes, "QueueArn");
    const match = arn.match(/^arn:(aws(?:-[a-z]+)?):sqs:([a-z0-9-]+):(\d{12}):([A-Za-z0-9_-]{1,80}(?:\.fifo)?)$/);
    if (!match || match[2] !== input.region || match[3] !== input.accountId || match[4] !== input.name) {
      throw new AwsCliError("malformed", "SQS ARN conflicts with confirmed queue scope");
    }
    const values: Record<string, number> = {};
    for (const key of ["VisibilityTimeout", "MessageRetentionPeriod", "ReceiveMessageWaitTimeSeconds"] as const) {
      const raw = attributes[key];
      if (raw === undefined) continue;
      if (typeof raw !== "string" || !/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
        throw new AwsCliError("malformed", `SQS attribute ${key} is invalid`);
      }
      values[key] = Number(raw);
    }
    const observation = createProviderObservation({
      provider: "aws",
      profileFamily: AWS_SQS_PROFILE.family,
      profileVersion: AWS_SQS_PROFILE.version,
      authority: input.accountId,
      location: input.region,
      nativeIdentity: arn,
      values,
      observedAt: input.observedAt,
    });
    const sourceId = `aws-sqs-${observation.evidenceDigest.slice(-24)}`;
    return {
      queueUrl,
      observation,
      identity: {
        provider: "aws", identityType: "arn", value: arn, service: "sqs", resourceType: "queue",
        scope: { account_id: input.accountId, region: input.region }, evidence: [sourceId], observedAt: input.observedAt,
      },
    };
  }
}

export const AWS_CLI_PROFILE_VERSIONS = Object.freeze({
  [AWS_STS_PROFILE.family]: AWS_STS_PROFILE.version,
  [AWS_SQS_PROFILE.family]: AWS_SQS_PROFILE.version,
});
