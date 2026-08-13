import type { HubToolActions } from "./mcp-tools.ts";

type Writer = (value: string) => void;

function flags(args: readonly string[]): Readonly<Record<string, string>> {
  const values: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index], value = args[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--") || values[key]) {
      throw new Error("Hub arguments must be unique --name value pairs");
    }
    if (["--token", "--remote", "--target", "--force", "--merge"].includes(key)) {
      throw new Error(`${key} is forbidden; Hub authority comes from fixed runtime configuration`);
    }
    values[key] = value;
  }
  return values;
}

function required(values: Readonly<Record<string, string>>, key: string): string {
  const value = values[key];
  if (!value) throw new Error(`${key} is required`);
  return value;
}

export async function executeHubCli(
  args: readonly string[],
  actions?: HubToolActions,
  writeOutput: Writer = (value) => process.stdout.write(value),
  writeError: Writer = (value) => process.stderr.write(value),
): Promise<number> {
  try {
    if (!actions) throw new Error("AgentBase Hub runtime is not configured");
    const [command, ...rest] = args;
    const values = flags(rest);
    let output: unknown;
    if (command === "prepare") {
      const mode = required(values, "--mode");
      if (mode !== "new" && mode !== "refresh") throw new Error("--mode must be new or refresh");
      output = await actions.prepare({
        mode,
        sourceRepository: required(values, "--repo"),
        evidenceDigest: required(values, "--evidence"),
        subjectDirectory: required(values, "--subject"),
        signals: required(values, "--signals").split(",").map((value) => value.trim()).filter(Boolean),
      });
    } else if (command === "finalize") output = await actions.finalize(required(values, "--session"));
    else if (command === "inspect") output = await actions.inspect(required(values, "--proposal"));
    else if (command === "accept") {
      output = await actions.accept(required(values, "--proposal"), required(values, "--digest"));
    } else if (command === "search") {
      const limit = values["--limit"] === undefined ? undefined : Number(values["--limit"]);
      output = await actions.search(required(values, "--query"), limit);
    } else if (command === "read") output = await actions.read(required(values, "--path"));
    else if (command === "pending") output = await actions.listPending();
    else if (command === "submit") {
      output = await actions.submitMany(required(values, "--proposals").split(",").filter(Boolean));
    } else if (command === "synchronize") output = await actions.synchronize();
    else if (command === "recover") output = await actions.recover(required(values, "--transaction"));
    else throw new Error("Hub command must be prepare, finalize, inspect, accept, search, read, pending, submit, synchronize or recover");
    writeOutput(`${JSON.stringify(output, null, 2)}\n`);
    return 0;
  } catch (error) {
    writeError(`Hub workflow failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  }
}
