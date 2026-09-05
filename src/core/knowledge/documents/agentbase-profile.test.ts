import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  AGENTBASE_OKF_PROFILE,
  AGENTBASE_OKF_PROFILE_CONCEPT_ID,
  AGENTBASE_OKF_PROFILE_EXTENSIONS,
  AGENTBASE_OKF_PROFILE_PATH,
  AGENTBASE_OKF_PROFILE_RESOURCE,
  AGENTBASE_OKF_PROFILE_TYPE,
  agentBaseDomainConceptIdentity,
  agentBaseDomainSelector,
  classifyAgentBaseHubProfile,
  classifyAgentBaseHubProfileSnapshot,
} from "./agentbase-profile.ts";
import { loadOkfBundle } from "./okf-bundle.ts";
import { parseConceptDocument, renderConceptDocument } from "./okf-document.ts";

const PROFILE = `---
type: ${AGENTBASE_OKF_PROFILE_TYPE}
title: AgentBase OKF Profile 1.0
description: AgentBase Domain Capsule profile.
resource: ${AGENTBASE_OKF_PROFILE_RESOURCE}
agentbase:
  profile:
    id: ${AGENTBASE_OKF_PROFILE.id}
    version: "${AGENTBASE_OKF_PROFILE.version}"
    okf_base: "${AGENTBASE_OKF_PROFILE.okfBase}"
    layout: ${AGENTBASE_OKF_PROFILE.layout}
    extensions:
${AGENTBASE_OKF_PROFILE_EXTENSIONS.map((value) => `      - ${value}`).join("\n")}
vendor_extension:
  retained: true
---

# AgentBase OKF Profile 1.0
`;

const DOMAIN = `---
type: Domain
title: Orders
description: Orders business domain.
generated: { by: "human:test", at: "2026-09-04T00:00:00Z" }
sources: []
---

# Orders
`;

const SYSTEM = `---
type: System
title: Order processing
description: Processes orders.
generated: { by: "human:test", at: "2026-09-04T00:00:00Z" }
sources: []
---

# Order processing
`;

const FOREIGN = `---
type: Team Note
title: Operating note
vendor:
  nested: [one, two]
---

# Operating note

Foreign body stays intact.
`;

function write(root: string, relative: string, source: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
}

function fixture(t: test.TestContext): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  write(root, "index.md", `---
okf_version: "0.2"
---

# AgentBase Hub

* [Profile](shared/agentbase-profile.md) - AgentBase OKF Profile 1.0
* [Shared](shared/index.md) - Shared knowledge
* [Orders](domains/orders/) - Orders Domain Capsule
`);
  write(root, "shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md) - AgentBase OKF Profile 1.0\n\n* [Operating note](knowledge/operating-note.md) - Team Note\n");
  write(root, AGENTBASE_OKF_PROFILE_PATH, PROFILE);
  write(root, "domains/orders/index.md", `${DOMAIN.trimEnd()}\n\n* [Order processing](knowledge/order-processing.md) - System\n`);
  write(root, "domains/orders/knowledge/order-processing.md", SYSTEM);
  write(root, "shared/knowledge/operating-note.md", FOREIGN);
  return root;
}

test("[AB-PROFILE-001..002] recognizes only the exact Profile 1.0 declaration", (t) => {
  const root = fixture(t);
  const admitted = classifyAgentBaseHubProfile(loadOkfBundle(root, { requireAgentBaseRootIndex: true }));
  assert.equal(admitted.kind, "profile-1.0");
  if (admitted.kind !== "profile-1.0") return;
  assert.equal(admitted.profile, AGENTBASE_OKF_PROFILE);
  assert.equal(admitted.homes.some((item) => item.identity === AGENTBASE_OKF_PROFILE_CONCEPT_ID), true);

  const legacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-legacy-"));
  t.after(() => fs.rmSync(legacyRoot, { recursive: true, force: true }));
  write(legacyRoot, "index.md", "---\nokf_version: \"0.2\"\n---\n\n# Legacy Hub\n");
  write(legacyRoot, "domains/orders/index.md", "# Orders navigation\n\n* [Orders](../orders.md) - Domain\n");
  write(legacyRoot, "domains/orders.md", DOMAIN);
  assert.deepEqual(classifyAgentBaseHubProfile(loadOkfBundle(legacyRoot)), { kind: "legacy-unprofiled" });
  assert.equal(loadOkfBundle(legacyRoot).concepts.get("domains/orders")?.path, "domains/orders.md");

  write(root, AGENTBASE_OKF_PROFILE_PATH, PROFILE.replace('version: "1.0"', 'version: "2.0"'));
  const unknown = classifyAgentBaseHubProfile(loadOkfBundle(root));
  assert.equal(unknown.kind, "unsupported");
  if (unknown.kind === "unsupported") assert.match(unknown.failures.join("\n"), /profile version is unsupported/);

  write(root, AGENTBASE_OKF_PROFILE_PATH, PROFILE);
  write(root, "shared/extensions/conflicting-profile.md", PROFILE);
  const conflicting = classifyAgentBaseHubProfile(loadOkfBundle(root));
  assert.equal(conflicting.kind, "unsupported");
  if (conflicting.kind === "unsupported") assert.match(conflicting.failures.join("\n"), /Profile concept must use/);
});

test("[AB-COMPACT-012][AB-COMPACT-014] rejects reserved logs and duplicate compact identities", (t) => {
  const root = fixture(t);
  write(root, "log.md", "# AgentBase activity\n\n## 2026-09-05\n\n* generated\n");
  const logged = classifyAgentBaseHubProfile(loadOkfBundle(root));
  assert.equal(logged.kind, "unsupported");
  if (logged.kind === "unsupported") assert.match(logged.failures.join("\n"), /does not admit reserved activity log\.md/);

  fs.rmSync(path.join(root, "log.md"));
  write(root, "domains/orders.md", DOMAIN);
  assert.throws(() => loadOkfBundle(root), (error: unknown) => {
    assert.equal(error instanceof Error && "code" in error && error.code, "CONCEPT_DUPLICATE");
    assert.match(error instanceof Error ? error.message : "", /duplicate concept identity domains\/orders/);
    return true;
  });
});

test("[AB-PROFILE-003..005][AB-COMPACT-001..005] validates compact homes and preserves foreign OKF content", (t) => {
  const root = fixture(t), bundle = loadOkfBundle(root);
  const admitted = classifyAgentBaseHubProfile(bundle);
  assert.equal(admitted.kind, "profile-1.0");
  if (admitted.kind !== "profile-1.0") return;
  assert.deepEqual(admitted.homes.map((item) => [item.identity, item.home]), [
    ["domains/orders", { kind: "domain", selector: "domains/orders" }],
    ["domains/orders/knowledge/order-processing", { kind: "domain", selector: "domains/orders" }],
    ["shared/agentbase-profile", { kind: "shared" }],
    ["shared/knowledge/operating-note", { kind: "shared" }],
  ]);
  const foreign = bundle.concepts.get("shared/knowledge/operating-note")!;
  const reparsed = parseConceptDocument(foreign.path, renderConceptDocument(foreign));
  assert.deepEqual(reparsed.frontmatter, foreign.frontmatter);
  assert.equal(reparsed.body, foreign.body);

  write(root, "domains/orders/systems/wrong-system.md", SYSTEM);
  write(root, "repositories/type-first.md", FOREIGN);
  const rejected = classifyAgentBaseHubProfile(loadOkfBundle(root));
  assert.equal(rejected.kind, "unsupported");
  if (rejected.kind === "unsupported") {
    assert.match(rejected.failures.join("\n"), /System must use the home-relative knowledge/);
    assert.match(rejected.failures.join("\n"), /must have one domains\/<slug>\/ or shared\/ home/);
  }
});

test("[AB-PROFILE-006..008][AB-COMPACT-002..005] maps compact Domains and bounds deterministic navigation diagnostics", (t) => {
  assert.equal(agentBaseDomainConceptIdentity("domains/order-management"), "domains/order-management");
  assert.equal(agentBaseDomainSelector("domains/order-management"), "domains/order-management");
  for (const invalid of ["orders", "domains/Orders", "domains/orders.md", "domains/orders/nested"]) {
    assert.throws(() => agentBaseDomainConceptIdentity(invalid), /domains\/<slug>/);
  }
  for (const invalid of ["domains/orders/domain", "domains/orders.md", "domains/orders/domain/nested", "shared/domain"]) {
    assert.throws(() => agentBaseDomainSelector(invalid), /domains\/<slug>/);
  }

  const root = fixture(t);
  write(root, "index.md", fs.readFileSync(path.join(root, "index.md"), "utf8")
    .replace("* [Orders](domains/orders/) - Orders Domain Capsule\n", ""));
  const missingNavigation = classifyAgentBaseHubProfile(loadOkfBundle(root));
  assert.equal(missingNavigation.kind, "unsupported");
  if (missingNavigation.kind === "unsupported") {
    assert.match(missingNavigation.failures.join("\n"), /index\.md: Profile 1\.0 navigation must resolve domains\/orders\/index\.md/);
  }

  write(root, "index.md", `---
okf_version: "0.2"
---

# AgentBase Hub

* [Profile](shared/agentbase-profile.md) - AgentBase OKF Profile 1.0
* [Shared](shared/index.md) - Shared knowledge
* [Orders](domains/orders/) - Orders Domain Capsule
`);
  for (let index = 0; index < 140; index += 1) {
    write(root, `root-${String(index).padStart(3, "0")}.md`, FOREIGN);
  }
  const bounded = classifyAgentBaseHubProfile(loadOkfBundle(root));
  assert.equal(bounded.kind, "unsupported");
  if (bounded.kind !== "unsupported") return;
  assert.equal(bounded.failures.length, 128);
  assert.equal(bounded.omittedFailureCount, 12);
  assert.deepEqual(bounded.failures, [...bounded.failures].sort());
  assert.equal(new Set(bounded.failures).size, bounded.failures.length);
});

test("[AB-PROFILE-READ-001] snapshot classification reuses the exact Profile admission rules", (t) => {
  const root = fixture(t), bundle = loadOkfBundle(root);
  const markdown = new Map(bundle.files.filter((relative) => relative.endsWith(".md"))
    .map((relative) => [relative, fs.readFileSync(path.join(root, ...relative.split("/")), "utf8")]));
  const classify = (files: readonly string[]) => classifyAgentBaseHubProfileSnapshot({
    concepts: bundle.concepts,
    files,
    readMarkdown(relativePath) { return markdown.get(relativePath); },
  });
  assert.deepEqual(classify(bundle.files), classifyAgentBaseHubProfile(bundle));
  const unsupported = classify(bundle.files.filter((relative) => relative !== "domains/orders/index.md"));
  assert.equal(unsupported.kind, "unsupported");
  if (unsupported.kind === "unsupported") assert.match(unsupported.failures.join("\n"), /navigation index is missing/);
});
