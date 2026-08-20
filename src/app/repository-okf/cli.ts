import fs from "node:fs";
import path from "node:path";

import {
  applyRepositoryProposal,
  diffRepositoryProposal,
  prepareRepositoryProposal,
  validateRepositoryProposal,
} from "./workflow/workflow.ts";
import { recoverRepositoryOkf } from "./workflow/recovery.ts";

type Writer = (value: string) => void;

function flags(args: readonly string[]): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--") || result[key] !== undefined) throw new Error("arguments must be unique --name value pairs");
    result[key] = value;
  }
  return result;
}

function required(values: Readonly<Record<string, string>>, key: string): string {
  const value = values[key];
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function evidenceDigest(values: Readonly<Record<string, string>>): string {
  const direct = values["--evidence-digest"];
  const evidenceFile = values["--evidence"];
  if (Boolean(direct) === Boolean(evidenceFile)) throw new Error("provide exactly one of --evidence or --evidence-digest");
  if (direct) return direct;
  const file = path.resolve(required(values, "--evidence"));
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { bundleDigest?: unknown };
  if (typeof parsed.bundleDigest !== "string") throw new Error("evidence file does not contain bundleDigest");
  return parsed.bundleDigest;
}

export async function executeOkfCli(
  args: readonly string[],
  writeOutput: Writer = (value) => process.stdout.write(value),
  writeError: Writer = (value) => process.stderr.write(value),
): Promise<number> {
  const [command, ...rest] = args;
  try {
    const values = flags(rest);
    const repository = path.resolve(required(values, "--repo"));
    let result: unknown;
    if (command === "prepare") result = prepareRepositoryProposal(repository, evidenceDigest(values));
    else if (command === "validate") result = validateRepositoryProposal(repository, required(values, "--proposal"));
    else if (command === "diff") result = diffRepositoryProposal(repository, required(values, "--proposal"));
    else if (command === "apply") result = applyRepositoryProposal(repository, required(values, "--proposal"), `cli:${process.pid}`);
    else if (command === "recover") result = recoverRepositoryOkf(repository, `cli:${process.pid}`);
    else throw new Error("OKF command must be prepare, validate, diff, apply or recover");
    writeOutput(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    writeError(`OKF workflow failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  }
}
