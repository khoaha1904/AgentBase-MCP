#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const TEST_PATTERN = /\.test\.(?:mjs|ts)$/;
const SKIPPED_DIRECTORIES = new Set([".git", "dist", "node_modules", "coverage"]);

function walk(directory, files) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isSymbolicLink()) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name) && !entry.name.startsWith(".")) walk(full, files);
    } else if (entry.isFile() && TEST_PATTERN.test(entry.name)) {
      files.push(full);
    }
  }
}

export function discoverTests(root) {
  const files = [];
  for (const owner of ["scripts", "src"]) walk(path.join(root, owner), files);
  return files.map((file) => path.relative(root, file).split(path.sep).join("/")).sort();
}

export function main(root = path.resolve(import.meta.dirname, ".."), args = process.argv.slice(2)) {
  const tests = discoverTests(root);
  if (!tests.length) {
    console.error("No tests discovered under scripts/ or src/.");
    return 1;
  }
  if (args.includes("--list")) {
    tests.forEach((file) => console.log(file));
    return 0;
  }
  const result = spawnSync(process.execPath, ["--test", ...tests], { cwd: root, stdio: "inherit" });
  return result.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
