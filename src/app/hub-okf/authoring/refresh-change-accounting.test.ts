import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  beginHubAuthoringSession, finalizeHubAuthoringSession, validateHubAuthoringSession,
} from "./authoring-session.ts";
import { validateRefreshChangeAccounting } from "./refresh-change-accounting.ts";

const REPOSITORY = "repository-auth-aaaaaaaaaaaa";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function bundle(root: string, body: string, sourcePath = "src/auth/login.ts"): void {
  write(root, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n");
  write(root, "components/index.md", "# Components\n\n* [Authentication](authentication.md)\n");
  write(root, "components/authentication.md", [
    "---",
    "type: Component",
    "title: Authentication",
    "description: Owns user authentication behavior",
    "status: draft",
    "generated: { by: 'agentbase/0.0.0', at: '2026-08-31T00:00:00Z' }",
    "sources:",
    "  - id: source-auth",
    `    resource: repository://${REPOSITORY}/${sourcePath}#L1-L2`,
    "---",
    "",
    body,
    "",
  ].join("\n"));
}

test("[AB-REFRESH-014] accounting rejects missing, duplicate and extra changed paths", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-accounting-"));
  try {
    const baseRoot = path.join(root, "base"), authoredRoot = path.join(root, "authored");
    bundle(baseRoot, "Login only.");
    bundle(authoredRoot, "Login and password reset.");
    const options = {
      sourceRepositoryId: REPOSITORY, baseRoot, authoredRoot,
      sourceChanges: { paths: ["src/auth/login.ts"], omitted: 0, limitations: [] },
    };
    assert.throws(() => validateRefreshChangeAccounting({ ...options, outcomes: [] }),
      /missing outcome for src\/auth\/login\.ts/);
    assert.throws(() => validateRefreshChangeAccounting({ ...options, outcomes: [
      { path: "src/auth/login.ts", outcome: "updated", reason: "Adds password reset behavior." },
      { path: "src/auth/login.ts", outcome: "ignored", reason: "Duplicate declaration." },
    ] }), /duplicate outcome for src\/auth\/login\.ts/);
    assert.throws(() => validateRefreshChangeAccounting({ ...options, outcomes: [
      { path: "src/auth/login.ts", outcome: "updated", reason: "Adds password reset behavior." },
      { path: "src/auth/unknown.ts", outcome: "ignored", reason: "Not in the prepared delta." },
    ] }), /unexpected outcome for src\/auth\/unknown\.ts/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-REFRESH-015] materialized outcomes require matching changed concept evidence", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-evidence-"));
  try {
    const baseRoot = path.join(root, "base"), authoredRoot = path.join(root, "authored");
    bundle(baseRoot, "Login only.");
    bundle(authoredRoot, "Login and password reset.");
    const common = {
      sourceRepositoryId: REPOSITORY, baseRoot, authoredRoot,
      sourceChanges: { paths: ["src/auth/forgot-password.ts"], omitted: 0, limitations: [] },
    };
    assert.throws(() => validateRefreshChangeAccounting({ ...common, outcomes: [{
      path: "src/auth/forgot-password.ts", outcome: "updated", reason: "Updates authentication.",
    }] }), /unsupported updated outcome for src\/auth\/forgot-password\.ts/);

    bundle(authoredRoot, "Login and password reset.", "src/auth/forgot-password.ts");
    assert.throws(() => validateRefreshChangeAccounting({ ...common, outcomes: [{
      path: "src/auth/forgot-password.ts", outcome: "new", reason: "Adds password reset.",
    }] }), /unsupported new outcome for src\/auth\/forgot-password\.ts/);

    const accounting = validateRefreshChangeAccounting({ ...common, outcomes: [{
      path: "src/auth/forgot-password.ts", outcome: "updated", reason: "  Adds password reset.  ",
    }] });
    assert.deepEqual(accounting, {
      outcomes: [{ path: "src/auth/forgot-password.ts", outcome: "updated", reason: "Adds password reset." }],
      partial: false,
      omitted: 0,
      limitations: [],
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-REFRESH-016] non-materialized outcomes preserve partial source-diff context", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-partial-"));
  try {
    const baseRoot = path.join(root, "base"), authoredRoot = path.join(root, "authored");
    bundle(baseRoot, "Login only.");
    bundle(authoredRoot, "Login only.");
    const accounting = validateRefreshChangeAccounting({
      sourceRepositoryId: REPOSITORY, baseRoot, authoredRoot,
      sourceChanges: { paths: ["test/auth.test.ts"], omitted: 2,
        limitations: ["last observed Git revision is unavailable in this checkout"] },
      outcomes: [{ path: "test/auth.test.ts", outcome: "ignored",
        reason: "Test coverage changed without changing shared system behavior." }],
    });
    assert.deepEqual(accounting, {
      outcomes: [{ path: "test/auth.test.ts", outcome: "ignored",
        reason: "Test coverage changed without changing shared system behavior." }],
      partial: true,
      omitted: 2,
      limitations: ["last observed Git revision is unavailable in this checkout"],
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-REFRESH-013][AB-REFRESH-016] ignored-only source delta creates a reviewable observation proposal", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-observation-"));
  try {
    const hubRoot = path.join(root, "hub"), sourceRoot = path.join(root, "source"), stateRoot = path.join(root, "state");
    fs.mkdirSync(hubRoot); fs.mkdirSync(sourceRoot);
    write(sourceRoot, "README.md", "# Auth\n\n");
    write(sourceRoot, "test/auth.test.ts", "test('login', () => {});\n");
    write(hubRoot, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Repositories](repositories/)\n");
    write(hubRoot, "repositories/index.md", "# Repositories\n\n* [Auth](auth.md)\n");
    write(hubRoot, "repositories/auth.md", [
      "---",
      "type: Repository",
      "title: Auth",
      "description: Authentication source repository",
      "status: draft",
      "generated: { by: 'agentbase/0.0.0', at: '2026-08-30T00:00:00Z' }",
      "sources:",
      "  - id: source-readme",
      `    resource: repository://${REPOSITORY}/README.md#L1-L2`,
      "agentbase:",
      "  repository:",
      `    id: ${REPOSITORY}`,
      "    display_name: auth",
      "    aliases: { remotes: [], root_commits: [] }",
      `    observed_source: { commit: ${"a".repeat(40)}, dirty: false, dirty_digest: null, observed_at: '2026-08-30T00:00:00Z' }`,
      "---",
      "",
      "# Purpose",
      "",
      "Owns authentication source.",
      "",
    ].join("\n"));
    const currentSource = { commit: "b".repeat(40), dirty: false, dirtyDigest: null };
    const session = beginHubAuthoringSession({
      stateRoot, mode: "refresh", localHubId: "c".repeat(24), baseCommit: "d".repeat(40),
      checkoutRoot: hubRoot, sourceRepositoryRoot: sourceRoot, sourceRepositoryId: REPOSITORY,
      sourceState: currentSource, evidenceDigest: `sha256:${"e".repeat(64)}`,
      subjectDirectory: "repositories/auth", signals: ["repository"], selectedSchemas: ["Repository"],
      sourceChanges: { paths: ["test/auth.test.ts"], omitted: 1, limitations: ["one path was outside the bound"] },
      createdAt: "2026-08-31T00:00:00Z",
    });
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, session.id, hubRoot, [], [], currentSource,
      "d".repeat(40)), /missing outcome for test\/auth\.test\.ts/);
    assert.equal(fs.existsSync(session.root), true);

    const finalized = finalizeHubAuthoringSession(stateRoot, session.id, hubRoot, [], [], currentSource,
      "d".repeat(40), true, [{ path: "test/auth.test.ts", outcome: "ignored",
        reason: "Test-only change does not alter shared authentication behavior." }]);
    assert.ok("proposal" in finalized);
    assert.deepEqual(finalized.inspection.changeAccounting, {
      outcomes: [{ path: "test/auth.test.ts", outcome: "ignored",
        reason: "Test-only change does not alter shared authentication behavior." }],
      partial: true, omitted: 1, limitations: ["one path was outside the bound"],
    });
    assert.equal(finalized.inspection.groups.updated.some((entry) => entry.path === "repositories/auth.md"), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-SCHEMA-056][AB-REFRESH-017..018] session validation catches stale source IDs and isolated new concepts", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-preflight-"));
  try {
    const hubRoot = path.join(root, "hub"), sourceRoot = path.join(root, "source"), stateRoot = path.join(root, "state");
    fs.mkdirSync(hubRoot); fs.mkdirSync(sourceRoot);
    write(sourceRoot, "main.tf", "resource \"example\" \"queue\" {}\n");
    write(hubRoot, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    write(hubRoot, "repositories/index.md", "# Repositories\n\n* [Worker](worker.md)\n");
    write(hubRoot, "repositories/worker.md", [
      "---", "type: Repository", "title: Worker", "description: Worker source repository",
      "status: draft", "generated: { by: 'agentbase/0.0.0', at: '2026-08-30T00:00:00Z' }",
      "sources:", "  - id: worker-source", `    resource: repository://${REPOSITORY}/main.tf#L1-L1`,
      `    observed_revision: ${"a".repeat(40)}`,
      "agentbase:", "  repository:", `    id: ${REPOSITORY}`, "    display_name: worker",
      "    aliases: { remotes: [], root_commits: [] }",
      `    observed_source: { commit: ${"a".repeat(40)}, dirty: false, dirty_digest: null, observed_at: '2026-08-30T00:00:00Z' }`,
      "---", "", "# Purpose", "", "Owns worker source.", "",
    ].join("\n"));
    const currentSource = { commit: "b".repeat(40), dirty: false, dirtyDigest: null };
    const session = beginHubAuthoringSession({
      stateRoot, mode: "refresh", localHubId: "c".repeat(24), baseCommit: "d".repeat(40),
      checkoutRoot: hubRoot, sourceRepositoryRoot: sourceRoot, sourceRepositoryId: REPOSITORY,
      sourceState: currentSource, evidenceDigest: `sha256:${"e".repeat(64)}`,
      subjectDirectory: "repositories/worker", signals: ["repository", "resource"],
      selectedSchemas: ["Repository", "Resource"], requireObservedRevision: true,
      createdAt: "2026-08-31T00:00:00Z",
    });
    const repositoryPath = path.join(session.bundleRoot, "repositories/worker.md");
    fs.writeFileSync(repositoryPath, fs.readFileSync(repositoryPath, "utf8")
      .replace(`main.tf#L1-L1`, "main.tf")
      .replace(`observed_revision: ${"a".repeat(40)}`, `observed_revision: ${"b".repeat(40)}`));
    assert.throws(() => validateHubAuthoringSession(stateRoot, session.id, hubRoot),
      /re-observed repository source must use a revision-distinct source ID/);

    fs.writeFileSync(repositoryPath, fs.readFileSync(repositoryPath, "utf8").replace("id: worker-source", "id: worker-source-current"));
    write(session.bundleRoot, "resources/index.md", "# Resources\n\n* [Retry queue](retry-queue.md)\n");
    const resourcePath = path.join(session.bundleRoot, "resources/retry-queue.md");
    write(session.bundleRoot, "resources/retry-queue.md", [
      "---", "type: Resource", "title: Retry queue", "description: Queue for exhausted retries",
      "status: draft", "generated: { by: 'agentbase/0.0.0', at: '2026-08-31T00:00:00Z' }",
      "sources:", "  - id: retry-queue-source", `    resource: repository://${REPOSITORY}/main.tf#L1-L1`,
      `    observed_revision: ${"b".repeat(40)}`, "---", "", "# Purpose", "", "Stores exhausted retries.", "",
    ].join("\n"));
    assert.throws(() => validateHubAuthoringSession(stateRoot, session.id, hubRoot),
      /new standalone concept must have an evidenced structural path to a Repository or Domain/);

    fs.writeFileSync(resourcePath, fs.readFileSync(resourcePath, "utf8").replace("---\n\n# Purpose", [
      "relationships:", "  - kind: implemented-in", "    target: repositories/worker",
      "    evidence:", "      - retry-queue-source", "---", "", "# Purpose",
    ].join("\n")).replace("Stores exhausted retries.",
      "Stores exhausted retries. Implemented in [Worker](../repositories/worker.md)."));
    assert.doesNotThrow(() => validateHubAuthoringSession(stateRoot, session.id, hubRoot));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
