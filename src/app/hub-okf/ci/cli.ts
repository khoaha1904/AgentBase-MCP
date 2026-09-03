import { validateHubCi } from "./validation.ts";

type Writer = (value: string) => void;

export async function executeHubCiCli(
  args: readonly string[],
  writeOutput: Writer = (value) => process.stdout.write(value),
  writeError: Writer = (value) => process.stderr.write(value),
): Promise<number> {
  try {
    const values: Record<string, string> = {};
    for (let index = 0; index < args.length; index += 2) {
      const key = args[index], value = args[index + 1];
      if (!key?.startsWith("--") || !value || value.startsWith("--") || values[key]) {
        throw new Error("Hub CI arguments must be unique --name value pairs");
      }
      values[key] = value;
    }
    if (Object.keys(values).some((key) => key !== "--root" && key !== "--format")) throw new Error("Hub CI argument is unknown");
    if (!values["--root"]) throw new Error("--root is required");
    const format = values["--format"] ?? "json";
    if (format !== "json" && format !== "github") throw new Error("--format must be json or github");
    const result = await validateHubCi(values["--root"]);
    writeOutput(format === "github" ? result.summary_markdown : `${JSON.stringify(result, null, 2)}\n`);
    return result.passed ? 0 : 1;
  } catch (error) {
    writeError(`Hub CI failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  }
}

