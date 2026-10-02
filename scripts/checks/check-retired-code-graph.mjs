#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const RETIRED_PATHS = [
  "vendor/codebase-memory", "src/providers/codebase-memory",
  "src/providers/fake-code-intelligence", "src/core/code-intelligence",
  "src/core/observations", "src/app/codebase-memory-mcp",
  "src/app/repository-okf", "src/app/foundation-demo",
  ".agents/skills/use-codebase-memory", "scripts/installation/provider-bundle.mjs",
  "scripts/upstream/check-codebase-memory-bundle.mjs",
  "scripts/upstream/prepare-codebase-memory.mjs",
  "scripts/upstream/package-codebase-memory.mjs",
  "scripts/benchmark", "build/providers/codebase-memory", "build/upstreams/codebase-memory",
];
const RETIRED_IMPORT = /\b(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)["'][^"'\n]*(?:codebase-memory|code-intelligence|repository-okf|core\/observations)[^"'\n]*["']/;

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : sourceFiles(file);
    return entry.isFile() && /\.(?:ts|mjs|cjs|js)$/.test(entry.name) && !/\.test\./.test(entry.name)
      ? [file] : [];
  });
}

export function checkRetiredCodeGraph(root) {
  const failures = [];
  for (const relative of RETIRED_PATHS) {
    if (fs.lstatSync(path.join(root, relative), { throwIfNoEntry: false })) {
      failures.push(`retired code graph path exists: ${relative}`);
    }
  }
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    if (/codebase-memory|code-intelligence|repository-okf|scripts\/benchmark/i.test(`${name} ${command}`)) {
      failures.push(`retired code graph or benchmark package script: ${name}`);
    }
  }
  for (const name of Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies,
    ...packageJson.optionalDependencies })) {
    if (/codebase-memory/i.test(name)) failures.push(`retired code graph dependency: ${name}`);
  }
  for (const file of [...sourceFiles(path.join(root, "src")), ...sourceFiles(path.join(root, "scripts"))]) {
    if (RETIRED_IMPORT.test(fs.readFileSync(file, "utf8"))) {
      failures.push(`retired code graph import: ${path.relative(root, file).split(path.sep).join("/")}`);
    }
  }
  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const failures = checkRetiredCodeGraph(path.resolve(import.meta.dirname, "../.."));
  if (failures.length) {
    failures.forEach((failure) => process.stderr.write(`${failure}\n`));
    process.exitCode = 1;
  } else process.stdout.write("Retired code graph check passed: no provider paths, imports, dependencies or build caches.\n");
}
