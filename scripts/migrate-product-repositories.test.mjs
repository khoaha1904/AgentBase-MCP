import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createCanonicalMcp, inspectRepository } from "./migrate-product-repositories.mjs";

function git(root, args) {
  const result = spawnSync("/usr/bin/git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-migration-"));
  const source = path.join(root, "source");
  const target = path.join(root, "AgentBase-MCP");
  fs.mkdirSync(source);
  git(source, ["init", "-b", "main"]);
  git(source, ["config", "user.name", "Test"]);
  git(source, ["config", "user.email", "test@agentbase.local"]);
  fs.writeFileSync(path.join(source, "README.md"), "# Source\n");
  git(source, ["add", "README.md"]);
  git(source, ["commit", "-m", "base"]);
  return { root, source, target, head: git(source, ["rev-parse", "HEAD"]) };
}

test("[AB-MIGRATION-001] report preserves a dirty source and redacts remote credentials", () => {
  const current = fixture();
  try {
    git(current.source, ["remote", "add", "origin", "https://token-canary@github.com/acme/source.git"]);
    fs.appendFileSync(path.join(current.source, "README.md"), "dirty\n");
    const before = fs.readFileSync(path.join(current.source, "README.md"), "utf8");
    const report = inspectRepository(current.source);
    assert.equal(report.dirty.length, 1);
    assert.doesNotMatch(JSON.stringify(report), /token-canary/);
    assert.equal(fs.readFileSync(path.join(current.source, "README.md"), "utf8"), before);
    assert.throws(() => createCanonicalMcp({ source: current.source, target: current.target, expectedHead: current.head }), /clean/);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-MIGRATION-001] canonical MCP clone has independent Git objects and source remains unchanged", () => {
  const current = fixture();
  try {
    const sourceHead = git(current.source, ["rev-parse", "HEAD"]);
    const report = createCanonicalMcp({ source: current.source, target: current.target, expectedHead: current.head });
    assert.equal(report.head, sourceHead);
    const sourceObject = path.join(current.source, ".git", "objects", sourceHead.slice(0, 2), sourceHead.slice(2));
    const targetObject = path.join(current.target, ".git", "objects", sourceHead.slice(0, 2), sourceHead.slice(2));
    if (fs.existsSync(sourceObject) && fs.existsSync(targetObject)) {
      assert.notEqual(fs.statSync(sourceObject).ino, fs.statSync(targetObject).ino);
    }
    assert.equal(git(current.source, ["rev-parse", "HEAD"]), sourceHead);
    assert.throws(() => createCanonicalMcp({ source: current.source, target: current.target, expectedHead: current.head }), /already exists/);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-MIGRATION-001] collisions, symlink sources and wrong canonical names fail before mutation", () => {
  const current = fixture();
  try {
    assert.throws(() => createCanonicalMcp({ source: current.source, target: path.join(current.root, "wrong"), expectedHead: current.head }), /AgentBase-MCP/);
    const link = path.join(current.root, "source-link");
    fs.symlinkSync(current.source, link);
    assert.throws(() => createCanonicalMcp({ source: link, target: current.target, expectedHead: current.head }), /non-symlink/);
    assert.equal(fs.existsSync(current.target), false);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});
