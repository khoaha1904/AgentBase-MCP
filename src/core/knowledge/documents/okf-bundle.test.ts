import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadOkfBundle, OkfValidationError } from "../index.ts";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-bundle-"));
  const write = (relative: string, content: string | Buffer) => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  return { root, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const concept = (type: string, body: string) => `---\ntype: ${type}\n---\n\n${body}\n`;

test("[AB-MVP-009..013] loads concept IDs, root version, relative links and optional log", () => {
  const current = fixture();
  try {
    current.write("index.md", "---\nokf_version: '0.2'\n---\n\n# Concepts\n\n* [Repository](repository.md) - repository overview\n");
    current.write("repository.md", concept("Software Repository", "See [catalog](components/catalog.md)."));
    current.write("components/catalog.md", concept("Software Component", "Back to [repository](/repository.md)."));
    current.write("log.md", "# Directory Update Log\n\n## 2026-08-12\n* **Creation**: Added concepts.\n");
    const bundle = loadOkfBundle(current.root, { requireAgentBaseRootIndex: true });
    assert.deepEqual([...bundle.concepts.keys()], ["components/catalog", "repository"]);
    assert.equal(bundle.okfVersion, "0.2");
    assert.deepEqual(bundle.warnings, []);
    assert.match(bundle.treeDigest, /^sha256:[a-f0-9]{64}$/);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-013] broken links warn but do not make a conformant bundle fail", () => {
  const current = fixture();
  try {
    current.write("repo.md", concept("Software Repository", "See [future](future.md)."));
    const bundle = loadOkfBundle(current.root);
    assert.equal(bundle.concepts.size, 1);
    assert.deepEqual(bundle.warnings, ["repo.md: broken concept link future.md"]);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-010][AB-MVP-011] rejects invalid reserved structures and wrong producer version", () => {
  const current = fixture();
  try {
    current.write("repo.md", concept("Software Repository", "Body"));
    current.write("index.md", "---\nokf_version: '0.1'\n---\n\n# Concepts\n");
    assert.throws(() => loadOkfBundle(current.root, { requireAgentBaseRootIndex: true }), /0.2/);
    current.write("index.md", "# Concepts\n\nNot an index entry.\n");
    assert.throws(() => loadOkfBundle(current.root), /index/i);
    current.write("index.md", "# Concepts\n");
    current.write("log.md", "# Log\n\n## August 12\n* Changed.\n");
    assert.throws(() => loadOkfBundle(current.root), /log/i);
  } finally {
    current.cleanup();
  }
});

test("[AB-MVP-015] tree digest covers exact paths and bytes deterministically", () => {
  const first = fixture();
  const second = fixture();
  try {
    for (const current of [first, second]) {
      current.write("repo.md", concept("Software Repository", "Body"));
      current.write("references/schema.json", Buffer.from("{\"version\":1}\n"));
    }
    const firstDigest = loadOkfBundle(first.root).treeDigest;
    const secondDigest = loadOkfBundle(second.root).treeDigest;
    assert.equal(firstDigest, secondDigest);
    second.write("references/schema.json", Buffer.from("{\"version\":2}\n"));
    assert.notEqual(loadOkfBundle(second.root).treeDigest, firstDigest);
  } finally {
    first.cleanup();
    second.cleanup();
  }
});

test("[AB-MVP-010][AB-MVP-015] rejects symlinks and invalid UTF-8 concept bytes", () => {
  const current = fixture();
  try {
    current.write("repo.md", Buffer.from([0xff, 0xfe]));
    assert.throws(() => loadOkfBundle(current.root), OkfValidationError);
    fs.rmSync(path.join(current.root, "repo.md"));
    fs.symlinkSync("outside", path.join(current.root, "linked.md"));
    assert.throws(() => loadOkfBundle(current.root), /symlink/);
  } finally {
    current.cleanup();
  }
});
