import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import { loadOkfBundle } from "../../core/knowledge/index.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { prepareRefreshHubProposal } from "./refresh.ts";

const FRONTEND = "repository-frontend-aaaaaaaaaaaa";
const BACKEND = "repository-backend-bbbbbbbbbbbb";
const INFRA = "repository-infrastructure-cccccccccccc";
const CREATED = "2026-08-15T00:00:00Z";
const hub = createHubIdentity("agentbase/hub", "main");

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function concept(type: string, title: string, sources: readonly [string, string][], body: string, extra = ""): string {
  return `---\ntype: ${type}\ntitle: ${title}\ndescription: Canonical shopping cart knowledge\nstatus: draft\n`
    + `generated: { by: 'agentbase/0.0.0', at: '${CREATED}' }\n${extra}sources:\n`
    + sources.map(([repository, file]) => `  - resource: repository://${repository}/${file}#L1-L2`).join("\n")
    + `\n---\n\n${body}\n`;
}

function copyBundle(source: string, target: string): void {
  fs.cpSync(source, target, { recursive: true });
}

test("[AB-BENCH-038] frontend, backend and infrastructure enrich one canonical system graph", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-canonical-graph-"));
  try {
    const base1 = path.join(root, "base-1"), authored1 = path.join(root, "authored-1");
    fs.mkdirSync(base1); fs.mkdirSync(authored1);
    write(authored1, "index.md", "---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n* [Shopping cart](systems/shopping-cart.md)\n");
    write(authored1, "systems/shopping-cart.md", concept("System", "Shopping cart", [[FRONTEND, "src/App.vue"]],
      "# Purpose\n\nDelivers the shopping cart capability.\n\n# Limitations\n\nBackend and deployment details are not known yet."));
    const first = prepareNewHubProposal({
      hub, baseCommit: "a".repeat(40), sourceRepositoryId: FRONTEND, hubBundleRoot: base1,
      authoredBundleRoot: authored1, proposalRoot: path.join(root, "proposal-1"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"1".repeat(64)}`,
      signals: ["software system"], createdAt: CREATED,
    });

    const base2 = path.join(root, "base-2"), authored2 = path.join(root, "authored-2");
    copyBundle(first.bundleRoot, base2); copyBundle(base2, authored2);
    write(authored2, "index.md", fs.readFileSync(path.join(base2, "index.md"), "utf8")
      + "* [Cart service](components/cart-service.md)\n");
    write(authored2, "systems/shopping-cart.md", concept("System", "Shopping cart", [
      [FRONTEND, "src/App.vue"], [BACKEND, "src/cart.ts"],
    ], "# Purpose\n\nDelivers the shopping cart capability through the frontend and cart service.\n\n# Limitations\n\nDeployment identity is not known yet."));
    write(authored2, "components/cart-service.md", concept("Service", "Cart service", [[BACKEND, "src/cart.ts"]],
      "# Responsibility\n\nOwns stable cart behavior and its runtime interface."));
    const second = prepareRefreshHubProposal({
      hub, baseCommit: "b".repeat(40), sourceRepositoryId: BACKEND, hubBundleRoot: base2,
      authoredBundleRoot: authored2, proposalRoot: path.join(root, "proposal-2"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"2".repeat(64)}`,
      signals: ["service"], createdAt: CREATED,
    });

    const base3 = path.join(root, "base-3"), authored3 = path.join(root, "authored-3");
    copyBundle(second.bundleRoot, base3); copyBundle(base3, authored3);
    write(authored3, "index.md", fs.readFileSync(path.join(base3, "index.md"), "utf8")
      + "* [Cart infrastructure](infrastructure/shopping-cart.md)\n");
    write(authored3, "systems/shopping-cart.md", concept("System", "Shopping cart", [
      [FRONTEND, "src/App.vue"], [BACKEND, "src/cart.ts"], [INFRA, "main.tf"],
    ], "# Purpose\n\nDelivers the shopping cart capability through frontend, backend and declared infrastructure.\n\n# Limitations\n\nNo applied environment is evidenced."));
    write(authored3, "infrastructure/shopping-cart.md", concept(
      "Infrastructure Definition", "Shopping cart infrastructure", [[INFRA, "main.tf"]],
      "# Purpose\n\nDeclares the desired infrastructure for the canonical shopping cart system.",
      "configuration_root: .\ndeclared_resources: [cart-service]\n",
    ));
    const third = prepareRefreshHubProposal({
      hub, baseCommit: "c".repeat(40), sourceRepositoryId: INFRA, hubBundleRoot: base3,
      authoredBundleRoot: authored3, proposalRoot: path.join(root, "proposal-3"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"3".repeat(64)}`,
      signals: ["terraform root configuration"], createdAt: CREATED,
    });

    const bundle = loadOkfBundle(third.bundleRoot, { requireAgentBaseRootIndex: true });
    assert.deepEqual([...bundle.concepts.keys()].sort(), [
      "components/cart-service", "infrastructure/shopping-cart", "systems/shopping-cart",
    ]);
    const system = bundle.concepts.get("systems/shopping-cart");
    assert.ok(system);
    const serializedSources = JSON.stringify(system.frontmatter.sources);
    for (const repository of [FRONTEND, BACKEND, INFRA]) assert.match(serializedSources, new RegExp(repository));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
