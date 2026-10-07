import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";

import { loadOkfBundle, searchHubConceptsWithFreshness } from "../../src/core/knowledge/index.ts";
import { byteCost, linkMetrics, measureQualification, measurementTable, readSpec } from "./measure.mjs";
import { createF1, createF2 } from "./measure-fixtures.mjs";
import { createHubIdentity, hubProfileId } from "../../src/core/hub/index.ts";
import { createLocalHub, readPersistedHubConfiguration, replacePersistedHubConfiguration } from "../../src/app/hub-okf/index.ts";
import { runGit } from "../../src/providers/github-hub/index.ts";

test("[AB-MEASURE-001..004] offline specs measure fixture links, product retrieval and MCP costs without source output", async (context) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-measure-test-")));
  try {
    const f1 = await createF1(path.join(root, "f1")), f2 = await createF2(path.join(root, "f2"));
    const extraInput = JSON.parse(fs.readFileSync(f2, "utf8"));
    extraInput.links[0].notes = "Sourcecontentsentinel";
    extraInput.questions[0].expected[0].source_contents = "Sourcecontentsentinel";
    fs.writeFileSync(f2, JSON.stringify(extraInput));
    for (const [label, specFile, expectedLinks, repoCount] of [["F1", f1, 8, 5], ["F2", f2, 2, 2]]) {
      const result = await measureQualification(specFile);
      assert.equal(result.link_mode, "empty-baseline");
      assert.equal(result.links.expected, expectedLinks);
      assert.equal(result.links.matched, 0);
      assert.equal(result.links.recall, 0);
      assert.equal(result.links.precision, null);
      assert.equal(result.links.missing.length, expectedLinks);
      assert.deepEqual(result.links.extra, []);
      assert.equal(result.costs.list_tools.count, 36);
      assert.equal(result.costs.seeds.length, repoCount);
      assert.deepEqual(Object.keys(result.costs.ingest), ["preflight", "discover", "schemas", "prepare", "validate", "finalize", "inspect"]);
      for (const cost of [result.costs.list_tools, ...result.costs.seeds, ...Object.values(result.costs.ingest)]) {
        assert.ok(cost.bytes > 0);
        assert.equal(cost.estimated_tokens, cost.bytes / 4);
      }
      assert.doesNotMatch(JSON.stringify(result), /Sourcecontentsentinel|export async|actual\.length|source_repository|analysis_source_repository|canonicalHttpsUrl/);
      assert.equal(JSON.stringify(result).includes(root), false);
      assert.match(measurementTable(result), /Link recall/);
      context.diagnostic(`${label} measurements: ${JSON.stringify(result)}`);
      if (label === "F2") {
        const spec = readSpec(specFile), bundle = loadOkfBundle(spec.hub.root);
        const reader = { commit: "a".repeat(40), listMarkdownPaths: async () => bundle.files,
          readMarkdown: async (relative) => fs.readFileSync(path.join(spec.hub.root, relative), "utf8") };
        const direct = await searchHubConceptsWithFreshness(reader, spec.questions[0].text, { global: true, limit: 64 });
        assert.equal(direct.status, "ok");
        assert.deepEqual(result.retrieval.questions[0].top_5, direct.matches.slice(0, 5).map((match) => match.identity));
        for (const target of result.retrieval.questions[0].expected) {
          const index = direct.matches.findIndex((match) => match.identity === target.concept_id);
          assert.equal(target.rank, index < 0 ? null : index + 1);
          assert.equal(target.hit_at_5, index >= 0 && index < 5);
        }
        const sourceTarget = result.retrieval.questions[1].expected[0];
        assert.equal(sourceTarget.rank, result.retrieval.questions[1].top_5.indexOf("repositories/metrics-api") + 1);
        const output = path.join(root, "result.json");
        execFileSync(process.execPath, ["scripts/qualification/measure.mjs", specFile, "--output", output],
          { cwd: path.resolve(import.meta.dirname, "../.."), stdio: "pipe" });
        assert.equal(JSON.parse(fs.readFileSync(output, "utf8")).version, 1);
        assert.equal(fs.readFileSync(output, "utf8").includes(root), false);
      }
    }
    const expected = { name: "queue-a", defining_repo: "a", using_repo: "b", kind: "reads-from" };
    const extra = { ...expected, name: "queue-b" };
    const measured = linkMetrics([expected, expected], [expected, extra, extra]);
    assert.equal(measured.recall, 1); assert.equal(measured.precision, 0.5);
    assert.deepEqual(measured.missing, []); assert.deepEqual(measured.extra, [extra]);
    assert.deepEqual(byteCost("abc"), { bytes: 5, estimated_tokens: 1.25 });
    const invalid = JSON.parse(fs.readFileSync(f1, "utf8"));
    invalid.questions = [{ text: "private question", expected: [{ source: "producer:../private" }] }];
    fs.writeFileSync(f1, JSON.stringify(invalid));
    assert.throws(() => readSpec(f1), /Invalid qualification input/);
    assert.throws(() => execFileSync(process.execPath, ["scripts/qualification/measure.mjs", f1],
      { cwd: path.resolve(import.meta.dirname, "../.."), stdio: "pipe" }), (error) => {
      assert.equal(error.stdout.length, 0);
      assert.equal(error.stderr.toString().includes(root), false);
      assert.equal(error.stderr.toString().includes("private question"), false);
      return true;
    });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-MEASURE-004] already-synced measurement reads Published and preserves operator checkout and configuration", async () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-measure-published-")));
  try {
    const specFile = await createF2(root), environment = { AGENTBASE_HOME: path.join(root, "operator-home") };
    const local = await createLocalHub(environment), configuration = readPersistedHubConfiguration(environment);
    const hub = createHubIdentity("fixtures/read-only-hub", "main");
    const git = (args) => runGit({ args, cwd: local.localRoot, operation: "Published measurement fixture" });
    await git(["remote", "add", "origin", hub.canonicalHttpsUrl]);
    replacePersistedHubConfiguration(configuration, { ...configuration, kind: "remote", localHubId: hubProfileId(hub),
      host: hub.host, repository: hub.repository, targetBranch: hub.targetBranch }, environment, { retireExpected: true });
    fs.cpSync(path.join(root, "concepts"), local.localRoot, { recursive: true });
    await git(["add", "."]);
    await git(["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "Published fixture"]);
    const published = (await git(["rev-parse", "HEAD"])).stdout.trim();
    await git(["update-ref", "refs/agentbase/published", published]);
    // A local commit newer than Published must not leak into retrieval.
    const target = path.join(local.localRoot, "repositories/metrics-api.md");
    fs.appendFileSync(target, "\nWorktreeprivatesentinel.\n");
    await git(["add", "."]);
    await git(["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "Local draft fixture"]);
    const retained = fs.readFileSync(target, "utf8"), configBefore = readPersistedHubConfiguration(environment);
    const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
    spec.hub = { agentbase_home: "operator-home" };
    spec.questions.push({ id: "published-boundary", text: "Worktreeprivatesentinel",
      expected: [{ concept_id: "repositories/metrics-api" }] });
    fs.writeFileSync(specFile, JSON.stringify(spec));
    const result = await measureQualification(specFile);
    assert.equal(result.retrieval.questions[0].expected[0].rank, 4);
    assert.equal(result.retrieval.questions[0].hit_at_5, true);
    assert.equal(result.retrieval.questions[2].expected[0].rank, null);
    assert.equal(fs.readFileSync(target, "utf8"), retained);
    assert.deepEqual(readPersistedHubConfiguration(environment), configBefore);
    assert.equal((await git(["rev-parse", "refs/agentbase/published"])).stdout.trim(), published);
    fs.appendFileSync(target, "\nUnsaved fixture edit.\n");
    const dirtyBytes = fs.readFileSync(target, "utf8");
    await assert.rejects(measureQualification(specFile), /local tree must be clean/);
    assert.equal(fs.readFileSync(target, "utf8"), dirtyBytes);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
