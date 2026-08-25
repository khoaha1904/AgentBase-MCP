import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { CodebaseMemoryError } from "./errors.ts";
import { resolveOwnedRuntime } from "./owned-runtime.ts";

const surfaceSource = new URL("../../../fixtures/codebase-memory-v0.10.8/mcp-surface.json", import.meta.url);
const safeTools = [
  "index_repository", "search_graph", "trace_path", "get_code_snippet",
  "get_architecture", "search_code", "index_status", "check_index_coverage",
  "detect_changes",
];

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function fixture(): Readonly<{ root: string; source: string; profile: string; manifest: string; executable: string }> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-owned-runtime-"));
  const vendor = path.join(root, "vendor/codebase-memory");
  const source = path.join(vendor, "upstream/source.txt");
  const profile = path.join(vendor, "agentbase/parser-profile.json");
  const patch = path.join(vendor, "agentbase/patches/0001-parser-profile.patch");
  const surface = path.join(root, "fixtures/codebase-memory-v0.10.8/mcp-surface.json");
  const runtime = path.join(root, "build/providers/codebase-memory/linux-x64");
  const executable = path.join(runtime, "codebase-memory-mcp");
  for (const directory of [path.dirname(source), path.dirname(profile), path.dirname(patch), path.dirname(surface), runtime]) {
    fs.mkdirSync(directory, { recursive: true });
  }
  fs.writeFileSync(source, "owned source\n");
  const inventory = `${sha256(fs.readFileSync(source))}  upstream/source.txt\n`;
  fs.writeFileSync(path.join(vendor, "inventory.sha256"), inventory);
  fs.writeFileSync(profile, JSON.stringify({ schemaVersion: 1, id: "agentbase-mvp-12-v1", version: 1,
    upstreamCommit: "46ae198fc11cda80e817acbc5f5908d7c2de7032" }));
  fs.writeFileSync(patch, "profile patch\n");
  fs.copyFileSync(surfaceSource, surface);
  fs.writeFileSync(executable, "#!/bin/sh\nprintf 'codebase-memory-mcp 0.10.8\\n'\n", { mode: 0o755 });
  const surfaceValue = JSON.parse(fs.readFileSync(surface, "utf8")) as { tools: Array<{ name: string; inputSchema: unknown }> };
  const byName = new Map(surfaceValue.tools.map((tool) => [tool.name, tool]));
  const selected = safeTools.map((name) => ({ name, inputSchema: byName.get(name)?.inputSchema }));
  const manifest = path.join(runtime, "artifact-manifest.json");
  fs.writeFileSync(manifest, JSON.stringify({
    schema_version: 1,
    provider: "codebase-memory-mcp",
    provider_version: "0.10.8",
    upstream_commit: "46ae198fc11cda80e817acbc5f5908d7c2de7032",
    source_digest: sha256(inventory),
    profile_id: "agentbase-mvp-12-v1",
    profile_version: 1,
    profile_digest: sha256(Buffer.concat([fs.readFileSync(profile), fs.readFileSync(patch)])),
    platform: "linux",
    architecture: "x64",
    executable_sha256: sha256(fs.readFileSync(executable)),
    tool_manifest_sha256: sha256(fs.readFileSync(surface)),
    tool_schema_sha256: sha256(canonical(selected)),
    adapter_version: 1,
    build_identity: {},
    omitted_grammar_factories: 147,
  }));
  return { root, source, profile, manifest, executable };
}

function code(expected: CodebaseMemoryError["code"]): (error: unknown) => boolean {
  return (error) => error instanceof CodebaseMemoryError && error.code === expected;
}

test("admits the exact repository-owned artifact", async (t) => {
  const value = fixture();
  t.after(() => fs.rmSync(value.root, { recursive: true, force: true }));
  const runtime = await resolveOwnedRuntime({ projectRoot: value.root, platform: "linux", architecture: "x64" });
  assert.equal(runtime.identity.providerVersion, "0.10.8");
  assert.match(runtime.identity.packageIntegrity, /^source-sha256:[a-f0-9]{64};profile-sha256:[a-f0-9]{64}$/);
});

test("rejects a missing artifact", async (t) => {
  const value = fixture();
  t.after(() => fs.rmSync(value.root, { recursive: true, force: true }));
  fs.rmSync(value.executable);
  await assert.rejects(resolveOwnedRuntime({ projectRoot: value.root, platform: "linux", architecture: "x64" }),
    code("OWNED_RUNTIME_MISSING"));
});

test("rejects source drift before process startup", async (t) => {
  const value = fixture();
  t.after(() => fs.rmSync(value.root, { recursive: true, force: true }));
  fs.appendFileSync(value.source, "drift\n");
  await assert.rejects(resolveOwnedRuntime({ projectRoot: value.root, platform: "linux", architecture: "x64" }),
    code("SOURCE_INTEGRITY_FAILED"));
});

test("rejects manifest platform drift", async (t) => {
  const value = fixture();
  t.after(() => fs.rmSync(value.root, { recursive: true, force: true }));
  const manifest = JSON.parse(fs.readFileSync(value.manifest, "utf8")) as Record<string, unknown>;
  manifest.architecture = "arm64";
  fs.writeFileSync(value.manifest, JSON.stringify(manifest));
  await assert.rejects(resolveOwnedRuntime({ projectRoot: value.root, platform: "linux", architecture: "x64" }),
    code("OWNED_RUNTIME_INVALID"));
});

test("rejects parser-profile drift", async (t) => {
  const value = fixture();
  t.after(() => fs.rmSync(value.root, { recursive: true, force: true }));
  fs.appendFileSync(value.profile, "\n");
  await assert.rejects(resolveOwnedRuntime({ projectRoot: value.root, platform: "linux", architecture: "x64" }),
    code("PROFILE_INTEGRITY_FAILED"));
});

test("rejects executable drift before provider startup", async (t) => {
  const value = fixture();
  t.after(() => fs.rmSync(value.root, { recursive: true, force: true }));
  fs.appendFileSync(value.executable, "# drift\n");
  await assert.rejects(resolveOwnedRuntime({ projectRoot: value.root, platform: "linux", architecture: "x64" }),
    code("EXECUTABLE_INTEGRITY_FAILED"));
});
