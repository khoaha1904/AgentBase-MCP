import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadOkfBundle, renderConceptDocument } from "../../../core/knowledge/index.ts";
import { beginHubAuthoringSession, readHubAuthoringSession } from "./authoring-session.ts";
import { normalizeRefreshRepositoryLayout } from "./repository-layout.ts";

const REPOSITORY = "repository-worker-aaaaaaaaaaaa";
const copied = "| Jobs | Input transport | message-queue | aws / sqs | `queue` |";
const table = `# Embedded Knowledge\n\n| Name | Role | Kind | Technology | Evidence |\n|---|---|---|---|---|\n${copied}\n\n## Exact Evidence\n\n* \x60queue\x60 - \x60repository://${REPOSITORY}/main.tf#L1-L2\x60\n`;

test("[AB-LOCAL-HUB-014] Refresh prepares a linked Repository from legacy copied child tables", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-repository-layout-"));
  const hub = path.join(root, "hub"), source = path.join(root, "source");
  try {
    fs.mkdirSync(path.join(hub, "repositories"), { recursive: true });
    fs.mkdirSync(path.join(hub, "components"));
    fs.mkdirSync(source);
    fs.writeFileSync(path.join(hub, "index.md"), "---\nokf_version: '0.2'\n---\n# Hub\n");
    const sources = `sources:\n  - id: queue\n    resource: repository://${REPOSITORY}/main.tf#L1-L2\n`;
    const repositoryPath = path.join(hub, "repositories/worker.md"), childPath = path.join(hub, "components/worker.md");
    const original = `---\ntype: Repository\ntitle: Worker\nstatus: draft\ngenerated: { by: agentbase/0.1.0, at: '2026-10-06T00:00:00Z' }\n${sources}agentbase:\n  repository:\n    id: ${REPOSITORY}\n    display_name: Worker\n    aliases: { remotes: [], root_commits: [] }\n---\n# Purpose\n\nRuns jobs.\n\n${table}`;
    const child = `---\ntype: Function\ntitle: Worker runtime\n${sources}---\n# Runtime\n\n${table}`;
    fs.writeFileSync(repositoryPath, original); fs.writeFileSync(childPath, child);
    const session = beginHubAuthoringSession({ stateRoot: path.join(root, "state"), mode: "refresh",
      localHubId: "c".repeat(24), baseCommit: "b".repeat(40), checkoutRoot: hub, sourceRepositoryRoot: source,
      sourceRepositoryId: REPOSITORY, sourceState: { commit: "a".repeat(40), dirty: false, dirtyDigest: null },
      evidenceDigest: `sha256:${"d".repeat(64)}`, subjectDirectory: "repositories/worker",
      signals: ["repository"], selectedSchemas: ["Repository", "Function"], createdAt: "2026-10-06T00:00:00Z" });
    assert.deepEqual(session.skeletons, [{ identity: "repositories/worker", path: "repositories/worker.md", type: "Repository" }]);
    assert.deepEqual(readHubAuthoringSession(path.join(root, "state"), session.id, hub).skeletons, session.skeletons);
    const statePath = path.join(session.root, "session.json");
    const persisted = fs.readFileSync(statePath, "utf8");
    fs.writeFileSync(statePath, JSON.stringify({ ...session, mode: "new", refreshScope: undefined }));
    assert.throws(() => readHubAuthoringSession(path.join(root, "state"), session.id, hub), /skeleton state is invalid/);
    fs.writeFileSync(statePath, JSON.stringify({ ...session, skeletons: [{ identity: "repositories/worker", path: "worker.txt", type: "Repository" }] }));
    assert.throws(() => readHubAuthoringSession(path.join(root, "state"), session.id, hub), /skeleton state is invalid/);
    fs.writeFileSync(statePath, persisted);
    const normalized = loadOkfBundle(session.bundleRoot).concepts.get("repositories/worker")!;
    assert.doesNotMatch(normalized.body, /Embedded Knowledge|Exact Evidence|Input transport/);
    assert.match(normalized.body, /\[Worker runtime\]\(\.\.\/components\/worker\.md\)/);
    assert.match(normalized.body, /Runs jobs/);
    assert.deepEqual(normalized.frontmatter, loadOkfBundle(hub).concepts.get("repositories/worker")!.frontmatter);
    assert.equal(fs.readFileSync(repositoryPath, "utf8"), original);
    assert.equal(fs.readFileSync(path.join(session.bundleRoot, "components/worker.md"), "utf8"), child);
    assert.deepEqual(normalizeRefreshRepositoryLayout(session.bundleRoot, REPOSITORY), [], "normalization is idempotent");
    // A Repository-owned row and unrelated prose must survive a mixed legacy table.
    fs.writeFileSync(repositoryPath, original.replace(copied, `${copied}\n| Repository config | Own settings | config | toml | \x60config\x60 |`)
      .replace("## Exact Evidence", "Repository operational notes.\n\n## Exact Evidence"));
    normalizeRefreshRepositoryLayout(hub, REPOSITORY);
    assert.match(fs.readFileSync(repositoryPath, "utf8"), /Repository config.*Own settings/);
    assert.match(fs.readFileSync(repositoryPath, "utf8"), /Repository operational notes/);
    assert.doesNotMatch(fs.readFileSync(repositoryPath, "utf8"), /Input transport/);
    for (const frontmatter of [{ status: "verified" }, { generated: { by: "human:owner" } }]) {
      const concept = loadOkfBundle(session.baseRoot).concepts.get("repositories/worker")!;
      fs.writeFileSync(repositoryPath, renderConceptDocument({ ...concept, frontmatter: { ...concept.frontmatter, ...frontmatter } }));
      const protectedBytes = fs.readFileSync(repositoryPath, "utf8");
      assert.deepEqual(normalizeRefreshRepositoryLayout(hub, REPOSITORY), []);
      assert.equal(fs.readFileSync(repositoryPath, "utf8"), protectedBytes);
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
