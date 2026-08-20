import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { createHubIdentity } from "../../../core/hub/index.ts";
import { prepareRefreshHubProposal } from "./refresh.ts";

const EVIDENCE = `sha256:${"c".repeat(64)}`;
const BASE_COMMIT = "b".repeat(40);

function draft(title: string, body: string, extension = ""): string {
  return "---\ntype: Service\n"
    + `title: ${title}\ndescription: ${title} component\nstatus: draft\n`
    + "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }\n"
    + "sources:\n  - id: source\n    resource: repository://repository-acme-aaaaaaaaaaaa/src/a.ts#L1-L2\n"
    + `${extension}---\n\n${body}\n`;
}

function liveClaim(target = "OLD_TTL"): string {
  return "agentbase:\n  live_claims:\n    - id: AB-CLAIM-session-ttl\n"
    + "      subject: repositories/acme\n      property: session.ttl\n      role: configuration\n"
    + `      source_id: source\n      target: { kind: symbol, name: ${target} }\n`
    + `      observed: { commit: ${"a".repeat(40)}, dirty: false, dirty_digest: null }\n`;
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-refresh-test-"));
  const base = path.join(root, "base"), authored = path.join(root, "authored"), proposal = path.join(root, "proposal");
  const write = (folder: string, relative: string, content: string) => {
    const target = path.join(folder, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  write(base, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Acme](repositories/acme/) - repository\n");
  write(base, "repositories/acme/index.md", "# Acme\n\n* [Owned](owned.md) - generated\n* [Reviewed](reviewed.md) - accepted\n");
  write(base, "repositories/acme/owned.md", draft("Owned", "# Before", "extension:\n  keep: exact\n"));
  write(base, "repositories/acme/delete.md", draft("Delete", "# Obsolete"));
  const reviewed = "---\ntype: Service\ntitle: Reviewed\nstatus: stable\n"
    + "generated: { by: 'human:khoa', at: '2026-08-12T00:00:00Z' }\n"
    + "verified: { by: 'human:khoa', at: '2026-08-12T00:00:00Z' }\n---\n\n# Accepted\n";
  write(base, "repositories/acme/reviewed.md", reviewed);
  fs.cpSync(base, authored, { recursive: true });
  return { root, base, authored, proposal, reviewed, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function options(current: ReturnType<typeof fixture>) {
  return {
    hub: createHubIdentity("agentbase/hub", "main"),
    baseCommit: BASE_COMMIT,
    sourceRepositoryId: "repository-acme-aaaaaaaaaaaa",
    hubBundleRoot: current.base,
    authoredBundleRoot: current.authored,
    proposalRoot: current.proposal,
    subjectDirectory: "repositories/acme",
    evidenceDigest: EVIDENCE,
    signals: ["service"],
    createdAt: "2026-08-12T00:00:00Z",
  } as const;
}

test("[AB-HUB-007] refresh preserves reviewed and unknown bytes and exposes lifecycle", () => {
  const current = fixture();
  try {
    current.write(current.authored, "repositories/acme/reviewed.md", current.reviewed.replace("Accepted", "Contradicted"));
    current.write(current.authored, "repositories/acme/owned.md", draft("Owned", "# Changed without extension"));
    fs.rmSync(path.join(current.authored, "repositories/acme/delete.md"));
    current.write(current.authored, "repositories/acme/replacement.md", draft("Replacement", "# Replacement"));
    const result = prepareRefreshHubProposal({
      ...options(current),
      supersessions: [{ previousConceptId: "repositories/acme/reviewed", replacementConceptId: "repositories/acme/replacement" }],
    });
    assert.equal(result.proposal.mode, "refresh");
    assert.equal(result.inspection.counts.conflict, 2);
    assert.equal(result.inspection.counts.supersession, 1);
    assert.equal(result.inspection.counts["deleted-agentbase-draft"], 1);
    assert.equal(fs.readFileSync(path.join(result.bundleRoot, "repositories/acme/reviewed.md"), "utf8"), current.reviewed);
    assert.equal(
      fs.readFileSync(path.join(result.bundleRoot, "repositories/acme/owned.md"), "utf8"),
      fs.readFileSync(path.join(current.base, "repositories/acme/owned.md"), "utf8"),
    );
  } finally { current.cleanup(); }
});

test("[AB-HUB-007] refresh requires an existing subject", () => {
  const current = fixture();
  try {
    assert.throws(
      () => prepareRefreshHubProposal({ ...options(current), subjectDirectory: "repositories/missing" }),
      /use new/,
    );
  } finally { current.cleanup(); }
});

test("[AB-HUB-007] refresh may remove one wholly AgentBase-owned subject and its exact root link", () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.authored, "repositories/acme"), { recursive: true });
    fs.mkdirSync(path.join(current.authored, "repositories/acme"), { recursive: true });
    current.write(current.authored, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    fs.rmSync(path.join(current.base, "repositories/acme/reviewed.md"));
    const result = prepareRefreshHubProposal(options(current));
    assert.equal(result.inspection.applicable, true);
    assert.equal(result.inspection.counts["deleted-agentbase-index"], 1);
    assert.equal(result.inspection.counts["deleted-agentbase-draft"], 2);
    assert.equal(result.inspection.counts.modified, 1);
  } finally { current.cleanup(); }
});

test("[AB-HUB-007] whole-subject refresh protects reviewed content and unrelated root edits", () => {
  const current = fixture();
  try {
    fs.rmSync(path.join(current.authored, "repositories/acme"), { recursive: true });
    current.write(current.authored, "index.md", "---\nokf_version: '0.2'\n---\n\n# Rewritten\n");
    assert.throws(() => prepareRefreshHubProposal(options(current)), /protected content: repositories\/acme\/reviewed.md/);
    fs.rmSync(path.join(current.base, "repositories/acme/reviewed.md"));
    assert.throws(() => prepareRefreshHubProposal(options(current)), /only remove its exact root index link/);
  } finally { current.cleanup(); }
});

test("[AB-HUB-007] prior generated prose cannot become independent evidence", () => {
  const current = fixture();
  try {
    current.write(current.authored, "repositories/acme/new.md", draft("New", "# New").replace(
      "repository://repository-acme-aaaaaaaaaaaa/src/a.ts#L1-L2",
      "owned.md",
    ));
    assert.throws(() => prepareRefreshHubProposal(options(current)), /continuity context/);
  } finally { current.cleanup(); }
});

test("[AB-LOCAL-HUB-012][AB-LOCAL-HUB-013] another repository enriches one canonical concept and additive navigation", () => {
  const current = fixture();
  try {
    const sourceB = "repository-web-bbbbbbbbbbbb";
    current.write(current.base, "systems/shopping-cart.md", draft("Shopping cart", "# System\n\nBefore."));
    current.write(current.base, "components/cart-service.md", draft("Cart service", "# Responsibility\n\nBackend.")
      .replace("sources:\n", "sources:\n  - id: frontend\n    resource: repository://repository-web-bbbbbbbbbbbb/src/cart.ts#L1-L2\n"));
    fs.rmSync(current.authored, { recursive: true });
    fs.cpSync(current.base, current.authored, { recursive: true });
    current.write(current.authored, "index.md", fs.readFileSync(path.join(current.base, "index.md"), "utf8")
      + "\n* [Shopping cart](systems/shopping-cart.md) - system\n");
    current.write(current.authored, "components/cart-service.md", draft("Cart service", "# Responsibility\n\nFrontend and backend.")
      .replace("sources:\n", "sources:\n  - id: frontend\n    resource: repository://repository-web-bbbbbbbbbbbb/src/cart.ts#L1-L2\n"));
    const result = prepareRefreshHubProposal({
      ...options(current), sourceRepositoryId: sourceB, subjectDirectory: "systems/shopping-cart",
    });
    const enriched = fs.readFileSync(path.join(result.bundleRoot, "components/cart-service.md"), "utf8");
    assert.match(enriched, /Frontend and backend/);
    assert.match(enriched, /repository-web-bbbbbbbbbbbb/);
    assert.match(enriched, /repository-acme-aaaaaaaaaaaa/);
    assert.match(fs.readFileSync(path.join(result.bundleRoot, "index.md"), "utf8"), /systems\/shopping-cart\.md/);
  } finally { current.cleanup(); }
});

test("[AB-LOCAL-HUB-013] cross-source refresh preserves foreign evidence and non-additive indexes", () => {
  const current = fixture();
  try {
    current.write(current.base, "systems/shopping-cart.md", draft("Shopping cart", "# System\n\nBefore."));
    current.write(current.base, "components/cart-service.md", draft("Cart service", "# Responsibility\n\nBackend.")
      .replace("sources:\n", "sources:\n  - resource: repository://repository-web-bbbbbbbbbbbb/src/cart.ts#L1-L2\n"));
    fs.rmSync(current.authored, { recursive: true });
    fs.cpSync(current.base, current.authored, { recursive: true });
    current.write(current.authored, "components/cart-service.md", draft("Cart service", "# Responsibility\n\nLost frontend evidence."));
    current.write(current.authored, "index.md", "---\nokf_version: '0.2'\n---\n\n# Rewritten\n");
    const result = prepareRefreshHubProposal({
      ...options(current), subjectDirectory: "systems/shopping-cart",
    });
    assert.equal(
      fs.readFileSync(path.join(result.bundleRoot, "components/cart-service.md"), "utf8"),
      fs.readFileSync(path.join(current.base, "components/cart-service.md"), "utf8"),
    );
    assert.equal(
      fs.readFileSync(path.join(result.bundleRoot, "index.md"), "utf8"),
      fs.readFileSync(path.join(current.base, "index.md"), "utf8"),
    );
    assert.equal(result.inspection.counts.conflict >= 2, true);
  } finally { current.cleanup(); }
});

test("[AB-BENCH-037] refresh rejects new concepts with benchmark-only metadata", () => {
  const current = fixture();
  try {
    current.write(current.authored, "repositories/acme/benchmark.md", draft(
      "Benchmark", "# Responsibility\n\nProduction knowledge.", "benchmark_key: hidden-probe\n",
    ));
    assert.throws(() => prepareRefreshHubProposal(options(current)), /benchmark_key/);
  } finally { current.cleanup(); }
});

test("[AB-REFRESH-013] incomplete refresh cannot remove an accepted live claim", () => {
  const current = fixture();
  try {
    const previous = draft("Owned", "# Before", liveClaim());
    current.write(current.base, "repositories/acme/owned.md", previous);
    current.write(current.authored, "repositories/acme/owned.md", draft("Owned", "# Incomplete"));
    const result = prepareRefreshHubProposal(options(current));
    assert.equal(fs.readFileSync(path.join(result.bundleRoot, "repositories/acme/owned.md"), "utf8"), previous);
    assert.equal(result.inspection.entries.some((entry) => entry.path === "repositories/acme/owned.md"
      && entry.change === "conflict"), true);
  } finally { current.cleanup(); }
});

test("[AB-REFRESH-013] refresh may reviewably move a retained live claim reference", () => {
  const current = fixture();
  try {
    current.write(current.base, "repositories/acme/owned.md", draft("Owned", "# Before", liveClaim()));
    current.write(current.authored, "repositories/acme/owned.md", draft("Owned", "# Before", liveClaim("NEW_TTL"))
      .replace("src/a.ts#L1-L2", "src/b.ts#L7-L9"));
    const result = prepareRefreshHubProposal(options(current));
    const proposed = fs.readFileSync(path.join(result.bundleRoot, "repositories/acme/owned.md"), "utf8");
    assert.match(proposed, /NEW_TTL/);
    assert.match(proposed, /src\/b\.ts#L7-L9/);
    assert.equal(result.inspection.entries.find((entry) => entry.path === "repositories/acme/owned.md")?.change, "modified");
  } finally { current.cleanup(); }
});
