import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import { createHubIdentity, createLocalHubState } from "../../../core/hub/index.ts";
import type { GitRequest } from "../../../providers/github-hub/index.ts";
import { recoverSynchronizationTransaction } from "./recovery.ts";
import { synchronizeLocalHub } from "./synchronize.ts";

const execute = promisify(execFile);

function git(root: string, args: readonly string[]): string {
  const result = spawnSync("/usr/bin/git", [...args], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

function proposalMessage(id: string, subject: string): string {
  return [
    `AgentBase proposal ${id}`,
    "",
    `AgentBase-Proposal-ID: ${id}`,
    `AgentBase-Subject: ${subject}`,
    `AgentBase-Source-ID: repository-${subject.slice(subject.lastIndexOf("/") + 1)}-aaaaaaaaaaaa`,
    `AgentBase-Evidence-Digest: sha256:${"d".repeat(64)}`,
    `AgentBase-Diff-Digest: sha256:${id[0]!.repeat(64)}`,
    "AgentBase-Schema-Catalog: 2.0.0",
  ].join("\n");
}

async function fixture(conflict: boolean) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-sync-e2e-"));
  const remote = path.join(root, "remote.git");
  const seed = path.join(root, "seed");
  const local = path.join(root, "local");
  const collaborator = path.join(root, "collaborator");
  fs.mkdirSync(seed);
  git(root, ["init", "--bare", "--initial-branch=main", remote]);
  git(seed, ["init", "-b", "main"]);
  git(seed, ["config", "user.name", "Test"]);
  git(seed, ["config", "user.email", "test@agentbase.local"]);
  fs.writeFileSync(path.join(seed, "index.md"), "# Hub\n");
  git(seed, ["add", "index.md"]);
  git(seed, ["commit", "-m", "base"]);
  git(seed, ["remote", "add", "origin", remote]);
  git(seed, ["push", "origin", "main"]);
  git(root, ["clone", remote, local]);
  git(local, ["config", "user.name", "Test"]);
  git(local, ["config", "user.email", "test@agentbase.local"]);
  const base = git(local, ["rev-parse", "HEAD"]);
  const firstId = "1".repeat(24), secondId = "2".repeat(24);
  fs.writeFileSync(path.join(local, "first.md"), "first proposal\n");
  git(local, ["add", "first.md"]);
  git(local, ["commit", "-m", proposalMessage(firstId, "repositories/first")]);
  const first = git(local, ["rev-parse", "HEAD"]);
  fs.writeFileSync(path.join(local, "second.md"), "second proposal\n");
  git(local, ["add", "second.md"]);
  git(local, ["commit", "-m", proposalMessage(secondId, "repositories/second")]);
  const second = git(local, ["rev-parse", "HEAD"]);
  git(root, ["clone", remote, collaborator]);
  git(collaborator, ["config", "user.name", "Collaborator"]);
  git(collaborator, ["config", "user.email", "collaborator@agentbase.local"]);
  git(collaborator, ["remote", "add", "pending", local]);
  git(collaborator, ["fetch", "pending", first]);
  git(collaborator, ["cherry-pick", "FETCH_HEAD"]);
  fs.writeFileSync(path.join(collaborator, conflict ? "second.md" : "remote.md"), "remote contribution\n");
  git(collaborator, ["add", "."]);
  git(collaborator, ["commit", "-m", "remote contribution"]);
  git(collaborator, ["push", "origin", "main"]);
  const localHub = createLocalHubState({
    root: local,
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: base,
    activeHead: second,
    catalogVersion: "2.0.0",
  });
  const runner = async (request: GitRequest) => {
    try {
      const result = await execute("/usr/bin/git", [...request.args], {
        cwd: request.cwd,
        env: {
          PATH: "/usr/bin:/bin",
          LANG: "C.UTF-8",
          GIT_CONFIG_GLOBAL: "/dev/null",
          GIT_CONFIG_NOSYSTEM: "1",
          GIT_TERMINAL_PROMPT: "0",
        },
        maxBuffer: request.maximumOutputBytes ?? 1024 * 1024,
      });
      return { stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      throw new Error(`${request.operation} failed`, { cause: error });
    }
  };
  return { root, local, base, firstId, secondId, second, localHub, runner };
}

test("[AB-LOCAL-HUB-008][SC-003] clean synchronization recognizes merged proposal and replays the remainder", async () => {
  const current = await fixture(false);
  try {
    const receipt = await synchronizeLocalHub({
      stateRoot: path.join(current.root, "state"),
      localHub: current.localHub,
      token: "local-test-token",
      git: current.runner,
    });
    assert.deepEqual(receipt.recognizedProposalIds, [current.firstId]);
    assert.deepEqual(receipt.remainingProposalIds, [current.secondId]);
    assert.notEqual(receipt.activeHead, current.second);
    assert.equal(git(current.local, ["rev-parse", "main"]), receipt.activeHead);
    assert.match(fs.readFileSync(path.join(current.local, "remote.md"), "utf8"), /remote contribution/);
    assert.match(fs.readFileSync(path.join(current.local, "second.md"), "utf8"), /second proposal/);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-LOCAL-HUB-008][SC-004] conflict retains original main and exact candidate recovery state", async () => {
  const current = await fixture(true);
  const stateRoot = path.join(current.root, "state");
  try {
    await assert.rejects(synchronizeLocalHub({
      stateRoot,
      localHub: current.localHub,
      token: "local-test-token",
      git: current.runner,
    }), /conflict/);
    assert.equal(git(current.local, ["rev-parse", "main"]), current.second);
    const transactions = fs.readdirSync(path.join(stateRoot, "transactions"));
    const transaction = JSON.parse(fs.readFileSync(path.join(stateRoot, "transactions", transactions[0]!, "transaction.json"), "utf8")) as {
      phase: string;
      conflictPaths: readonly string[];
    };
    assert.equal(transaction.phase, "conflict");
    assert.deepEqual(transaction.conflictPaths, ["second.md"]);
    const recovered = await recoverSynchronizationTransaction(
      stateRoot,
      transactions[0]!,
      current.localHub,
      current.runner,
    );
    assert.equal(recovered.outcome, "restored-original");
    assert.equal(git(current.local, ["rev-parse", "main"]), current.second);
    assert.equal(fs.existsSync(path.join(stateRoot, "transactions", transactions[0]!)), false);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-LOCAL-HUB-008][AB-LOCAL-HUB-011] cancellation before fetch creates no transaction or ref mutation", async () => {
  const current = await fixture(false);
  const stateRoot = path.join(current.root, "cancelled-state");
  const controller = new AbortController();
  controller.abort();
  try {
    await assert.rejects(synchronizeLocalHub({
      stateRoot,
      localHub: current.localHub,
      token: "local-test-token",
      git: current.runner,
      signal: controller.signal,
    }), /cancelled/);
    assert.equal(git(current.local, ["rev-parse", "main"]), current.second);
    assert.equal(fs.existsSync(path.join(stateRoot, "transactions")), false);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-LOCAL-HUB-008] recovery is deterministic at prepared, fetched, validated and advanced checkpoints", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-sync-checkpoints-"));
  const hubRoot = path.join(root, "Hub");
  fs.mkdirSync(hubRoot);
  const original = "a".repeat(40), candidate = "b".repeat(40);
  const localHub = createLocalHubState({
    root: hubRoot,
    hub: createHubIdentity("acme/AgentBase-Hub", "main"),
    remoteBase: "c".repeat(40),
    activeHead: original,
    catalogVersion: "2.0.0",
  });
  try {
    for (const phase of ["prepared", "fetched", "validated", "advanced"] as const) {
      const transactionId = `sync-${phase}`;
      const transactionRoot = path.join(root, "state", "transactions", transactionId);
      const candidateRoot = path.join(transactionRoot, "candidate");
      fs.mkdirSync(transactionRoot, { recursive: true });
      fs.writeFileSync(path.join(transactionRoot, "transaction.json"), `${JSON.stringify({
        phase,
        originalHead: original,
        candidateRoot,
        ...(["validated", "advanced"].includes(phase) ? { candidateHead: candidate } : {}),
      })}\n`);
      const calls: GitRequest[] = [];
      const runner = async (request: GitRequest) => {
        calls.push(request);
        const resolved = phase === "advanced" ? candidate : original;
        return { stdout: request.args[0] === "rev-parse" ? `${resolved}\n` : "", stderr: "" };
      };
      const recovered = await recoverSynchronizationTransaction(
        path.join(root, "state"), transactionId, localHub, runner,
      );
      assert.equal(recovered.outcome, phase === "validated"
        ? "advanced-candidate"
        : phase === "advanced" ? "already-advanced" : "restored-original");
      assert.equal(fs.existsSync(transactionRoot), false);
      assert.equal(calls.some((call) => call.args[0] === "update-ref"), phase === "validated");
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
