import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkSpecifications } from "./check-specs.mjs";

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-specs-"));
  const ids = Array.from({ length: 19 }, (_, index) => `- **AB-FND-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const mvpIds = Array.from({ length: 22 }, (_, index) => `- **AB-MVP-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const graphIds = Array.from({ length: 14 }, (_, index) => `- **AB-GRAPH-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const refreshIds = Array.from({ length: 12 }, (_, index) => `- **AB-REFRESH-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const mcpIds = Array.from({ length: 14 }, (_, index) => `- **AB-MCP-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const productIds = Array.from({ length: 5 }, (_, index) => `- **AB-PRODUCT-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const hubIds = [
    ...Array.from({ length: 11 }, (_, index) => `- **AB-LOCAL-HUB-${String(index + 1).padStart(3, "0")}**: fixture`),
    ...Array.from({ length: 17 }, (_, index) => `- **AB-HUB-SETUP-${String(index + 1).padStart(3, "0")}**: fixture`),
  ].join("\n");
  const installIds = Array.from({ length: 17 }, (_, index) => `- **AB-INSTALL-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  const schemaIds = Array.from({ length: 9 }, (_, index) => `- **AB-SCHEMA-${String(index + 1).padStart(3, "0")}**: fixture`).join("\n");
  write(root, "AGENTS.md", ["docs/handoff.md", "docs/product/vision.md", "docs/ARCHITECTURE.md", "docs/specs/project-foundation.md", "docs/specs/local-code-intelligence.md", "docs/specs/single-repository-okf.md", "docs/specs/product-identity.md", "docs/specs/agentbase-hub.md", "docs/specs/okf-schema-catalog.md", "docs/specs/installation.md", "specs/CURRENT.md"].join("\n"));
  write(root, "specs/CURRENT.md", "Active capability: [foundation](001-clean-foundation/spec.md)\n");
  write(root, "specs/001-clean-foundation/spec.md", "# Active foundation\n");
  write(root, "docs/specs/project-foundation.md", `${ids}\n`);
  write(root, "docs/specs/single-repository-okf.md", `${mvpIds}\n`);
  write(root, "docs/specs/local-code-intelligence.md", `${graphIds}\n${refreshIds}\n${mcpIds}\n`);
  write(root, "docs/specs/product-identity.md", `${productIds}\nAB-MIGRATION-001\nAB-MIGRATION-002\n`);
  write(root, "docs/specs/agentbase-hub.md", `${hubIds}\nAB-QUERY-001\n`);
  write(root, "docs/specs/installation.md", installIds);
  write(root, "docs/specs/okf-schema-catalog.md", `${schemaIds}\n`);
  write(root, "README.md", "# AgentBase-MCP\n");
  write(root, "package.json", '{"name":"fixture"}\n');
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function codes(errors) {
  return errors.map((error) => error.code);
}

test("[AB-FND-001][AB-FND-002] accepts the complete ordered document route", () => {
  const current = fixture();
  try {
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-001][AB-FND-002] rejects missing living context and a broken active selector", () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.root, "docs", "specs", "project-foundation.md"));
    write(current.root, "specs/CURRENT.md", "Active capability: [missing](999-missing/spec.md)\n");
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-LIVING-MISSING"));
    assert.ok(result.includes("SPEC-ACTIVE-BROKEN"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-002] rejects missing stable requirements and unresolved markers", () => {
  const current = fixture();
  try {
    write(current.root, "docs/specs/project-foundation.md", "AB-FND-001\nTODO decide later\n");
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-ID-MISSING"));
    assert.ok(result.includes("SPEC-UNRESOLVED"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-002] accepts an explicit no-active state with a completed capability link", () => {
  const current = fixture();
  try {
    write(current.root, "specs/CURRENT.md", [
      "Active capability: None",
      "Most recent completed: [foundation](001-clean-foundation/spec.md)",
    ].join("\n"));
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-003] rejects a legacy repository runtime dependency", () => {
  const current = fixture();
  try {
    write(current.root, "package.json", '{"dependencies":{"legacy":"file:../agentbase-mcp"}}\n');
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-LEGACY-DEPENDENCY"));
  } finally {
    current.cleanup();
  }
});

test("[AB-PRODUCT-001] allows the official AgentBase-MCP package identity", () => {
  const current = fixture();
  try {
    write(current.root, "package.json", '{"name":"agentbase-mcp","dependencies":{"codebase-memory-mcp":"0.10.1"}}\n');
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-002] accepts a different active capability while the completed living contract remains authoritative", () => {
  const current = fixture();
  try {
    write(current.root, "specs/CURRENT.md", "Active capability: [walking skeleton](002-single-repo-okf-walking-skeleton/spec.md)\n");
    write(current.root, "specs/002-single-repo-okf-walking-skeleton/spec.md", "# Active walking skeleton\n");
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-001..022] rejects a missing or incomplete single-repository OKF living contract", () => {
  const current = fixture();
  try {
    write(current.root, "docs/specs/single-repository-okf.md", "AB-MVP-001\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-MVP-ID-MISSING"));
    fs.rmSync(path.join(current.root, "docs", "specs", "single-repository-okf.md"));
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-MVP-LIVING-MISSING"));
  } finally {
    current.cleanup();
  }
});

test("[AB-GRAPH-001..014] rejects a missing or incomplete local graph living contract", () => {
  const current = fixture();
  try {
    write(current.root, "docs/specs/local-code-intelligence.md", "AB-GRAPH-001\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-GRAPH-ID-MISSING"));
    fs.rmSync(path.join(current.root, "docs", "specs", "local-code-intelligence.md"));
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-GRAPH-LIVING-MISSING"));
  } finally {
    current.cleanup();
  }
});

test("[AB-REFRESH-001..012] rejects an incomplete graph freshness living contract", () => {
  const current = fixture();
  try {
    const file = path.join(current.root, "docs", "specs", "local-code-intelligence.md");
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("AB-REFRESH-012", "missing-refresh"));
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-REFRESH-ID-MISSING"));
  } finally {
    current.cleanup();
  }
});

test("[AB-MCP-001..014] rejects an incomplete MCP surface living contract", () => {
  const current = fixture();
  try {
    const file = path.join(current.root, "docs", "specs", "local-code-intelligence.md");
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("AB-MCP-014", "missing-mcp"));
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-MCP-ID-MISSING"));
  } finally {
    current.cleanup();
  }
});

test("[AB-PRODUCT/LOCAL-HUB/SCHEMA/QUERY] rejects an incomplete corrected living contract", () => {
  const current = fixture();
  try {
    write(current.root, "docs/specs/agentbase-hub.md", "AB-LOCAL-HUB-001\n");
    assert.ok(codes(checkSpecifications(current.root)).includes("SPEC-PRODUCT-ID-MISSING"));
  } finally {
    current.cleanup();
  }
});

test("[AB-PRODUCT-001] rejects active temporary branding and launcher paths", () => {
  const current = fixture();
  try {
    write(current.root, "README.md", "# AgentBase Next\nAgentBase Next is the product.\n/opt/agentbase-next/src/cli.ts\n");
    const result = codes(checkSpecifications(current.root));
    assert.ok(result.includes("SPEC-TEMP-PRODUCT-NAME"));
    assert.ok(result.includes("SPEC-TEMP-RUNTIME-PATH"));
  } finally {
    current.cleanup();
  }
});

test("[AB-PRODUCT-002] allows historical evidence and an explicitly named source repository", () => {
  const current = fixture();
  try {
    write(current.root, "docs/product/evidence/history.md", "The agentbase-next rebuild was indexed as an explicit source.\n");
    write(current.root, "fixtures/source-name.txt", "repositories/agentbase-next\n");
    assert.deepEqual(checkSpecifications(current.root), []);
  } finally {
    current.cleanup();
  }
});
