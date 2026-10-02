import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runInstaller } from "./install.mjs";

const remedies = [
  ["fnm", { FNM_MULTISHELL_PATH: "configured" }, "fnm install 24.20.0 && fnm use 24.20.0"],
  ["volta", { VOLTA_HOME: "configured" }, "volta install node@24.20.0"],
  ["asdf", { ASDF_DATA_DIR: "configured" }, "asdf install nodejs 24.20.0 && asdf set nodejs 24.20.0"],
  ["nvm", { NVM_DIR: "configured" }, "nvm install 24.20.0 && nvm use 24.20.0"],
  ["download", {}, "https://nodejs.org/en/download"],
];

for (const [name, configured, expected] of remedies) {
  test(`[AB-INSTALL-044] rejected Node gives ${name} remediation before setup`, async () => {
    let mutated = false;
    await assert.rejects(runInstaller({ args: [], nodeVersion: "22.23.3", environment: { PATH: "", ...configured },
      runRegistryResolution: async () => { mutated = true; throw new Error("must not resolve registry"); },
    }), (error) => {
      assert.ok(error.message.includes(expected));
      assert.match(error.message, /Node >=24\.12 <25/);
      return true;
    });
    assert.equal(mutated, false);
    assert.equal(fs.readFileSync(new URL("../../.nvmrc", import.meta.url), "utf8").trim(), "24.20.0");
  });
}

test("[AB-INSTALL-044] detects an installed manager but prefers the active manager", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-node-guidance-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "fnm"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  for (const [configured, expected] of [[{}, "fnm install"], [{ NVM_DIR: "configured" }, "nvm install"]]) {
    await assert.rejects(runInstaller({ args: [], nodeVersion: "25.0.0", environment: { PATH: root, ...configured } }),
      (error) => error.message.includes(expected));
  }
});
