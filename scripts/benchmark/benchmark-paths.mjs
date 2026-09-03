import path from "node:path";

export const projectRoot = path.resolve(import.meta.dirname, "../..");

let configuredRoot = path.resolve(
  process.env.AGENTBASE_BENCHMARK_ROOT ?? path.join(projectRoot, "../AgentBase-Benchmark"),
);

export function setBenchmarkRoot(root) {
  if (typeof root !== "string" || !root.trim()) throw new Error("benchmark root must be a non-empty path");
  configuredRoot = path.resolve(root);
  return configuredRoot;
}

export function benchmarkRoot() {
  return configuredRoot;
}

export function benchmarkPath(...parts) {
  const root = benchmarkRoot();
  const resolved = path.resolve(root, ...parts);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`benchmark path escapes root: ${parts.join("/")}`);
  }
  return resolved;
}
