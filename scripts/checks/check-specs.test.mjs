import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkSpecifications } from "./check-specs.mjs";

const ids = (prefix, count, start = 1) => Array.from(
  { length: count },
  (_, index) => `${prefix}-${String(index + start).padStart(3, "0")}`,
);

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-specs-"));
  const routes = [
    "docs/PRODUCT.md", "docs/ARCHITECTURE.md", "docs/contracts/foundation.md",
    "docs/contracts/code-graph.md", "docs/contracts/okf.md", "docs/contracts/hub.md",
    "docs/contracts/installation.md", "docs/contracts/benchmark.md",
  ];
  const lines = (values) => `${values.map((value) => `- **${value}**: fixture`).join("\n")}\n`;

  write(root, "AGENTS.md", "docs/README.md\nspecs/CURRENT.md\n");
  write(root, "README.md", "# AgentBase-MCP\n");
  write(root, "docs/README.md", `${routes.join("\n")}\n`);
  write(root, "docs/ARCHITECTURE.md", "# Architecture\n");
  write(root, "docs/PRODUCT.md", lines([...ids("AB-PRODUCT", 5), ...ids("AB-MIGRATION", 2)]));
  write(root, "docs/contracts/foundation.md", lines(ids("AB-FND", 19)));
  write(root, "docs/contracts/code-graph.md", lines([
    ...ids("AB-MVP", 7), ...ids("AB-GRAPH", 14), ...ids("AB-REFRESH", 12), ...ids("AB-MCP", 14),
  ]));
  write(root, "docs/contracts/okf.md", lines([
    ...ids("AB-MVP", 16, 8), ...ids("AB-OBS", 7), ...ids("AB-SCHEMA", 29),
  ]));
  write(root, "docs/contracts/hub.md", lines([
    ...ids("AB-LOCAL-HUB", 13), "AB-QUERY-001", ...ids("AB-HUB-SETUP", 17),
  ]));
  write(root, "docs/contracts/installation.md", lines(ids("AB-INSTALL", 24)));
  write(root, "docs/contracts/benchmark.md", lines(ids("AB-BENCH", 38)));
  write(root, "specs/CURRENT.md", "Active capability: [foundation](001-clean-foundation/spec.md)\n");
  write(root, "specs/001-clean-foundation/spec.md", "# Active foundation\n");
  write(root, "package.json", "{\"name\":\"fixture\"}\n");
  write(root, ".gitignore", "docs/.archived/\n");
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const codes = (errors) => errors.map((error) => error.code);

test("[AB-FND-001][AB-FND-002] accepts progressive current-document routing", () => {
  const current = fixture();
  try { assert.deepEqual(checkSpecifications(current.root), []); } finally { current.cleanup(); }
});

test("[AB-FND-001] rejects a missing docs index or domain route", () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.root, "docs", "README.md"));
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-DOCS-INDEX-MISSING"));
    write(current.root, "docs/README.md", "docs/PRODUCT.md\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-ROUTE-MISSING"));
  } finally { current.cleanup(); }
});

test("[AB-FND-001] rejects a routed current document that does not exist", () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.root, "docs", "ARCHITECTURE.md"));
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-CURRENT-DOC-MISSING"));
  } finally { current.cleanup(); }
});

test("[AB-FND-002] rejects missing current requirements and unresolved markers", () => {
  const current = fixture();
  try {
    write(current.root, "docs/contracts/foundation.md", "AB-FND-001\nTODO decide later\n");
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-ID-MISSING"));
    assert.ok(result.includes("SPEC-UNRESOLVED"));
  } finally { current.cleanup(); }
});

test("[AB-FND-002] accepts no-active state with completed capability link", () => {
  const current = fixture();
  try {
    write(current.root, "specs/CURRENT.md", "Active capability: None\nMost recent completed: [foundation](001-clean-foundation/spec.md)\n");
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally { current.cleanup(); }
});

test("[AB-FND-002] rejects a broken active selector", () => {
  const current = fixture();
  try {
    write(current.root, "specs/CURRENT.md", "Active capability: [missing](999-missing/spec.md)\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-ACTIVE-BROKEN"));
  } finally { current.cleanup(); }
});

test("[AB-FND-003] rejects a legacy repository runtime dependency", () => {
  const current = fixture();
  try {
    write(current.root, "package.json", "{\"dependencies\":{\"legacy\":\"file:../agentbase-mcp\"}}\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-LEGACY-DEPENDENCY"));
  } finally { current.cleanup(); }
});

test("[AB-MVP/GRAPH/REFRESH/MCP] enforces the consolidated Code Graph contract", () => {
  const current = fixture();
  try {
    const file = path.join(current.root, "docs", "contracts", "code-graph.md");
    let source = fs.readFileSync(file, "utf8");
    source = source.replace("AB-MVP-007", "missing-mvp")
      .replace("AB-GRAPH-014", "missing-graph")
      .replace("AB-REFRESH-012", "missing-refresh")
      .replace("AB-MCP-014", "missing-mcp");
    fs.writeFileSync(file, source);
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-MVP-ID-MISSING"));
    assert.ok(result.includes("SPEC-GRAPH-ID-MISSING"));
    assert.ok(result.includes("SPEC-REFRESH-ID-MISSING"));
    assert.ok(result.includes("SPEC-MCP-ID-MISSING"));
  } finally { current.cleanup(); }
});

test("[AB-MVP/OBS/SCHEMA] enforces the consolidated evidence and OKF contract", () => {
  const current = fixture();
  try {
    const file = path.join(current.root, "docs", "contracts", "okf.md");
    let source = fs.readFileSync(file, "utf8");
    source = source.replace("AB-MVP-023", "missing-okf")
      .replace("AB-OBS-007", "missing-observation")
      .replace("AB-SCHEMA-029", "missing-schema");
    fs.writeFileSync(file, source);
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-MVP-ID-MISSING"));
    assert.ok(result.includes("SPEC-OBS-ID-MISSING"));
    assert.ok(result.includes("SPEC-SCHEMA-ID-MISSING"));
  } finally { current.cleanup(); }
});

test("[AB-PRODUCT/HUB/INSTALL/BENCH] enforces every remaining current domain", () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.root, "docs", "PRODUCT.md"));
    fs.rmSync(path.join(current.root, "docs", "contracts", "hub.md"));
    fs.rmSync(path.join(current.root, "docs", "contracts", "installation.md"));
    fs.rmSync(path.join(current.root, "docs", "contracts", "benchmark.md"));
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-PRODUCT-LIVING-MISSING"));
    assert.ok(result.includes("SPEC-HUB-LIVING-MISSING"));
    assert.ok(result.includes("SPEC-INSTALL-LIVING-MISSING"));
    assert.ok(result.includes("SPEC-BENCH-LIVING-MISSING"));
  } finally { current.cleanup(); }
});

test("[AB-PRODUCT-001] rejects temporary branding only in current docs", () => {
  const current = fixture();
  try {
    write(current.root, "README.md", "# AgentBase Next\nAgentBase Next is the product.\n/opt/agentbase-next/src/cli.ts\n");
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-TEMP-PRODUCT-NAME"));
    assert.ok(result.includes("SPEC-TEMP-RUNTIME-PATH"));
    write(current.root, "README.md", "# AgentBase-MCP\n");
    write(current.root, "docs/.archived/history.md", "# AgentBase Next\n");
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally { current.cleanup(); }
});

test("[AB-FND-002] requires the local archive to stay Git-ignored", () => {
  const current = fixture();
  try {
    write(current.root, ".gitignore", "node_modules/\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-ARCHIVE-NOT-IGNORED"));
  } finally { current.cleanup(); }
});
