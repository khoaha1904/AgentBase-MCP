import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runGit } from "../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "./runtime-actions.ts";

async function sourceRepository(root: string): Promise<string> {
  const repository = path.join(root, "source");
  fs.mkdirSync(repository);
  await runGit({ args: ["init", "-b", "main"], cwd: repository, operation: "initialize source fixture" });
  fs.writeFileSync(path.join(repository, "README.md"), "# Source\n");
  await runGit({ args: ["add", "README.md"], cwd: repository, operation: "stage source fixture" });
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "source"],
    cwd: repository, operation: "commit source fixture", commitTimestamp: "2026-08-13T00:00:00Z" });
  return repository;
}

test("[AB-HUB-SETUP-006..008][SC-003] local-only Hub accepts, queries and inventories two knowledge commits without a remote", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "local-only-hub-e2e-"));
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
  const actions = createHubRuntimeActions(environment, path.join(root, "state"));
  try {
    const repository = await sourceRepository(root);
    const configured = await actions.configure({ mode: "new" }) as { localRoot: string };
    for (const sequence of [1, 2]) {
      const prepared = await actions.prepare({ mode: "new", sourceRepository: repository,
        evidenceDigest: `sha256:${String(sequence).repeat(64)}`, subjectDirectory: `repositories/repo-${sequence}`,
        signals: ["repository"] }) as { sessionId: string; bundleRoot: string; sourceRepositoryId: string };
      fs.mkdirSync(path.join(prepared.bundleRoot, `repositories/repo-${sequence}`), { recursive: true });
      fs.appendFileSync(path.join(prepared.bundleRoot, "index.md"), `\n* [Repo ${sequence}](repositories/repo-${sequence}/) - repository\n`);
      fs.writeFileSync(path.join(prepared.bundleRoot, `repositories/repo-${sequence}/index.md`),
        `# Repo ${sequence}\n\n* [Repository](repository.md) - identity\n`);
      fs.writeFileSync(path.join(prepared.bundleRoot, `repositories/repo-${sequence}/repository.md`),
        `---\ntype: Repository\ntitle: Repo ${sequence}\ndescription: Repository ${sequence}\nstatus: draft\n`
        + `generated: { by: 'agentbase/0.0.0', at: '2026-08-13T00:00:00Z' }\n`
        + `sources:\n  - resource: repository://${prepared.sourceRepositoryId}/README.md#L1-L1\n---\n\n# Purpose\n\nRepo ${sequence}.\n`);
      const finalized = await actions.finalize(prepared.sessionId) as { proposal: { id: string; diffDigest: string } };
      await actions.accept(finalized.proposal.id, finalized.proposal.diffDigest);
    }
    const pending = await actions.listPending() as readonly unknown[];
    assert.equal(pending.length, 2);
    const matches = await actions.search("Repo 2") as readonly { path: string }[];
    assert.equal(matches.some((match) => match.path === "repositories/repo-2/repository.md"), true);
    assert.equal((await runGit({ args: ["remote"], cwd: configured.localRoot, operation: "verify no local Hub remote" })).stdout, "");
    await assert.rejects(actions.submitMany(["x"]), /first bootstrap/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
