import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity } from "../../../core/hub/index.ts";
import { loadOkfBundle } from "../../../core/knowledge/index.ts";
import { prepareNewHubProposal } from "./prepare.ts";
import { prepareRefreshHubProposal } from "./refresh.ts";
import { beginHubAuthoringSession, finalizeHubAuthoringSession } from "./authoring-session.ts";

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
    + sources.map(([repository, file], index) => `  - id: source-${index + 1}\n    resource: repository://${repository}/${file}#L1-L2`).join("\n")
    + `\n---\n\n${body}\n`;
}

function copyBundle(source: string, target: string): void {
  fs.cpSync(source, target, { recursive: true });
}

test("[AB-BENCH-038][AB-BENCH-040] frontend, backend and infrastructure enrich one canonical system graph", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-canonical-graph-"));
  try {
    const base1 = path.join(root, "base-1"), authored1 = path.join(root, "authored-1");
    fs.mkdirSync(base1); fs.mkdirSync(authored1);
    write(authored1, "index.md", "---\nokf_version: '0.2'\n---\n\n# Knowledge\n\n* [Systems](systems/)\n");
    write(authored1, "systems/index.md", "# Systems\n\n* [Shopping cart](shopping-cart.md)\n");
    write(authored1, "systems/shopping-cart.md", concept("System", "Shopping cart", [[FRONTEND, "src/App.vue"]],
      "# Purpose\n\nDelivers the shopping cart capability through the [cart client](../components/cart-client.md)."
        + "\n\n# Limitations\n\nBackend and deployment details are not known yet."));
    write(authored1, "components/cart-client.md", concept("Component", "Cart client", [[FRONTEND, "src/App.vue"]],
      "# Responsibility\n\nStarts cart interactions in the [shopping cart system](../systems/shopping-cart.md).",
      "relationships:\n  - { kind: part-of, target: systems/shopping-cart, evidence: [source-1] }\n"));
    const first = prepareNewHubProposal({
      hub, baseCommit: "a".repeat(40), sourceRepositoryId: FRONTEND, hubBundleRoot: base1,
      authoredBundleRoot: authored1, proposalRoot: path.join(root, "proposal-1"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"1".repeat(64)}`,
      signals: ["software system", "software component"], createdAt: CREATED,
    });

    const base2 = path.join(root, "base-2"), authored2 = path.join(root, "authored-2");
    copyBundle(first.bundleRoot, base2); copyBundle(base2, authored2);
    write(authored2, "systems/shopping-cart.md", concept("System", "Shopping cart", [
      [FRONTEND, "src/App.vue"], [BACKEND, "src/cart.ts"],
    ], "# Purpose\n\nDelivers the shopping cart capability through the [cart client](../components/cart-client.md)"
      + " and [cart service](../components/cart-service.md).\n\n# Limitations\n\nDeployment identity is not known yet."));
    write(authored2, "components/cart-service.md", concept("Component", "Cart service", [[BACKEND, "src/cart.ts"]],
      "# Responsibility\n\nOwns stable cart behavior in the [shopping cart system](../systems/shopping-cart.md).",
      "relationships:\n  - { kind: part-of, target: systems/shopping-cart, evidence: [source-1] }\n"));
    const second = prepareRefreshHubProposal({
      hub, baseCommit: "b".repeat(40), sourceRepositoryId: BACKEND, hubBundleRoot: base2,
      authoredBundleRoot: authored2, proposalRoot: path.join(root, "proposal-2"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"2".repeat(64)}`,
      signals: ["workload component", "independent workload, build, runtime, deployment or ownership boundary"], createdAt: CREATED,
    });

    const base3 = path.join(root, "base-3"), authored3 = path.join(root, "authored-3");
    copyBundle(second.bundleRoot, base3); copyBundle(base3, authored3);
    write(authored3, "systems/shopping-cart.md", concept("System", "Shopping cart", [
      [FRONTEND, "src/App.vue"], [BACKEND, "src/cart.ts"], [INFRA, "main.tf"],
    ], "# Purpose\n\nDelivers the shopping cart capability through the [cart client](../components/cart-client.md), "
      + "[cart service](../components/cart-service.md), [add-item flow](../flows/add-cart-item.md) and "
      + "[declared infrastructure](../infrastructure/shopping-cart.md).\n\n# Limitations\n\nNo applied environment is evidenced."));
    write(authored3, "infrastructure/shopping-cart.md", concept(
      "Resource", "Shopping cart infrastructure", [[INFRA, "main.tf"]],
      "# Purpose\n\nDeclares desired infrastructure for the [shopping cart system](../systems/shopping-cart.md).",
      "configuration_root: .\ndeclared_resources: [cart-service]\nrelationships:\n"
        + "  - { kind: part-of, target: systems/shopping-cart, evidence: [source-1] }\n",
    ));
    write(authored3, "flows/add-cart-item.md", concept("Flow", "Add cart item", [
      [FRONTEND, "src/App.vue"], [BACKEND, "src/cart.ts"], [INFRA, "main.tf"],
    ], "# Purpose\n\nThe [cart client](../components/cart-client.md) invokes the [cart service](../components/cart-service.md).\n\n"
      + "The flow is part of the [shopping cart system](../systems/shopping-cart.md).",
    "business_purpose: Add an item to the cart\ntrigger: Client add action\noutcome: Cart service accepts the item\n"
      + "relationships:\n  - { kind: part-of, target: systems/shopping-cart, evidence: [source-1, source-2] }\n"
      + "flow_steps:\n  - { order: 1, source: components/cart-client, action: invokes, target: components/cart-service, mode: synchronous, evidence: [source-1, source-2] }\n"));
    const third = prepareRefreshHubProposal({
      hub, baseCommit: "c".repeat(40), sourceRepositoryId: INFRA, hubBundleRoot: base3,
      authoredBundleRoot: authored3, proposalRoot: path.join(root, "proposal-3"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"3".repeat(64)}`,
      signals: ["operated resource", "independent cross-boundary, ownership, lifecycle, failure, security or operational evidence", "business flow", "trigger", "observable outcome", "supporting concept evidence"], createdAt: CREATED,
    });

    const bundle = loadOkfBundle(third.bundleRoot, { requireAgentBaseRootIndex: true });
    assert.deepEqual([...bundle.concepts.keys()].sort(), [
      "components/cart-client", "components/cart-service", "flows/add-cart-item",
      "infrastructure/shopping-cart", "systems/shopping-cart",
    ]);
    const system = bundle.concepts.get("systems/shopping-cart");
    assert.ok(system);
    const serializedSources = JSON.stringify(system.frontmatter.sources);
    for (const repository of [FRONTEND, BACKEND, INFRA]) assert.match(serializedSources, new RegExp(repository));
    const flow = bundle.concepts.get("flows/add-cart-item");
    assert.ok(flow);
    for (const repository of [FRONTEND, BACKEND, INFRA]) {
      assert.match(JSON.stringify(flow.frontmatter.sources), new RegExp(repository));
    }

    const omitted = path.join(root, "omitted");
    copyBundle(third.bundleRoot, omitted);
    fs.rmSync(path.join(omitted, "infrastructure/shopping-cart.md"));
    const omissionProposal = prepareRefreshHubProposal({
      hub, baseCommit: "d".repeat(40), sourceRepositoryId: INFRA, hubBundleRoot: third.bundleRoot,
      authoredBundleRoot: omitted, proposalRoot: path.join(root, "proposal-omission"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"8".repeat(64)}`,
      signals: ["operated resource"], createdAt: CREATED,
    });
    assert.equal(fs.existsSync(path.join(omissionProposal.bundleRoot, "infrastructure/shopping-cart.md")), true);

    const explicit = path.join(root, "explicit");
    copyBundle(third.bundleRoot, explicit);
    fs.rmSync(path.join(explicit, "infrastructure/shopping-cart.md"));
    const removalProposal = prepareRefreshHubProposal({
      hub, baseCommit: "d".repeat(40), sourceRepositoryId: INFRA, hubBundleRoot: third.bundleRoot,
      authoredBundleRoot: explicit, proposalRoot: path.join(root, "proposal-removal"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"9".repeat(64)}`,
      signals: ["operated resource"], createdAt: CREATED, lifecycleIntents: [{
        action: "remove-concept", conceptId: "infrastructure/shopping-cart",
        reason: "The current repository removed this exclusively owned declaration",
        evidenceResources: [`repository://${INFRA}/main.tf#L1-L2`],
      }],
    });
    assert.equal(fs.existsSync(path.join(removalProposal.bundleRoot, "infrastructure/shopping-cart.md")), false);

    const contribution = path.join(root, "contribution");
    copyBundle(third.bundleRoot, contribution);
    const systemPath = path.join(contribution, "systems/shopping-cart.md");
    fs.writeFileSync(systemPath, fs.readFileSync(systemPath, "utf8").replace(
      `  - id: source-3\n    resource: repository://${INFRA}/main.tf#L1-L2\n`, "",
    ));
    const contributionProposal = prepareRefreshHubProposal({
      hub, baseCommit: "d".repeat(40), sourceRepositoryId: INFRA, hubBundleRoot: third.bundleRoot,
      authoredBundleRoot: contribution, proposalRoot: path.join(root, "proposal-contribution"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"a".repeat(64)}`,
      signals: ["software system"], createdAt: CREATED, lifecycleIntents: [{
        action: "remove-contribution", conceptId: "systems/shopping-cart",
        reason: "Infrastructure no longer contributes evidence to this shared system",
        evidenceResources: [`repository://${INFRA}/main.tf#L1-L2`],
      }],
    });
    const sharedSystem = loadOkfBundle(contributionProposal.bundleRoot).concepts.get("systems/shopping-cart")!;
    assert.match(JSON.stringify(sharedSystem.frontmatter.sources), new RegExp(FRONTEND));
    assert.match(JSON.stringify(sharedSystem.frontmatter.sources), new RegExp(BACKEND));
    assert.doesNotMatch(JSON.stringify(sharedSystem.frontmatter.sources), new RegExp(INFRA));

    const superseded = path.join(root, "superseded");
    copyBundle(third.bundleRoot, superseded);
    write(superseded, "infrastructure/shopping-cart-v2.md", concept(
      "Resource", "Shopping cart infrastructure v2", [[INFRA, "main.tf"]],
      "# Purpose\n\nReplaces the prior infrastructure description for the [shopping cart system](../systems/shopping-cart.md).",
      "configuration_root: .\ndeclared_resources: [cart-service-v2]\nrelationships:\n"
        + "  - { kind: part-of, target: systems/shopping-cart, evidence: [source-1] }\n",
    ));
    const supersessionProposal = prepareRefreshHubProposal({
      hub, baseCommit: "d".repeat(40), sourceRepositoryId: INFRA, hubBundleRoot: third.bundleRoot,
      authoredBundleRoot: superseded, proposalRoot: path.join(root, "proposal-supersession"),
      subjectDirectory: "systems/shopping-cart", evidenceDigest: `sha256:${"b".repeat(64)}`,
      signals: ["operated resource"], createdAt: CREATED, lifecycleIntents: [{
        action: "supersede", conceptId: "infrastructure/shopping-cart",
        replacementConceptId: "infrastructure/shopping-cart-v2",
        reason: "The replacement carries the current infrastructure contract",
        evidenceResources: [`repository://${INFRA}/main.tf#L1-L2`],
      }],
    });
    assert.equal(supersessionProposal.inspection.groups.supersededOrRetracted.length, 1);
    assert.equal(fs.existsSync(path.join(supersessionProposal.bundleRoot, "infrastructure/shopping-cart.md")), true,
      "supersession preserves historical knowledge");

    const sourceRoot = path.join(root, "source"), stateRoot = path.join(root, "state");
    fs.mkdirSync(sourceRoot);
    const noChangeSession = beginHubAuthoringSession({
      stateRoot, mode: "refresh", localHubId: "d".repeat(24), baseCommit: "d".repeat(40),
      checkoutRoot: third.bundleRoot, sourceRepositoryRoot: sourceRoot,
      sourceRepositoryId: INFRA, sourceState: { commit: null, dirty: false, dirtyDigest: null },
      evidenceDigest: `sha256:${"4".repeat(64)}`,
      subjectDirectory: "systems/shopping-cart", signals: ["operated resource"],
      selectedSchemas: ["Resource"], coverage: { partial: true, limitations: ["unsupported source area"] },
      createdAt: CREATED,
    });
    const noChange = finalizeHubAuthoringSession(stateRoot, noChangeSession.id, third.bundleRoot, [], [],
      { commit: null, dirty: false, dirtyDigest: null }, "d".repeat(40));
    assert.ok("result" in noChange && noChange.result === "no_change");
    assert.deepEqual(noChange.inspection.coverage, { partial: true, limitations: ["unsupported source area"] });
    assert.equal(fs.existsSync(noChangeSession.root), false);
    assert.equal(fs.existsSync(path.join(stateRoot, "proposals")), true);
    assert.deepEqual(fs.readdirSync(path.join(stateRoot, "proposals")), []);

    const changedSession = beginHubAuthoringSession({
      stateRoot, mode: "refresh", localHubId: "d".repeat(24), baseCommit: "d".repeat(40),
      checkoutRoot: third.bundleRoot, sourceRepositoryRoot: sourceRoot,
      sourceRepositoryId: INFRA, sourceState: { commit: null, dirty: false, dirtyDigest: null },
      evidenceDigest: `sha256:${"5".repeat(64)}`, subjectDirectory: "systems/shopping-cart",
      signals: ["operated resource"], selectedSchemas: ["Resource"], createdAt: CREATED,
    });
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, changedSession.id, third.bundleRoot, [], [],
      { commit: null, dirty: true, dirtyDigest: `sha256:${"6".repeat(64)}` }, "d".repeat(40)),
    /source repository changed after Prepare/);

    const invalidSourceSession = beginHubAuthoringSession({
      stateRoot, mode: "refresh", localHubId: "d".repeat(24), baseCommit: "d".repeat(40),
      checkoutRoot: third.bundleRoot, sourceRepositoryRoot: sourceRoot,
      sourceRepositoryId: INFRA, sourceState: { commit: null, dirty: false, dirtyDigest: null },
      evidenceDigest: `sha256:${"7".repeat(64)}`, subjectDirectory: "systems/shopping-cart",
      signals: ["operated resource"], selectedSchemas: ["Resource"], createdAt: CREATED,
    });
    fs.appendFileSync(path.join(invalidSourceSession.bundleRoot, "infrastructure/shopping-cart.md"), "\nUpdated.\n");
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, invalidSourceSession.id, third.bundleRoot, [], [],
      { commit: null, dirty: false, dirtyDigest: null }, "d".repeat(40)),
    /repository source does not exist: main.tf/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
