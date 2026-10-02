import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";


import type { SourceSnapshot } from "../../providers/github-hub/index.ts";
import { createInventoryItemId, createQuestionPlanId, createRepositorySourceResource, DiscoveryValidationError,
  validateDiscoverySeed, validateDiscoveryInventory } from "../../core/knowledge/index.ts";
import { DiscoverySession, redactDiscoveryHint } from "./discovery-session.ts";
import { callOkfSchemaTool } from "./okf-schema-tools.ts";
import { callDiscoveryTool } from "./discovery-tool.ts";

function snapshot(root: string): SourceSnapshot {
  return {
    repositoryId: "repository-fixture-aaaaaaaaaaaa",
    remote: { host: "github.example.test", repository: "acme/fixture",
      canonicalHttpsUrl: "https://github.example.test/acme/fixture.git" },
    defaultBranch: "main",
    commit: "a".repeat(40),
    requestedRoot: root,
    analysisRoot: root,
    kind: "current-checkout",
    createdAt: "2026-08-25T00:00:00.000Z",
    privateRoot: path.join(path.dirname(root), "private"),
  };
}

async function captureCensus(root: string, discovery = new DiscoverySession()) {
  discovery.arm(snapshot(root), "new");
  discovery.capture(root);
  assert.ok(discovery.activeSeed);
  return discovery.activeSeed;
}

test("[AB-SCHEMA-062] template evidence and limitations reach the discovery Seed", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-template-census-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "template.template"), `Resources:
  Worker:
    Type: AWS::Lambda::Function
    Condition: Enabled
    Properties: {Runtime: nodejs22.x}
`);
  const seed = await captureCensus(root);
  assert.ok(seed.groups.some((group) => group.sources.some((source) => source.path === "template.template")));
  assert.match(seed.capture.limitations.join(), /conditional resource declarations/);
});

test("[AB-DISC-002][AB-DISC-005] census reports a file cap inside the final directory, not at an exact complete boundary", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-census-cap-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Flat repository\n");
  for (let index = 0; index < 255; index += 1) fs.writeFileSync(path.join(root, `z-${index}.ts`), "export {};\n");
  assert.equal((await captureCensus(root)).capture.truncated, false);
  fs.writeFileSync(path.join(root, "zz-entry.ts"), "const handler = () => 1;\n");
  const seed = await captureCensus(root);
  assert.equal(seed.state, "ready", "a disclosed census bound does not invalidate observed groups");
  assert.equal(seed.capture.truncated, true);
  assert.match(seed.capture.limitations.join("\n"), /entry\/file limit/);
  assert.equal(seed.lanes.find((lane) => lane.lane === "runtime-entrypoint")?.status, "limited");
});

test("[AB-DISC-002][AB-DISC-004] committed generated caches consume no census budget or P0 evidence", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-committed-caches-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const caches = [".terragrunt-cache", ".terraform", ".gradle", ".serverless", "target", "build"];
  for (const cache of caches) {
    fs.mkdirSync(path.join(root, cache));
    const count = cache === ".terragrunt-cache" ? 320 : 1;
    for (let index = 0; index < count; index++) {
      fs.writeFileSync(path.join(root, cache, `${index}.tf`), 'resource "aws_apigatewayv2_route" "cached" {}\n');
    }
  }
  fs.writeFileSync(path.join(root, "README.md"), "# Live worker\n");
  fs.writeFileSync(path.join(root, "main.tf"), 'resource "aws_lambda_function" "live" {}\n');
  fs.writeFileSync(path.join(root, "worker.ts"), "const handler = () => 1;\n");
  execFileSync("git", ["init", "--quiet", "--initial-branch=main"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["-c", "user.name=AgentBase Test", "-c", "user.email=test@agentbase.invalid",
    "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Commit generated cache fixture"], { cwd: root });
  assert.equal(execFileSync("git", ["ls-files", ".terragrunt-cache"], { cwd: root, encoding: "utf8" })
    .trim().split("\n").length, 320);
  const seed = await captureCensus(root);
  assert.equal(seed.capture.census?.eligibleFiles, 3);
  assert.equal(seed.capture.census?.selectedFiles, 3);
  assert.equal(seed.capture.census?.omittedPriorityFiles, 0);
  assert.equal(seed.capture.truncated, false);
  assert.ok(seed.groups.every((group) => group.sources.every((source) => !caches.includes(source.path.split("/")[0]!))));
  assert.ok(seed.groups.some((group) => group.priority === "p0" && group.sources.some((source) => source.path === "main.tf")));
});

test("[AB-DISC-009] Spring and JAX-RS annotations become explicit Java and Kotlin P0 interface evidence", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-web-annotations-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# HTTP service\n");
  const annotations = ["GetMapping", "PostMapping", "PutMapping", "DeleteMapping", "PatchMapping", "RequestMapping",
    "RestController", "Controller", "Path", "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS",
    "org.springframework.web.bind.annotation.GetMapping", "org.springframework.stereotype.Controller",
    "javax.ws.rs.Path", "jakarta.ws.rs.GET"];
  for (const extension of ["java", "kt"]) {
    const file = `Web.${extension}`;
    for (const annotation of annotations) {
      fs.writeFileSync(path.join(root, file), `package example;\n@${annotation}\nclass Web {}\n`);
      const seed = await captureCensus(root);
      const groups = seed.groups.filter((group) => group.lane === "interface-event-trigger");
      assert.equal(groups.length, 1, `${extension}: ${annotation}`);
      assert.equal(groups[0]!.priority, "p0");
      assert.equal(groups[0]!.count, 1);
      assert.deepEqual(groups[0]!.sources, [{ path: file, startLine: 2, endLine: 2 }]);
    }
    fs.rmSync(path.join(root, file));
  }
});

test("[AB-DISC-002][AB-DISC-009] Maven multi-module web controllers survive the standard file budget", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-maven-controllers-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files = {
    "README.md": "# Multi-module web service\n",
    "pom.xml": "<project><modules><module>api</module><module>admin</module></modules></project>\n",
    "api/pom.xml": "<project><artifactId>api</artifactId></project>\n",
    "admin/pom.xml": "<project><artifactId>admin</artifactId></project>\n",
    "api/src/main/java/example/ZOrdersController.java": '@RestController\n@GetMapping("/orders")\nclass ZOrdersController {}\n',
    "api/src/main/java/example/ZOrdersResource.java": '@jakarta.ws.rs.Path("/orders")\n@GET\nclass ZOrdersResource {}\n',
    "admin/src/main/kotlin/example/ZAdminController.kt": '@Controller\n@PostMapping("/admin")\nclass ZAdminController\n',
  };
  for (const [relative, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), text);
  }
  for (let index = 0; index < 300; index++) {
    fs.writeFileSync(path.join(root, `api/src/main/java/example/AHelper${index}.java`), `class AHelper${index} {}\n`);
  }
  const seed = await captureCensus(root);
  assert.equal(seed.capture.census?.eligibleFiles, 307);
  assert.equal(seed.capture.census?.selectedFiles, 256);
  assert.equal(seed.capture.census?.omittedPriorityFiles, 0);
  assert.equal(seed.capture.truncated, true);
  const interfaces = seed.groups.filter((group) => group.lane === "interface-event-trigger");
  assert.equal(interfaces.length, 1);
  assert.equal(interfaces[0]!.priority, "p0");
  assert.equal(interfaces[0]!.count, 6);
  for (const relative of Object.keys(files).filter((file) => /\.(java|kt)$/.test(file))) {
    assert.ok(interfaces[0]!.sources.some((source) => source.path === relative), relative);
  }
  assert.equal((await captureCensus(root)).digest, seed.digest);
});

test("[AB-DISC-010][AB-DISC-006] controller samples take one file per round before repeating locations", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-controller-samples-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Service\n");
  for (const [name, count] of [["AController.java", 4], ["BController.java", 3], ["CController.kt", 2]] as const) {
    fs.writeFileSync(path.join(root, name), Array.from({ length: count }, (_, index) => `@GetMapping("/route-${index}")`).join("\n"));
  }
  const seed = await captureCensus(root);
  const group = seed.groups.find((candidate) => candidate.lane === "interface-event-trigger")!;
  assert.equal(group.count, 9);
  assert.deepEqual(group.sources.map((source) => `${source.path}:${source.startLine}`), [
    "AController.java:1", "BController.java:1", "CController.kt:1",
    "AController.java:2", "BController.java:2", "CController.kt:2", "AController.java:3", "BController.java:3",
  ]);
  assert.match(group.limitations.join(), /samples are bounded/);
  assert.equal((await captureCensus(root)).digest, seed.digest);
});

test("[AB-DISC-010] a document with many signals cannot monopolize group source samples", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-document-samples-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Service\n");
  fs.writeFileSync(path.join(root, "a-guide.md"), Array.from({ length: 12 }, (_, index) => `https://example.test/docs-${index}`).join("\n"));
  for (let index = 0; index < 8; index++) {
    fs.writeFileSync(path.join(root, `z-client-${index}.ts`), `const endpoint = "https://example.test/api-${index}";\n`);
  }
  const seed = await captureCensus(root);
  for (const group of seed.groups.filter((candidate) => candidate.kind === "outbound-integration" || candidate.kind === "flow-candidate")) {
    assert.equal(group.count, 20);
    assert.equal(group.sources.length, 8);
    assert.equal(new Set(group.sources.map((source) => source.path)).size, 8);
    assert.equal(group.sources.filter((source) => source.path === "a-guide.md").length, 1);
    assert.match(group.limitations.join(), /samples are bounded/);
  }
  assert.equal(seed.groups.filter((group) => group.kind === "outbound-integration" || group.kind === "flow-candidate").length, 2);
});

test("[AB-DISC-011] tests and documentation retain context without becoming production runtime or interface P0", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-production-evidence-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const nonProduction = ["README.md", "Guide.md", "docs/Usage.java", "OrdersControllerTest.java",
    "ApplicationTests.java", "worker.test.ts", "worker.spec.ts", "src/test/java/Example.java",
    "__tests__/handler.ts", "src/test/cloud.yaml"];
  for (const relative of nonProduction) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), relative.endsWith(".yaml")
      ? "Resources:\n  Worker:\n    Type: AWS::Lambda::Function\n    Properties: {Handler: worker.main}\n  Api:\n    Type: AWS::ApiGateway::RestApi\n"
      : "@SpringBootApplication\n@RestController\n@GetMapping(\"/demo\")\npublic static void main(String[] args) {}\nconst handler = () => {};\napp.get('/demo');\nhttps://example.test/guide\n");
  }
  const production = {
    "src/main/java/LiveApplication.java": "@SpringBootApplication\nclass LiveApplication {}\n",
    "src/main/java/LiveController.java": "@RestController\nclass LiveController {}\n",
  };
  for (const [relative, text] of Object.entries(production)) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), text);
  }
  const seed = await captureCensus(root);
  const p0 = seed.groups.filter((group) => group.priority === "p0"
    && ["runtime-entrypoint", "interface-event-trigger"].includes(group.lane));
  assert.equal(p0.length, 2);
  assert.ok(p0.every((group) => group.sources.every((source) => Object.hasOwn(production, source.path))));
  assert.ok(seed.groups.some((group) => group.lane === "identity-product" && group.sources.some((source) => source.path === "README.md")));
  assert.ok(seed.groups.some((group) => group.lane === "integration-data-channel" && group.sources.some((source) => source.path === "Guide.md")));
});

test("[AB-DISC-002][AB-DISC-011] Spring Boot and Java main entrypoints survive the standard census budget", async (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-java-entrypoints-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files = {
    "README.md": "# Web service\n",
    "pom.xml": "<project><modules><module>api</module></modules></project>\n",
    "api/pom.xml": "<project><artifactId>api</artifactId></project>\n",
    "api/src/main/java/example/ZApplication.java": "@SpringBootApplication\nclass ZApplication { public static void main(String[] args) {} }\n",
    "api/src/main/java/example/ZMain.java": "class ZMain { public static void main(String... args) {} }\n",
    "api/src/main/kotlin/example/ZApplication.kt": "@org.springframework.boot.autoconfigure.SpringBootApplication\nclass ZApplication\n",
  };
  for (const [relative, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), text);
  }
  for (let index = 0; index < 300; index++) {
    fs.writeFileSync(path.join(root, `api/src/main/java/example/AHelper${index}.java`), `class AHelper${index} {}\n`);
  }
  const seed = await captureCensus(root);
  assert.equal(seed.capture.census?.eligibleFiles, Object.keys(files).length + 300);
  assert.equal(seed.capture.census?.selectedFiles, 256);
  assert.equal(seed.capture.census?.omittedPriorityFiles, 0);
  assert.equal(seed.capture.truncated, true);
  const runtimes = seed.groups.filter((group) => group.lane === "runtime-entrypoint" && group.priority === "p0");
  assert.equal(runtimes.length, 4);
  assert.deepEqual(runtimes.flatMap((group) => group.sources.map((source) => `${source.path}:${source.startLine}`)).sort(), [
    "api/src/main/java/example/ZApplication.java:1", "api/src/main/java/example/ZApplication.java:2",
    "api/src/main/java/example/ZMain.java:1", "api/src/main/kotlin/example/ZApplication.kt:1",
  ].sort());
});

test("[AB-DISC-002..003][AB-INGEST-022..023] prioritizes deployment and expands census once from source", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-priority-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Service\n");
  for (let index = 0; index < 300; index += 1) fs.writeFileSync(path.join(root, `a-${index}.ts`), "export {};\n");
  fs.mkdirSync(path.join(root, "deployment"));
  fs.writeFileSync(path.join(root, "deployment/main.tf"), 'resource "aws_lambda_function" "worker" {}\n');
  fs.writeFileSync(path.join(root, "zz-worker.ts"), 'const handler = () => "work";\n');
  const discovery = new DiscoverySession();
  const seed = await captureCensus(root, discovery);
  assert.equal(seed.capture.census?.selectedFiles, 256);
  assert.equal(seed.capture.census?.eligibleFiles, 303);
  assert.equal(seed.capture.census?.omittedPriorityFiles, 0);
  assert.ok(seed.groups.some((group) => group.sources.some((source) => source.path === "deployment/main.tf")));
  assert.equal(seed.groups.some((group) => group.sources.some((source) => source.path === "zz-worker.ts")), false);
  assert.equal((await captureCensus(root)).digest, seed.digest, "selection is deterministic");
  assert.throws(() => discovery.expand(root, undefined), /confirmation|seed_id/);
  assert.throws(() => discovery.expand(root, { seed_id: seed.id, user_confirmed: false, reason: "Missing worker" }), /user_confirmed/);
  assert.throws(() => discovery.expand(root, { seed_id: "old", user_confirmed: true, reason: "Missing worker" }), /seed_id/);
  assert.throws(() => discovery.expand(root, { seed_id: seed.id, user_confirmed: true, reason: " " }), /reason/);
  discovery.expand(root, { seed_id: seed.id, user_confirmed: true, reason: "Worker entrypoint not examined" });
  const expanded = discovery.activeSeed!;
  assert.equal(expanded.capture.census?.mode, "expanded");
  assert.equal(expanded.capture.census?.selectedFiles, 303);
  assert.equal(expanded.capture.truncated, false);
  assert.notEqual(expanded.id, seed.id);
  assert.ok(expanded.groups.some((group) => group.sources.some((source) => source.path === "zz-worker.ts")));
  assert.throws(() => discovery.expand(root, { seed_id: seed.id, user_confirmed: true, reason: "Again" }), /standard Seed/);
  discovery.clear();
  assert.throws(() => discovery.expand(root, { seed_id: expanded.id, user_confirmed: true, reason: "Again" }), /standard Seed/);
});

test("[AB-INGEST-022] ordinary source keeps a reserved share when priority files exceed the budget", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-reserved-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Service\n");
  for (let index = 0; index < 300; index += 1) fs.writeFileSync(path.join(root, `infra-${index}.tf`), "# infrastructure\n");
  for (let index = 0; index < 100; index += 1) fs.writeFileSync(path.join(root, `source-${index}.ts`), "export {};\n");
  fs.writeFileSync(path.join(root, "source-0.ts"), 'const handler = () => "ordinary source";\n');
  const seed = await captureCensus(root);
  assert.equal(seed.capture.census?.omittedPriorityFiles, 109);
  assert.ok(seed.groups.some((group) => group.sources.some((source) => source.path === "source-0.ts")));
  assert.throws(() => validateDiscoverySeed({ ...seed, capture: { ...seed.capture,
    census: { ...seed.capture.census!, fileLimit: 9999 } } }), /census accounting/);
});

test("[AB-DISC-001][AB-DISC-003] tool binds discovery to the preflight root and expansion consent", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-discovery-tool-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, ".git"));
  fs.writeFileSync(path.join(root, "README.md"), "# Fixture\n");
  for (let index = 0; index < 300; index++) fs.writeFileSync(path.join(root, `source-${index}.ts`), "export {};\n");
  const discovery = new DiscoverySession();
  assert.equal(callDiscoveryTool(discovery, { repo_path: root }).isError, true);
  discovery.arm(snapshot(root), "refresh");
  assert.equal(callDiscoveryTool(discovery, { repo_path: root }).isError, true);
  discovery.arm(snapshot(root), "new");
  assert.equal(callDiscoveryTool(discovery, { repo_path: root, discovery_mode: "expanded" }).isError, true);
  assert.equal(callDiscoveryTool(discovery, { repo_path: root }).isError, undefined);
  const seed = discovery.activeSeed!;
  const confirmation = { seed_id: seed.id, user_confirmed: true, reason: "Missing runtime source" };
  assert.equal(callDiscoveryTool(discovery, { repo_path: root, discovery_mode: "expanded" }).isError, true);
  assert.equal(callDiscoveryTool(discovery, { repo_path: root, discovery_mode: "expanded", discovery_confirmation: confirmation }).isError, undefined);
  assert.equal(discovery.activeSeed!.capture.census?.selectedFiles, 301);
  assert.equal(callDiscoveryTool(discovery, { repo_path: root, discovery_mode: "expanded", discovery_confirmation: confirmation }).isError, true);
});

test("[AB-DISC-002][AB-DISC-005] census discloses entry and oversized-file limits without claiming heuristic absence", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-census-limits-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "go.mod"), "module example.test/service\n");
  fs.writeFileSync(path.join(root, "large.java"), "x".repeat(64 * 1024 + 1));
  fs.writeFileSync(path.join(root, "Application.java"), "@SpringBootApplication\nclass Application { public static void main(String[] args) {} }\n");
  fs.writeFileSync(path.join(root, "Controller.java"), '@RestController\n@RequestMapping("/orders")\nclass Controller {}\n');
  const seed = await captureCensus(root);
  assert.equal(seed.state, "ready");
  assert.equal(seed.groups.some((group) => group.sources.some((source) => source.path === "go.mod")), true);
  assert.match(seed.capture.limitations.join("\n"), /1 admitted source files exceeded/);
  assert.equal(seed.lanes.some((lane) => lane.status === "absent-after-check"), false);
  assert.equal(seed.lanes.find((lane) => lane.lane === "interface-event-trigger")?.status, "covered");
  assert.equal(seed.lanes.find((lane) => lane.lane === "runtime-entrypoint")?.status, "covered");
  assert.match(seed.lanes.find((lane) => lane.lane === "integration-data-channel")?.limitation ?? "", /not detected/);
  for (let index = 0; index < 4096; index += 1) fs.writeFileSync(path.join(root, `z-${index}.txt`), "");
  assert.equal((await captureCensus(root)).capture.truncated, true);
});

test("[AB-DISC-002] runtime evidence stays accountable across files and within one deployment file", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-census-runtimes-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Workers\n");
  for (let index = 0; index < 12; index += 1) {
    const directory = path.join(root, `services/worker-${index}`);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "main.tf"), `resource "aws_lambda_function" "worker_${index}" {}\n`);
  }
  fs.writeFileSync(path.join(root, "main.tf"), 'resource "aws_lambda_function" "first" {}\nresource "aws_lambda_function" "second" {}\n');
  const seed = await captureCensus(root);
  const runtimes = seed.groups.filter((group) => group.lane === "runtime-entrypoint");
  assert.equal(runtimes.length, 14);
  assert.equal(runtimes.every((group) => group.sources.length === 1), true);
  assert.equal(new Set(runtimes.map((group) => `${group.sources[0]!.path}:${group.sources[0]!.startLine}`)).size, 14);
  const inventory = { seedId: seed.id, questionPlans: [], limitations: [],
    items: seed.groups.map((group) => ({ id: createInventoryItemId(seed.id, group.id), originGroupId: group.id,
      outcome: "materialized" as const, outputs: [{ candidateId: "repository" }] })) };
  const request = { candidates: [{ id: "repository", identityHint: "workers", identityBasis: "README",
    queryValue: "worker overview", evidenceIds: ["readme"], disposition: "concept" as const, suggestedType: "Repository" }],
    semanticObservations: [{ id: "readme", candidateId: "repository", role: "documentation" as const,
      signal: "repository overview", source: { path: "README.md", startLine: 1, endLine: 1 } }], resourceObservations: [] };
  const coverage = validateDiscoveryInventory(seed, inventory, request);
  assert.equal(coverage.outcome, "ready-for-review", "separate evidence groups may share one dossier");
  assert.match(coverage.limitations.join("\n"), /group samples are bounded/);
  assert.match(coverage.limitations.join("\n"), /interface-event-trigger: not detected/);
  const missing = validateDiscoveryInventory(seed, { ...inventory,
    items: inventory.items.filter((item) => item.originGroupId !== runtimes[13]!.id) }, request);
  assert.deepEqual(missing.p0Missing, [runtimes[13]!.id]);
  assert.equal(missing.outcome, "incomplete");
  fs.writeFileSync(path.join(root, "overflow.tf"), Array.from({ length: 65 }, (_, index) =>
    `resource "aws_lambda_function" "overflow_${index}" {}`).join("\n"));
  await assert.rejects(captureCensus(root), /exceeds 64 groups/);
});

test("[AB-DISC-006][AB-INGEST-017] armed Init derives a source-only Seed and persists exact Inventory Receipts", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-discovery-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "README.md"), "# Job worker\n\nProcesses queued jobs.\n");
  fs.writeFileSync(path.join(root, "src/handler.ts"), 'const database_url = "postgres://admin:super-secret@db.example.test/app";\nexport async function main() { return "ok"; }\n');
  fs.writeFileSync(path.join(root, "Dockerfile"), "FROM scratch\n");
  fs.writeFileSync(path.join(root, "main.tf"), [
    "resource \"aws_lambda_function\" \"worker\" { handler = \"src/handler.main\" }",
    "resource \"aws_lambda_event_source_mapping\" \"queue\" { event_source_arn = aws_sqs_queue.jobs.arn }",
    "resource \"aws_sqs_queue\" \"jobs\" {}",
  ].join("\n"));
  fs.writeFileSync(path.join(root, ".env"), "DATABASE_URL=https://secret.example.test\n");
  fs.writeFileSync(path.join(root, "credentials.json"), "{\"token\":\"secret\"}\n");

  const discoveryState = path.join(root, "state");
  const discovery = new DiscoverySession(discoveryState);
  discovery.arm(snapshot(root), "new", { hubProfileId: "b".repeat(24), publishedBase: "c".repeat(40) });
  const result = discovery.capture(root);
  assert.equal(result.content.length, 1);
  const seed = discovery.activeSeed;
  assert.equal(seed?.state, "ready");
  assert.deepEqual(seed?.lanes.map((lane) => lane.status), ["covered", "covered", "covered", "covered", "covered"]);
  assert.deepEqual([...new Set(seed?.groups.map((group) => group.priority))].sort(), ["p0", "p1", "p2"]);
  assert.equal(seed?.groups.some((group) => group.priority === "p1" && group.kind === "flow-candidate"), true);
  assert.equal(JSON.stringify(seed).includes("secret.example.test"), false);
  assert.equal(JSON.stringify(seed).includes("super-secret"), false);
  assert.equal(JSON.stringify(seed).includes("credentials.json"), false);
  assert.ok(seed);
  const nestedGroupIndex = seed.groups.findIndex((group) => group.sources.some((source) => source.path.includes("/")));
  assert.notEqual(nestedGroupIndex, -1, "fixture must expose one nested source path");
  const questionIndex = seed.groups.findIndex((_group, index) => index !== nestedGroupIndex);
  const parentIndex = seed.groups.findIndex((_group, index) => index !== nestedGroupIndex && index !== questionIndex);
  const ignoredIndex = seed.groups.findIndex((group, index) => group.priority === "p0"
    && ![nestedGroupIndex, questionIndex, parentIndex].includes(index));
  assert.notEqual(questionIndex, -1, "fixture must expose a separate Question origin group");
  assert.notEqual(parentIndex, -1, "fixture must expose a materialized owner group");
  assert.notEqual(ignoredIndex, -1, "fixture must expose a duplicate-covered P0 group");
  const discoveryCandidates = seed.groups.map((group, index) => ({
    id: `candidate-${index + 1}`, identity_hint: `${group.kind}-${index + 1}`, identity_basis: group.title,
    query_value: group.title,
    ...(index === nestedGroupIndex
      ? { disposition: "embedded", parent_candidate_id: `candidate-${parentIndex + 1}` }
      : { disposition: "concept", suggested_type: "Repository" }),
    evidence_ids: [`evidence-${index + 1}`],
  }));
  const discoveryObservations = seed.groups.map((group, index) => {
    const source = group.sources.find((candidate) => candidate.path.includes("/")) ?? group.sources[0]!;
    return {
    id: `evidence-${index + 1}`, candidate_id: `candidate-${index + 1}`, role: "implementation",
    signal: group.title, source: { path: source.path,
      start_line: source.startLine, end_line: source.endLine },
  };
  });
  const nestedIndex = discoveryObservations.findIndex((observation) => observation.source.path.includes("/"));
  assert.equal(nestedIndex, nestedGroupIndex);
  const inventory = {
    seed_id: seed.id,
    items: seed.groups.map((group, index) => index === questionIndex ? {
      origin_group_id: group.id,
      outcome: "question",
      question: {
        kind: "relation-candidate",
        target_candidate_id: `candidate-${nestedIndex + 1}`,
        property: "dependency",
        scope_key: "repository-runtime",
        candidate_evidence: [{ candidate_key: `candidate-${nestedIndex + 1}`, evidence_id: `evidence-${nestedIndex + 1}` }],
        missing_evidence: ["Confirm the runtime dependency."],
        limitations: [],
      },
    } : index === ignoredIndex ? {
      origin_group_id: group.id,
      outcome: "ignored",
      reason: "duplicate-covered",
      covered_by_origin_group_id: seed.groups[parentIndex]!.id,
    } : {
      origin_group_id: group.id,
      outcome: "materialized",
      candidate_ids: index === nestedIndex
        ? [`candidate-${parentIndex + 1}`, `candidate-${nestedIndex + 1}`]
        : [`candidate-${index + 1}`],
      reason: "harmless Agent explanation is not a correctness field",
    }),
    limitations: [],
  };
  const guidanceRequest = {
    candidates: discoveryCandidates,
    semantic_observations: discoveryObservations,
    resource_observations: [],
  };
  const invalidInventory = structuredClone(inventory);
  const invalidQuestion = invalidInventory.items[questionIndex] as typeof inventory.items[number] & {
    question: { candidate_evidence: Array<{ candidate_key: string; evidence_id: string }> };
  };
  invalidQuestion.question.candidate_evidence[0]!.evidence_id = `evidence-${questionIndex + 1}`;
  const invalidMaterialized = invalidInventory.items[nestedIndex] as typeof inventory.items[number] & { candidate_ids: string[] };
  invalidMaterialized.candidate_ids.push("unknown-candidate");
  const invalidGuidance = await callOkfSchemaTool("get_okf_authoring_schemas", {
    ...guidanceRequest, discovery_inventory: invalidInventory,
  }, { discovery });
  assert.equal(invalidGuidance.isError, true);
  const invalidValue = JSON.parse(invalidGuidance.content[0]?.type === "text" ? invalidGuidance.content[0].text : "{}") as {
    code?: string; retryable?: boolean; recovery?: string;
  };
  assert.equal(invalidValue.code, "INVALID_ARGUMENT");
  assert.equal(invalidValue.retryable, true);
  assert.equal(invalidValue.recovery, "correct-and-retry-same-tool");
  assert.match((invalidValue as { error?: string }).error ?? "", /candidate evidence is invalid/);
  assert.match((invalidValue as { error?: string }).error ?? "", /unknown-candidate mapping is invalid/);

  const invalidP0Inventory = structuredClone(inventory);
  const invalidP0 = invalidP0Inventory.items[ignoredIndex] as typeof inventory.items[number] & { reason: string };
  invalidP0.reason = "duplicate runtime evidence covered by infrastructure";
  const invalidP0Guidance = await callOkfSchemaTool("get_okf_authoring_schemas", {
    ...guidanceRequest, discovery_inventory: invalidP0Inventory,
  }, { discovery });
  assert.equal(invalidP0Guidance.isError, true);
  const invalidP0Value = JSON.parse(invalidP0Guidance.content[0]?.type === "text"
    ? invalidP0Guidance.content[0].text : "{}") as { error?: string };
  assert.match(invalidP0Value.error ?? "", /materialize the same candidate IDs/);
  assert.match(invalidP0Value.error ?? "", /exact reason duplicate-covered/);

  const guidance = await callOkfSchemaTool("get_okf_authoring_schemas", {
    ...guidanceRequest, discovery_inventory: inventory,
  }, { discovery });
  assert.equal(guidance.isError, undefined);
  const guidanceValue = JSON.parse(guidance.content[0]?.type === "text" ? guidance.content[0].text : "{}") as {
    discovery_receipt_id?: string; coverage?: { p0_acknowledged: number };
  };
  assert.match(guidanceValue.discovery_receipt_id ?? "", /^discovery-receipt-[a-f0-9]{24}$/);
  assert.equal(guidanceValue.coverage?.p0_acknowledged, seed.groups.filter((group) => group.priority === "p0").length);
  const receipt = discovery.resolveReceipt(guidanceValue.discovery_receipt_id!);
  assert.ok(receipt);
  assert.deepEqual(receipt.census, seed.capture.census);
  const mixedItem = receipt.inventory.items.find((item) => item.originGroupId === seed.groups[nestedIndex]!.id)!;
  assert.equal(mixedItem.id, createInventoryItemId(seed.id, seed.groups[nestedIndex]!.id));
  assert.deepEqual(mixedItem.outputs, [
    { candidateId: `candidate-${parentIndex + 1}` },
    { candidateId: `candidate-${nestedIndex + 1}`, parentCandidateId: `candidate-${parentIndex + 1}` },
  ]);
  assert.equal(receipt.inventory.items.filter((item) => item.outcome === "materialized"
    && item.outputs.some((output) => output.candidateId === `candidate-${parentIndex + 1}`)).length, 2,
  "multiple discovery groups may materialize one candidate identity");
  assert.equal(receipt.inventory.questionPlans[0]!.id,
    createQuestionPlanId(seed.id, seed.groups[questionIndex]!.id));
  assert.equal(receipt.inventory.items.find((item) => item.originGroupId === seed.groups[ignoredIndex]!.id)?.coveredByItemId,
    createInventoryItemId(seed.id, seed.groups[parentIndex]!.id));
  const evidence = receipt.inventory.questionPlans[0]!.candidateEvidence[0]!;
  const nestedSource = discoveryObservations[nestedIndex]!.source;
  assert.equal(evidence.sourceResource, createRepositorySourceResource(seed.source.repositoryId,
    nestedSource.path, nestedSource.start_line, nestedSource.end_line));
  assert.equal(evidence.observedRevision, seed.source.commit);
  assert.match(evidence.sourceResource, /src\/handler\.ts/);
  assert.doesNotMatch(evidence.sourceResource, /%2F/);
  assert.equal(new DiscoverySession(discoveryState).resolveReceipt(guidanceValue.discovery_receipt_id!)?.id,
    guidanceValue.discovery_receipt_id, "a frozen Receipt survives MCP connection restart");
  const replacement = new DiscoverySession(discoveryState).rebaseReceipt(
    guidanceValue.discovery_receipt_id!, "d".repeat(40), "2026-08-26T00:00:00.000Z");
  assert.notEqual(replacement?.id, guidanceValue.discovery_receipt_id);
  assert.deepEqual(replacement?.census, receipt.census);
  assert.equal(new DiscoverySession(discoveryState).resolveReceipt(replacement!.id)?.publishedBase, "d".repeat(40));

  const unarmed = new DiscoverySession();
  assert.throws(() => unarmed.capture(root), /preflight-armed/);
  const refresh = new DiscoverySession();
  refresh.arm(snapshot(root), "refresh");
  assert.throws(() => refresh.capture(root), /preflight-armed/);
  assert.throws(() => discovery.capture(root), /frozen/);

  assert.throws(() => validateDiscoverySeed({ ...seed,
    groups: Array.from({ length: 65 }, (_value, index) => ({ ...seed.groups[0]!,
      id: `discovery-group-${index.toString(16).padStart(24, "0")}` })) }),
  (error: unknown) => error instanceof DiscoveryValidationError && error.code === "DISCOVERY_OVERFLOW");
});

test("[AB-DISC-004] discovery hint redaction preserves structure without exposing credential values", () => {
  const hint = redactDiscoveryHint('Authorization: Bearer super-secret token https://user:password@example.test/api');
  assert.equal(hint.includes("super-secret"), false);
  assert.equal(hint.includes("password"), false);
  assert.match(hint, /Authorization: Bearer \[REDACTED\]/);
  assert.match(hint, /https:\/\/user:\[REDACTED\]@example\.test/);
});

test("[AB-DISC-005] missing identity is visible and new Seeds contain no graph metadata", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-discovery-empty-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const seed = await captureCensus(root);
  assert.equal(seed.state, "invalid");
  assert.ok(seed.capture.limitations.some((value) => value.includes("identity evidence")));
  assert.equal("nodeCount" in seed.capture, false);
  assert.equal("edgeCount" in seed.capture, false);
  assert.equal("coverageTerminal" in seed.capture, false);
  assert.equal(seed.engine.id, "agentbase-source-census");
});

test("[AB-DISC-005] optional legacy metadata retains strict validation", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-discovery-legacy-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "README.md"), "# Worker\n");
  const seed = await captureCensus(root);
  assert.equal(seed.state, "ready");
  assert.doesNotThrow(() => validateDiscoverySeed({ ...seed, capture: { ...seed.capture,
    nodeCount: 12, edgeCount: 8, coverageTerminal: true } }));
  for (const [field, value] of [["nodeCount", -1], ["edgeCount", 1.5], ["coverageTerminal", "true"]]) {
    const malformed = structuredClone(seed);
    Reflect.set(malformed.capture, field as string, value);
    assert.throws(() => validateDiscoverySeed(malformed), /capture state is invalid/);
  }
  assert.throws(() => validateDiscoverySeed({ ...seed, capture: { ...seed.capture,
    coverageTerminal: false } }), /cannot be ready/);
});
