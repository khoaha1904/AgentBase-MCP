import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import { PassThrough } from "node:stream";
import test from "node:test";

import { runGit, type SpawnGit } from "./git-process.ts";

const credential = "fixture-git-credential-sentinel";

function failedGit(chunks: readonly string[], code: number | null = 128): SpawnGit {
  return (_executable, _args, options) => {
    const child = Object.assign(new EventEmitter(), {
      stdin: new PassThrough(), stdout: new PassThrough(), stderr: new PassThrough(),
      kill: () => true,
    });
    queueMicrotask(() => {
      for (const chunk of chunks) child.stderr.write(chunk);
      child.emit("close", code);
    });
    assert.ok(options.env.GIT_ASKPASS && fs.existsSync(options.env.GIT_ASKPASS));
    return child as unknown as ReturnType<SpawnGit>;
  };
}

test("[AB-HUB-SETUP-039][AB-HUB-SETUP-015] Git errors retain normalized stderr and redact credentials across chunks", async () => {
  let askpass: string | undefined;
  const spawn = failedGit(["fatal:\n\tpermission denied ", credential.slice(0, 10), credential.slice(10), "\n"]);
  await assert.rejects(runGit({ args: ["fetch"], cwd: process.cwd(), operation: "fetch Hub", token: credential },
    (executable, args, options) => {
      askpass = options.env.GIT_ASKPASS;
      return spawn(executable, args, options);
    }), (error: Error) => {
    assert.equal(error.message, "fetch Hub: Git exited with status 128: fatal: permission denied [REDACTED]");
    assert.equal(error.message.includes(credential), false);
    return true;
  });
  assert.ok(askpass);
  assert.equal(fs.existsSync(askpass), false);
});

test("[AB-HUB-SETUP-039] Git diagnostics keep only the last 600 normalized characters", async () => {
  const detail = `old detail ${"x".repeat(700)}\n\t final cause`;
  await assert.rejects(runGit({ args: ["fetch"], cwd: process.cwd(), operation: "fetch Hub", token: credential },
    failedGit([detail])), (error: Error) => {
    const tail = error.message.replace("fetch Hub: Git exited with status 128: ", "");
    assert.equal(tail.length, 600);
    assert.equal(tail, detail.replace(/\s+/g, " ").trim().slice(-600));
    assert.match(tail, /final cause$/);
    return true;
  });
});

test("[AB-HUB-SETUP-039][AB-HUB-SETUP-015] redaction precedes the stderr truncation boundary", async () => {
  await assert.rejects(runGit({ args: ["push"], cwd: process.cwd(), operation: "push Hub", token: credential },
    failedGit([`old ${credential}${"x".repeat(590)}`])), (error: Error) => {
    assert.equal(error.message.includes(credential), false);
    assert.equal(error.message.includes("credential-sentinel"), false);
    assert.equal(error.message.split(": ").at(-1), `${"[REDACTED]"}${"x".repeat(590)}`);
    return true;
  });
});

test("[AB-HUB-SETUP-039] an empty stderr preserves the Git error prefix and fallback exit status", async () => {
  await assert.rejects(runGit({ args: ["fetch"], cwd: process.cwd(), operation: "fetch Hub", token: credential },
    failedGit([" \n\t"], null)), { message: "fetch Hub: Git exited with status 1" });
});
