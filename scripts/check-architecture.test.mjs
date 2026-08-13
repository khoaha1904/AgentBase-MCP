import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkArchitecture } from "./check-architecture.mjs";

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function registry(root, modules, composition = ["src/cli.ts"]) {
  write(root, "scripts/module-boundaries.json", `${JSON.stringify({ schema: 1, composition, modules })}\n`);
}

function baseline(root, value = { schema: 1, files: {}, edges: [] }) {
  write(root, "scripts/architecture-baseline.json", `${JSON.stringify(value)}\n`);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-architecture-"));
  write(root, "src/cli.ts", "export {};\n");
  write(root, "src/core/example/index.ts", 'export { value } from "./private.ts";\n');
  write(root, "src/core/example/private.ts", "export const value = true;\n");
  write(root, "src/providers/fake/index.ts", "export const fake = true;\n");
  write(root, "src/app/demo/index.ts", "export const demo = true;\n");
  registry(root, [
    { root: "src/core/example", responsibility: "fixture core", public: ["src/core/example/index.ts"] },
    { root: "src/providers/fake", responsibility: "fixture provider", public: ["src/providers/fake/index.ts"] },
    { root: "src/app/demo", responsibility: "fixture app", public: ["src/app/demo/index.ts"] },
  ]);
  baseline(root);
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function codes(result) {
  return result.errors.map((error) => error.code);
}

test("[AB-FND-010] rejects unknown, overlapping and stale ownership", () => {
  const current = fixture();
  try {
    write(current.root, "src/unowned.ts", "export const unowned = true;\n");
    write(current.root, "src/core/example/private/value.ts", "export const nested = true;\n");
    registry(current.root, [
      { root: "src/core/example", responsibility: "outer", public: ["src/core/example/index.ts"] },
      { root: "src/core/example/private", responsibility: "overlap", public: [] },
      { root: "src/app/missing", responsibility: "stale", public: [] },
      { root: "src/providers/fake", responsibility: "provider", public: ["src/providers/fake/index.ts"] },
      { root: "src/app/demo", responsibility: "app", public: ["src/app/demo/index.ts"] },
    ]);
    const result = codes(checkArchitecture(current.root));
    assert.ok(result.includes("ARCH-OWNER-UNKNOWN"));
    assert.ok(result.includes("ARCH-OWNER-OVERLAP"));
    assert.ok(result.includes("ARCH-OWNER-STALE"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-011][AB-FND-012] rejects private imports and reverse dependencies", () => {
  const current = fixture();
  try {
    write(current.root, "src/app/demo/index.ts", 'import "../../core/example/private.ts";\nexport const demo = true;\n');
    write(current.root, "src/core/example/private.ts", 'import "../../providers/fake/index.ts";\nexport const value = true;\n');
    const result = codes(checkArchitecture(current.root));
    assert.ok(result.includes("ARCH-PRIVATE-IMPORT"));
    assert.ok(result.includes("ARCH-DIRECTION"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-012] rejects reverse imports into a root composition file", () => {
  const current = fixture();
  try {
    write(current.root, "src/app/demo/index.ts", 'import "../../cli.ts";\nexport const demo = true;\n');
    assert.ok(codes(checkArchitecture(current.root)).includes("ARCH-COMPOSITION-IMPORT"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-012] reports an exact dependency cycle", () => {
  const current = fixture();
  try {
    write(current.root, "src/core/example/a.ts", 'import "./b.ts";\n');
    write(current.root, "src/core/example/b.ts", 'import "./a.ts";\n');
    const result = checkArchitecture(current.root);
    assert.ok(codes(result).includes("ARCH-CYCLE"));
    assert.match(result.errors.find((error) => error.code === "ARCH-CYCLE").message, /a\.ts.*b\.ts.*a\.ts/);
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-013] rejects review growth and stale exact file exceptions", () => {
  const current = fixture();
  try {
    const name = "src/core/example/large.ts";
    write(current.root, name, "export const value = true;\n".repeat(301));
    let result = checkArchitecture(current.root);
    assert.ok(codes(result).includes("ARCH-REVIEWABILITY"));
    const metrics = result.metrics[name];
    baseline(current.root, {
      schema: 1,
      files: { [name]: { kind: "legacy-debt", approvedBy: "fixture owner", reason: "fixture debt", ceilings: metrics } },
      edges: [],
    });
    result = checkArchitecture(current.root);
    assert.ok(!result.errors.length);

    fs.appendFileSync(path.join(current.root, name), "export const growth = true;\n");
    assert.ok(codes(checkArchitecture(current.root)).includes("ARCH-BASELINE-GROWTH"));

    write(current.root, name, "export const resolved = true;\n");
    assert.ok(codes(checkArchitecture(current.root)).includes("ARCH-BASELINE-STALE"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-013] requires an exact reviewed mark for a cohesive import hotspot", () => {
  const current = fixture();
  try {
    const name = "src/app/demo/index.ts";
    const imports = Array.from({ length: 13 }, (_, index) => `export * from "./part-${index}.ts";`).join("\n");
    for (let index = 0; index < 13; index += 1) write(current.root, `src/app/demo/part-${index}.ts`, "export {};\n");
    write(current.root, name, `${imports}\n`);

    let result = checkArchitecture(current.root);
    assert.ok(codes(result).includes("ARCH-REVIEWABILITY"));
    const metrics = result.metrics[name];
    baseline(current.root, {
      schema: 1,
      files: {
        [name]: {
          kind: "cohesive-hotspot",
          approvedBy: "fixture owner",
          reason: "intentional public entrypoint",
          reviewWhen: "the public surface or capability ownership changes",
          ceilings: metrics,
        },
      },
      edges: [],
    });
    result = checkArchitecture(current.root);
    assert.deepEqual(result.errors, []);
    assert.ok(result.warnings.some((warning) => warning.code === "ARCH-BASELINED-FILE"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-013] rejects wildcard and stale dependency exceptions", () => {
  const current = fixture();
  try {
    baseline(current.root, {
      schema: 1,
      files: {},
      edges: [{ source: "src/core/*", target: "src/app/*", approvedBy: "fixture owner", reason: "too broad" }],
    });
    assert.ok(codes(checkArchitecture(current.root)).includes("ARCH-BASELINE-INVALID"));

    baseline(current.root, {
      schema: 1,
      files: {},
      edges: [{ source: "src/core/example/private.ts", target: "src/app/demo/index.ts", approvedBy: "fixture owner", reason: "stale" }],
    });
    assert.ok(codes(checkArchitecture(current.root)).includes("ARCH-BASELINE-STALE"));
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-010][AB-FND-011][AB-FND-012][AB-FND-013] accepts the real ownership tree with only exact reviewed marks", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const result = checkArchitecture(root);
  assert.deepEqual(result.errors, []);
  const currentBaseline = JSON.parse(fs.readFileSync(path.join(root, "scripts", "architecture-baseline.json"), "utf8"));
  assert.ok(Object.values(currentBaseline.files).every((entry) => entry.kind === "cohesive-hotspot"));
  assert.deepEqual(currentBaseline.edges, []);
});
