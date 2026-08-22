import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";

export type AwsCliFailureKind = "missing" | "unsupported" | "unauthorized" | "account-mismatch" | "not-found"
  | "throttled" | "timeout" | "output-limit" | "malformed" | "failed";

export class AwsCliError extends Error {
  readonly kind: AwsCliFailureKind;
  readonly retryable: boolean;

  constructor(kind: AwsCliFailureKind, message: string, retryable = false, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "AwsCliError";
    this.kind = kind;
    this.retryable = retryable;
  }
}

export type AwsProcessOutput = Readonly<{ stdout: string; stderr: string }>;
export type AwsProcessRunner = (args: readonly string[]) => Promise<AwsProcessOutput>;
type AwsProcess = ChildProcessByStdio<null, Readable, Readable>;
type SpawnAws = (args: readonly string[]) => AwsProcess;

const TIMEOUT_MS = 15_000;
const OUTPUT_LIMIT = 64 * 1024;

function defaultSpawn(args: readonly string[]): AwsProcess {
  return spawn("aws", [...args], { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
}

function classify(stderr: string): AwsCliError {
  if (/ExpiredToken|InvalidClientTokenId|UnrecognizedClient|Unable to locate credentials|SSO session.*expired/i.test(stderr)) {
    return new AwsCliError("unauthorized", "AWS CLI session is unavailable or expired");
  }
  if (/AccessDenied|UnauthorizedOperation|not authorized/i.test(stderr)) return new AwsCliError("unauthorized", "AWS denied the exact read-only operation");
  if (/NonExistentQueue|NotFound|does not exist/i.test(stderr)) return new AwsCliError("not-found", "AWS did not resolve the exact resource");
  if (/Throttl|TooManyRequests|RequestLimitExceeded|timeout|connection/i.test(stderr)) {
    return new AwsCliError("throttled", "AWS operation was throttled or unavailable", true);
  }
  return new AwsCliError("failed", "AWS CLI operation failed");
}

export function runAwsCli(args: readonly string[], spawnAws: SpawnAws = defaultSpawn): Promise<AwsProcessOutput> {
  if (!args.length || args.some((value) => !value || value.includes("\0"))) throw new AwsCliError("failed", "AWS CLI arguments are invalid");
  return new Promise((resolve, reject) => {
    let child: AwsProcess;
    try { child = spawnAws(args); }
    catch (cause) { reject(new AwsCliError("missing", "AWS CLI could not start", false, cause)); return; }
    const stdout: Buffer[] = [], stderr: Buffer[] = [];
    let bytes = 0, failure: AwsCliError | undefined, settled = false;
    const fail = (error: AwsCliError) => { if (!failure) { failure = error; child.kill("SIGKILL"); } };
    const timer = setTimeout(() => fail(new AwsCliError("timeout", "AWS CLI operation timed out", true)), TIMEOUT_MS);
    const collect = (target: Buffer[], chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > OUTPUT_LIMIT) fail(new AwsCliError("output-limit", "AWS CLI output exceeded its byte limit"));
      else target.push(chunk);
    };
    child.stdout.on("data", (chunk: Buffer) => collect(stdout, chunk));
    child.stderr.on("data", (chunk: Buffer) => collect(stderr, chunk));
    child.on("error", (cause) => fail(new AwsCliError("missing", "AWS CLI could not start", false, cause)));
    child.on("close", (code) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (failure) { reject(failure); return; }
      const output = { stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") };
      if (code !== 0) { reject(classify(output.stderr)); return; }
      resolve(output);
    });
  });
}
