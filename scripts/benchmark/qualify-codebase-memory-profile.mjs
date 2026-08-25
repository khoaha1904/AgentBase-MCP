#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = path.resolve(import.meta.dirname, "../..");
const binary = process.env.AGENTBASE_CBM_BINARY
  ?? path.join(root, "build/providers/codebase-memory/linux-x64/codebase-memory-mcp");
const repository = path.join(root, "fixtures/codebase-memory-profile-mixed");
const supportedFiles = [
  "supported.sh",
  "Dockerfile",
  "supported.go",
  "supported.tf",
  "Supported.java",
  "supported.js",
  "supported.json",
  "supported.md",
  "supported.py",
  "Supported.tsx",
  "supported.ts",
  "supported.yaml",
];
const unsupportedFile = "unsupported.rs";
const cache = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-qualification-"));
const project = "agentbase-parser-profile";
const target = process.env.AGENTBASE_CBM_TARGET;
const transport = new StdioClientTransport({
  command: binary,
  cwd: repository,
  env: { ...process.env, CBM_CACHE_DIR: cache, CBM_ALLOWED_ROOT: repository,
    CBM_LOG_LEVEL: "error", HOME: cache, LANG: "C.UTF-8", LC_ALL: "C.UTF-8" },
  stderr: "pipe",
});
const client = new Client({ name: "agentbase-profile-qualification", version: "0.0.0" });
const textOf = (value) => JSON.stringify(value.structuredContent ?? value.content ?? value);

try {
  await client.connect(transport, { timeout: 30_000 });
  const indexed = await client.callTool({ name: "index_repository", arguments: {
    repo_path: repository, name: project, mode: "fast", persistence: false,
  } }, { timeout: 180_000 });
  const searched = await client.callTool({ name: "search_graph", arguments: {
    project, name_pattern: "supportedGreeting", limit: 10, format: "json",
  } }, { timeout: 60_000 });
  const coverage = await client.callTool({ name: "check_index_coverage", arguments: {
    project, paths: [...supportedFiles, unsupportedFile],
  } }, { timeout: 60_000 });
  const indexText = textOf(indexed);
  const searchText = textOf(searched);
  const coverageText = textOf(coverage);
  const coveragePaths = coverage.structuredContent?.paths ?? [];
  const coverageByPath = new Map(coveragePaths.map((entry) => [entry.path, entry]));
  const skippedFiles = indexed.structuredContent?.skipped?.files ?? [];
  const result = {
    schemaVersion: 1,
    profile: "agentbase-mvp-12-v1",
    supportedFiles,
    checks: {
      indexSucceeded: indexed.isError !== true,
      supportedSymbolFound: searchText.includes("supportedGreeting"),
      allSupportedFilesAccepted: supportedFiles.every((file) => {
        const entry = coverageByPath.get(file);
        return entry?.status === "no_recorded_issue"
          && !entry.coverage?.some((issue) => issue.kind === "unsupported" || issue.kind === "parse_error");
      }),
      onlyOutOfProfileFileSkipped: skippedFiles.length === 1
        && skippedFiles[0]?.path === unsupportedFile,
      unsupportedFileVisible: (indexText + coverageText).includes(unsupportedFile),
      unsupportedReasonVisible: (indexText + coverageText).includes("AgentBase parser profile"),
      noPartialParse: indexed.structuredContent?.parse_partial_count === 0,
    },
  };
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (target) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, output, { mode: 0o600 });
  }
  process.stdout.write(output);
  if (Object.values(result.checks).some((value) => value !== true)) process.exitCode = 1;
} finally {
  await client.close().catch(() => undefined);
  fs.rmSync(cache, { recursive: true, force: true });
}
