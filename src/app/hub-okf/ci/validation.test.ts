import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  AGENTBASE_OKF_PROFILE,
  AGENTBASE_OKF_PROFILE_EXTENSIONS,
  AGENTBASE_OKF_PROFILE_RESOURCE,
  AGENTBASE_OKF_PROFILE_TYPE,
} from "../../../core/knowledge/index.ts";
import { validateHubCi } from "./validation.ts";

function write(root: string, relative: string, source: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
}

function profileHub(t: test.TestContext): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-ci-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  write(root, "index.md", `---
okf_version: "0.2"
---

# Hub

* [Profile](shared/agentbase-profile.md) - Profile
* [Shared](shared/index.md) - Shared knowledge
* [Orders](domains/orders/) - Domain
`);
  write(root, "shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n");
  write(root, "shared/agentbase-profile.md", `---
type: ${AGENTBASE_OKF_PROFILE_TYPE}
title: AgentBase OKF Profile 1.0
description: Domain Capsule profile.
resource: ${AGENTBASE_OKF_PROFILE_RESOURCE}
agentbase:
  profile:
    id: ${AGENTBASE_OKF_PROFILE.id}
    version: "${AGENTBASE_OKF_PROFILE.version}"
    okf_base: "${AGENTBASE_OKF_PROFILE.okfBase}"
    layout: ${AGENTBASE_OKF_PROFILE.layout}
    extensions:
${AGENTBASE_OKF_PROFILE_EXTENSIONS.map((value) => `      - ${value}`).join("\n")}
---

# Profile
`);
  write(root, "domains/orders/index.md", `---
type: Domain
title: Orders
description: Orders Domain.
generated: { by: "human:test", at: "2026-09-04T00:00:00Z" }
sources: []
---

# Orders
`);
  return root;
}

function tree(root: string): readonly Readonly<{ path: string; bytes: string }>[] {
  const values: Array<Readonly<{ path: string; bytes: string }>> = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else values.push({ path: path.relative(root, absolute), bytes: fs.readFileSync(absolute).toString("base64") });
    }
  };
  walk(root);
  return values.sort((left, right) => left.path.localeCompare(right.path));
}

test("[AB-PROFILE-009..010] Hub CI admits Profile 1.0, rejects unsupported declarations and preserves legacy state", async (t) => {
  const root = profileHub(t), before = tree(root);
  const admitted = await validateHubCi(root, () => new Date("2026-09-04T00:00:00Z"), { requireSupportCi: false });
  assert.equal(admitted.passed, true, admitted.errors.join("\n"));
  assert.deepEqual(tree(root), before);

  const profilePath = path.join(root, "shared/agentbase-profile.md");
  const profile = fs.readFileSync(profilePath, "utf8");
  fs.writeFileSync(profilePath, profile.replace('version: "1.0"', 'version: "2.0"'));
  const unsupported = await validateHubCi(root, () => new Date("2026-09-04T00:00:00Z"), { requireSupportCi: false });
  assert.equal(unsupported.passed, false);
  assert.match(unsupported.errors.join("\n"), /profile version is unsupported/);

  const legacy = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-legacy-ci-"));
  t.after(() => fs.rmSync(legacy, { recursive: true, force: true }));
  write(legacy, "index.md", "---\nokf_version: \"0.2\"\n---\n\n# Legacy Hub\n\n* [Note](notes.md) - Note\n");
  write(legacy, "notes.md", "---\ntype: Team Note\ntitle: Note\n---\n\n# Note\n");
  const legacyBefore = tree(legacy);
  const legacyResult = await validateHubCi(legacy, () => new Date("2026-09-04T00:00:00Z"), { requireSupportCi: false });
  assert.equal(legacyResult.passed, true, legacyResult.errors.join("\n"));
  assert.match(legacyResult.warnings.join("\n"), /custom OKF type Team Note/);
  assert.deepEqual(tree(legacy), legacyBefore);
});
