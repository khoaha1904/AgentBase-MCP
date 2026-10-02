import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyDiagramFoundation } from "./check-inactive-foundations.mjs";

test("[AB-DISC-008] the shipped diagram template is verified without permitting a retained upstream tree", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-foundation-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const skill = ".agents/skills/use-diagram-design";
  fs.cpSync(path.resolve(import.meta.dirname, "../..", skill), path.join(root, skill), { recursive: true });
  assert.doesNotThrow(() => verifyDiagramFoundation(root));
  fs.mkdirSync(path.join(root, "vendor"));
  fs.writeFileSync(path.join(root, "vendor/README.md"), "# Obsolete importer instructions\n");
  assert.throws(() => verifyDiagramFoundation(root), /retired upstream source snapshots must not be shipped/);
  fs.rmSync(path.join(root, "vendor"), { recursive: true });
  fs.rmSync(path.join(root, skill, "assets/NOTICE.md"));
  assert.throws(() => verifyDiagramFoundation(root), /ENOENT/);
});
