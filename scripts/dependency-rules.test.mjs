import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const executable = path.join(repositoryRoot, "node_modules", ".bin", "depcruise");
const configuration = path.join(repositoryRoot, ".dependency-cruiser.cjs");

function write(root, relativePath, content) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
}

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-depcruise-"));
  for (const [relativePath, content] of Object.entries(files)) write(root, relativePath, content);
  return root;
}

function cruise(root) {
  return spawnSync(executable, ["src", "--config", configuration, "--output-type", "err"], {
    cwd: root,
    encoding: "utf8",
  });
}

function output(result) {
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

test("[AB-FND-011] allows another capability to use the public entrypoint", () => {
  const root = fixture({
    "src/core/shared/index.ts": 'export { value } from "./private.ts";\n',
    "src/core/shared/private.ts": "export const value = true;\n",
    "src/app/demo/main.ts": 'import { value } from "../../core/shared/index.ts";\nexport { value };\n',
  });
  try {
    const result = cruise(root);
    assert.equal(result.status, 0, output(result));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-FND-011] rejects a cross-capability private import", () => {
  const root = fixture({
    "src/core/shared/private.ts": "export const value = true;\n",
    "src/app/demo/main.ts": 'import { value } from "../../core/shared/private.ts";\nexport { value };\n',
  });
  try {
    const result = cruise(root);
    assert.notEqual(result.status, 0);
    assert.match(output(result), /cross-capability-private-import/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-FND-012] rejects reverse layer dependencies", () => {
  const root = fixture({
    "src/providers/example/index.ts": "export const provider = true;\n",
    "src/core/shared/private.ts": 'import { provider } from "../../providers/example/index.ts";\nexport { provider };\n',
  });
  try {
    const result = cruise(root);
    assert.notEqual(result.status, 0);
    assert.match(output(result), /core-must-not-import-upper-layers/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-FND-012] rejects a local dependency cycle", () => {
  const root = fixture({
    "src/core/shared/a.ts": 'import "./b.ts";\n',
    "src/core/shared/b.ts": 'import "./a.ts";\n',
  });
  try {
    const result = cruise(root);
    assert.notEqual(result.status, 0);
    assert.match(output(result), /no-circular/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
