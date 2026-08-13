import assert from "node:assert/strict";
import test from "node:test";

import {
  executeGraphBenchmarkCli,
  executeObservationCli,
  executeRealEvidenceCli,
  type benchmarkRealGraphLifecycle,
  type prepareRealRepositoryEvidence,
} from "./real-evidence.ts";

test("[AB-OBS-001..007] observation is explicit evidence output and invokes no OKF workflow", async () => {
  const output: string[] = [];
  const calls: unknown[][] = [];
  const prepare = (async (...args: unknown[]) => {
    calls.push(args);
    return { evidence: { formatVersion: 1, bundleDigest: "sha256:abc" }, diagnostics: { ignored: true } };
  }) as unknown as typeof prepareRealRepositoryEvidence;
  assert.equal(await executeObservationCli(
    ["/repository", "serveCodebaseMemoryMcp"], (value) => output.push(value), () => {}, prepare,
  ), 0);
  assert.deepEqual(JSON.parse(output.join("")), { formatVersion: 1, bundleDigest: "sha256:abc" });
  assert.deepEqual(calls, [["/repository", "serveCodebaseMemoryMcp", "scoped-session", "observe", false]]);
});

test("[AB-OBS-001][AB-OBS-006] observation rejects invalid input and emits no partial success", async () => {
  const output: string[] = [];
  const errors: string[] = [];
  assert.equal(await executeObservationCli([], (value) => output.push(value), (value) => errors.push(value)), 2);
  assert.equal(await executeObservationCli(
    ["/private/repository", "symbol"], (value) => output.push(value), (value) => errors.push(value),
    async () => { throw new Error("failed at /private/repository"); },
  ), 1);
  assert.deepEqual(output, []);
  assert.match(errors.join(""), /observe/);
  assert.equal(errors.join("").includes("/private/repository"), false);
});

test("[AB-GRAPH-004][AB-GRAPH-013] promoted default is scoped-session and one-shot stays explicit", async () => {
  const selected: string[] = [];
  const prepare = (async (_repository, _symbol, transport) => {
    selected.push(transport ?? "missing");
    return {};
  }) as typeof prepareRealRepositoryEvidence;
  assert.equal(await executeRealEvidenceCli(["fixture", "symbol"], () => {}, () => {}, prepare), 0);
  assert.equal(await executeRealEvidenceCli(
    ["fixture", "symbol", "--transport", "one-shot"], () => {}, () => {}, prepare,
  ), 0);
  assert.deepEqual(selected, ["scoped-session", "one-shot"]);
});

test("[AB-GRAPH-013] integration CLI keeps transport selection explicit and validates bad input offline", async () => {
  const errors: string[] = [];
  assert.equal(await executeRealEvidenceCli([], () => {}, (value) => errors.push(value)), 2);
  assert.equal(await executeRealEvidenceCli(
    ["fixture", "symbol", "--transport", "unknown"], () => {}, (value) => errors.push(value),
  ), 2);
  assert.match(errors.join(""), /one-shot\|scoped-session/);
});

test("[AB-REFRESH-005][AB-REFRESH-009] integration CLI accepts one explicit refresh flag in either option order", async () => {
  const selected: boolean[] = [];
  const prepare = (async (_repository, _symbol, _transport, _scope, refresh) => {
    selected.push(refresh ?? false);
    return {};
  }) as typeof prepareRealRepositoryEvidence;
  assert.equal(await executeRealEvidenceCli(
    ["fixture", "symbol", "--refresh", "--transport", "one-shot"], () => {}, () => {}, prepare,
  ), 0);
  assert.equal(await executeRealEvidenceCli(
    ["fixture", "symbol", "--transport", "scoped-session", "--refresh"], () => {}, () => {}, prepare,
  ), 0);
  assert.deepEqual(selected, [true, true]);

  const errors: string[] = [];
  assert.equal(await executeRealEvidenceCli(
    ["fixture", "symbol", "--refresh", "--refresh"], () => {}, (value) => errors.push(value), prepare,
  ), 2);
  assert.equal(await executeRealEvidenceCli(
    ["fixture", "symbol", "--refresh", "yes"], () => {}, (value) => errors.push(value), prepare,
  ), 2);
  assert.match(errors.join(""), /--refresh/);
});

test("[AB-GRAPH-012] integration failure is distinct from invalid arguments and redacts the local root", async () => {
  const errors: string[] = [];
  const repository = "/private/repository";
  const status = await executeRealEvidenceCli(
    [repository, "symbol", "--transport", "scoped-session"],
    () => {},
    (value) => errors.push(value),
    async () => { throw new Error(`protocol failed for ${repository}`); },
  );
  assert.equal(status, 1);
  assert.equal(errors.join("").includes(repository), false);
  assert.match(errors.join(""), /protocol failed for <repository>/);
});

test("[AB-GRAPH-001][AB-GRAPH-014] benchmark CLI rejects arguments without invoking the provider", async () => {
  const errors: string[] = [];
  assert.equal(await executeGraphBenchmarkCli(["unexpected"], () => {}, (value) => errors.push(value)), 2);
  assert.match(errors.join(""), /benchmark:codebase-memory/);
});

test("[AB-GRAPH-002][AB-GRAPH-012] benchmark CLI emits failed-arm diagnostics and exits distinctly", async () => {
  const output: string[] = [];
  const benchmark = (async () => ({
    arms: [{ pair: 1, order: 1, transport: "scoped-session", outcome: "failed", failure: { code: "SESSION_TOOL_FAILED" } }],
    oneShotMedianMs: null, scopedSessionMedianMs: null, speedRatio: null,
    parity: false, promotionEligible: false, limitations: ["one or more benchmark arms failed"],
  })) as typeof benchmarkRealGraphLifecycle;
  assert.equal(await executeGraphBenchmarkCli([], (value) => output.push(value), () => {}, benchmark), 1);
  const report = JSON.parse(output.join("")) as { arms: { failure: { code: string } }[] };
  assert.equal(report.arms[0]?.failure.code, "SESSION_TOOL_FAILED");
});
