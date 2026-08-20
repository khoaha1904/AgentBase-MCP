import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");

test("[AB-MCP-011][AB-MCP-012] Codebase Memory skill is a concise provenance-bearing delegation shim", () => {
  const directory = path.join(root, ".agents", "skills", "use-codebase-memory");
  const skill = fs.readFileSync(path.join(directory, "SKILL.md"), "utf8");
  const metadata = fs.readFileSync(path.join(directory, "agents", "openai.yaml"), "utf8");
  assert.match(skill, /^---\nname: use-codebase-memory\ndescription: .+\n---\n/);
  for (const required of [
    "codebase-memory-mcp@0.10.1", "index_repository", "search_graph",
    "trace_path", "get_code_snippet", "check_index_coverage",
    "persistence:false", "no watcher is implied", "not OKF knowledge",
  ]) assert.equal(skill.includes(required), true, `missing ${required}`);
  assert.doesNotMatch(skill, /delete_project|manage_adr|ingest_traces/);
  assert.equal(skill.split("\n").length < 80, true);
  assert.match(metadata, /default_prompt: "Use \$use-codebase-memory /);
  assert.deepEqual(fs.readdirSync(directory).sort(), ["SKILL.md", "agents"]);
});

test("[AB-SCHEMA-025][AB-CLAIM-004][AB-MVP-023] OKF skill distinguishes instances and states exact authoring vocabularies", () => {
  const directory = path.join(root, ".agents", "skills", "agentbase-okf");
  const skill = fs.readFileSync(path.join(directory, "SKILL.md"), "utf8");
  const references = fs.readdirSync(path.join(directory, "references")).sort();
  const guidance = [skill, ...references.map((file) => fs.readFileSync(path.join(directory, "references", file), "utf8"))].join("\n");
  assert.deepEqual(references, ["concepts.md", "navigation-and-boundaries.md", "uncertainty-and-guidance.md"]);
  for (const file of references) assert.equal(skill.includes(`references/${file}`), true, `SKILL.md does not route ${file}`);
  for (const required of [
    "Concept Schema", "Concept Instance", "`symbol`", "`function`", "`config-field`", "`text`",
    "category indexes MUST NOT have frontmatter",
  ]) assert.equal(guidance.includes(required), true, `missing ${required}`);
  assert.match(guidance, /target\.kind[^\n]+exactly one of/);
  assert.match(guidance, /only the root `index\.md`[^\n]+frontmatter/i);
});
