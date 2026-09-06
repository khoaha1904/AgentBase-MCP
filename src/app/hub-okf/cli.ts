import type { HubToolActions } from "./mcp/mcp-tools.ts";

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
    if (command === "status") output = await actions.status();
    else if (command === "configure") {
      output = await actions.configure({ repositoryUrl: required(values, "--url"), targetBranch: required(values, "--branch") });
    } else if (command === "bootstrap-preview" || command === "bootstrap") {
      const repositoryUrl = required(values, "--url");
      const targetBranch = required(values, "--branch");
      output = command === "bootstrap-preview"
        ? await actions.previewBootstrap(repositoryUrl, targetBranch)
        : await actions.bootstrap(repositoryUrl, targetBranch);
    } else if (command === "prepare") {
      const mode = required(values, "--mode");
      if (mode !== "refresh") {
        throw new Error("CLI prepare supports refresh only; run Initial Ingest through the agentbase-ingest skill");
      }
      output = await actions.prepare({
        mode,
        sourceRepository: required(values, "--repo"),
        subjectDirectory: required(values, "--subject"),
        signals: required(values, "--signals").split(",").map((value) => value.trim()).filter(Boolean),
      });
    } else if (command === "finalize") output = await actions.finalize(required(values, "--session"));
    else if (command === "inspect") output = await actions.inspect(required(values, "--proposal"));
    else if (command === "search") {
      const limit = values["--limit"] === undefined ? undefined : Number(values["--limit"]);
      const global = values["--global"];
      if (global !== undefined && global !== "true" && global !== "false") throw new Error("--global must be true or false");
      output = await actions.search(required(values, "--query"), {
        ...(values["--domain"] ? { domain: values["--domain"] } : {}),
        ...(values["--types"] ? { types: values["--types"].split(",").filter(Boolean) } : {}),
        ...(global === undefined ? {} : { global: global === "true" }),
        ...(limit === undefined ? {} : { limit }),
      });
    } else if (command === "read") output = await actions.read(required(values, "--path"));
    else if (command === "synchronize") output = await actions.synchronize();
    else if (command === "recover") output = await actions.recover(required(values, "--transaction"));
    else throw new Error(
      "Hub command must be status, configure, bootstrap-preview, bootstrap, prepare, finalize, inspect, "
      + "search, read, synchronize or recover",
    );
    writeOutput(`${JSON.stringify(output, null, 2)}\n`);
    return 0;
  } catch (error) {
    writeError(`Hub workflow failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  }
}
