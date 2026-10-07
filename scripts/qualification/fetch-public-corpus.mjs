#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// Operator-only qualification utility. No downloaded code belongs in this repo.
export const PUBLIC_SOURCES = [
  ["gruntwork-io/terragrunt-infrastructure-catalog-example", "07b676c33100702b525488552cef6f30c0139699"],
  ["gruntwork-io/terragrunt-infrastructure-live-stacks-example", "5da4c11ec479b3badc3abf984113f2820b69f31c"],
  ["aws-samples/serverless-patterns", "a6cb0af285a2c326cbc35acd3ee5dc0c659db75d", [
    "lambda-sqs-terraform", "sqs-lambda-s3-terraform-python", "sns-sqs-terraform", "eventbridge-sqs-terraform",
    "s3-sqs-lambda-terraform", "dynamodb-streams-lambda-terraform",
  ]],
  ["spring-petclinic/spring-petclinic-microservices", "1d76b00d683e86b62867a6bf59530f8ab301244f"],
  ["spring-petclinic/spring-petclinic-microservices-config", "323993ce2519c6d02df63e08bf4458d123d3b611"],
  ["sqshq/piggymetrics", "6bb2cf9ddbca980b664d3edbb6ff775d75369278"],
  ["spring-projects/spring-integration-samples", "dd188a81c3897a6a65c4d850676ad6302fb09118"],
  ["spring-cloud/spring-cloud-stream-samples", "2ff1168833cfcab14d2251219dad15a8919c1672"],
];

export function fetchPublicCorpus(destination) {
  const root = path.resolve(destination);
  if (fs.existsSync(root)) throw new Error("Corpus destination must be a new private directory");
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const environment = { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null", GIT_LFS_SKIP_SMUDGE: "1" };
  const git = (cwd, args) => execFileSync("git", ["-c", "credential.helper=", "-c", "core.hooksPath=" + (process.platform === "win32" ? "NUL" : "/dev/null"), ...args],
    { cwd, env: environment, stdio: "pipe", timeout: 180_000, maxBuffer: 1024 * 1024 });
  const sources = [], repos = [];
  for (const [repository, commit, sparse] of PUBLIC_SOURCES) {
    const id = repository.split("/")[1], checkout = path.join(root, "downloads", id);
    fs.mkdirSync(checkout, { recursive: true });
    git(checkout, ["init", "-b", "main"]);
    git(checkout, ["remote", "add", "origin", `https://github.com/${repository}.git`]);
    git(checkout, ["fetch", "--depth=1", ...(sparse ? ["--filter=blob:none"] : []), "origin", commit]);
    if (sparse) { git(checkout, ["sparse-checkout", "init", "--cone"]); git(checkout, ["sparse-checkout", "set", ...sparse]); }
    git(checkout, ["checkout", "--detach", "FETCH_HEAD"]);
    sources.push({ repository, commit });
    if (!sparse) repos.push({ id, path: `downloads/${id}` });
    else for (const part of sparse) {
      const source = path.join(checkout, part);
      if (!fs.existsSync(source)) { sources.at(-1).missing = [...sources.at(-1).missing ?? [], part]; continue; }
      const copy = path.join(root, "repos", part); fs.cpSync(source, copy, { recursive: true, dereference: false });
      git(copy, ["init", "-b", "main"]); git(copy, ["add", "."]);
      git(copy, ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "Pinned public qualification source"]);
      repos.push({ id: part, path: `repos/${part}` });
    }
  }
  fs.writeFileSync(path.join(root, "corpus.json"), `${JSON.stringify({ sources, repos }, null, 2)}\n`, { mode: 0o600 });
  return { sources, repositories: repos.length };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 3) throw new Error("Expected a destination");
    console.log(JSON.stringify(fetchPublicCorpus(process.argv[2])));
  } catch { console.error("Public corpus fetch failed; inspect the disposable directory locally. No source details are printed."); process.exitCode = 1; }
}
