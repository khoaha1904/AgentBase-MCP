import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { globalHubConfigurationPath } from "../configuration/configuration-file.ts";
import { createHubRuntimeActions } from "./runtime-actions.ts";

const repositoryGuidance = {
  candidates: [{ id: "repository", identityHint: "source", identityBasis: "checkout root",
    queryValue: "repository", evidenceIds: ["readme"] }],
  semanticObservations: [{ id: "readme", candidateId: "repository", role: "documentation" as const,
    signal: "repository", source: { path: "README.md", startLine: 1, endLine: 1 } }],
  resourceObservations: [],
};

test("[AB-HUB-SETUP-001..003][AB-HUB-SETUP-006] runtime defers Hub setup and reloads it after explicit local creation", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-runtime-test-"));
  const sourceRoot = path.join(root, "source");
  fs.mkdirSync(sourceRoot);
  fs.writeFileSync(path.join(sourceRoot, "README.md"), "# Source\n");
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
  const actions = createHubRuntimeActions(environment, path.join(root, "state"));
  try {
    assert.deepEqual(await actions.status(), { kind: "unconfigured", setupChoices: ["existing", "new"] });
    await assert.rejects(actions.prepare({ mode: "new", sourceRepository: sourceRoot,
      evidenceDigest: `sha256:${"a".repeat(64)}`, subjectDirectory: "repositories/acme", signals: ["repository"] }), /two explicit setup choices|choose attach-existing/);
    assert.equal(fs.existsSync(globalHubConfigurationPath(environment)), false);
    const configured = await actions.configure({ mode: "new" }) as { kind: string; localRoot: string };
    assert.equal(configured.kind, "local-only");
    const status = await actions.status() as { kind: string; pendingCount: number; localRoot: string };
    assert.equal(status.kind, "local-only");
    assert.equal(status.pendingCount, 0);
    assert.equal(status.localRoot, configured.localRoot);
    const preflight = await actions.preflight(sourceRoot) as {
      repository: { kind: string; repository: { id: string } };
      domains: unknown[];
      source: { identityHints: { remotes: string[]; rootCommits: string[] } };
    };
    assert.equal(preflight.repository.kind, "new");
    assert.match(preflight.repository.repository.id, /^repository-source-[a-f0-9]{12}$/);
    assert.deepEqual(preflight.domains, []);
    assert.deepEqual(preflight.source.identityHints, { remotes: [], rootCommits: [] });
    const prepared = await actions.prepare({ mode: "new", sourceRepository: sourceRoot,
      evidenceDigest: `sha256:${"b".repeat(64)}`, subjectDirectory: "repositories/acme", guidanceRequest: repositoryGuidance,
      confirmedDomain: {
        identity: "domains/commerce", title: "Commerce",
        evidenceResource: "agentbase://owner-guidance/domains/commerce",
      } }) as {
      baseCommit: string;
      selectedSchemas: string[];
      confirmedDomain: { identity: string; title: string; evidenceResource: string };
      source: { repositoryId: string; commit: string | null; dirty: boolean };
      sourceRepositoryId: string;
      continuity: { commit: string; currentSource: unknown[]; neighbors: unknown[]; navigationPaths: string[] };
    };
    assert.equal(prepared.continuity.commit, prepared.baseCommit);
    assert.deepEqual(prepared.continuity.currentSource, []);
    assert.deepEqual(prepared.continuity.neighbors, []);
    assert.deepEqual(prepared.continuity.navigationPaths, ["index.md"]);
    assert.ok(prepared.selectedSchemas.includes("Domain"));
    assert.equal(prepared.source.repositoryId.startsWith("repository-source-"), true);
    assert.equal(prepared.sourceRepositoryId, preflight.repository.repository.id);
    assert.equal(prepared.source.dirty, true);
    assert.deepEqual(prepared.confirmedDomain, {
      identity: "domains/commerce", title: "Commerce",
      evidenceResource: "agentbase://owner-guidance/domains/commerce",
    });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
