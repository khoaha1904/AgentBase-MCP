import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import type { GitRequest } from "../../providers/github-hub/index.ts";
import { checkoutHub } from "./checkout.ts";

test("checkout fetches an exact base without any remote write", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-checkout-test-"));
  const calls: GitRequest[] = [];
  try {
    const checkout = await checkoutHub(createHubIdentity("agentbase/hub", "main"), "canary", root, async (request) => {
      calls.push(request);
      return { stdout: request.args[0] === "rev-parse" ? `${"a".repeat(40)}\n` : "", stderr: "" };
    });
    assert.equal(checkout.baseCommit, "a".repeat(40));
    assert.deepEqual(calls.map((call) => call.args[0]), ["clone", "config", "remote", "fetch", "rev-parse", "checkout"]);
    assert.deepEqual(
      calls.filter((call) => ["clone", "fetch", "checkout"].includes(call.args[0] ?? "")).map((call) => call.token),
      ["canary", "canary", "canary"],
    );
    assert.equal(calls.some((call) => call.args.includes("push")), false);
    assert.equal(calls.some((call) => call.args.some((argument) => argument.includes("canary"))), false);
    assert.equal(fs.statSync(path.dirname(checkout.root)).mode & 0o777, 0o700);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("checkout rejects repository-local Git URL rewrites", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-checkout-rewrite-"));
  try {
    await assert.rejects(checkoutHub(createHubIdentity("agentbase/hub", "main"), "canary", root, async (request) => ({
      stdout: request.args[0] === "config" ? "url.https://evil.invalid/.insteadof\nhttps://github.com/\0" : "",
      stderr: "",
    })), /URL rewrite/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("checkout rejects an owned-path symlink", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-checkout-symlink-"));
  try {
    const hub = createHubIdentity("agentbase/hub", "main");
    const identity = createHash("sha256").update("agentbase/hub\0main").digest("hex").slice(0, 24);
    const expected = path.join(root, identity);
    const target = path.join(root, "target");
    fs.mkdirSync(target);
    fs.symlinkSync(target, expected);
    await assert.rejects(checkoutHub(hub, "canary", root, async () => ({ stdout: "", stderr: "" })), /symlink/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
