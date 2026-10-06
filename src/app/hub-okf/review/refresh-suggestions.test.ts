import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildHubRefreshSuggestions } from "./refresh-suggestions.ts";

const OWNER = "repository-producer-aaaaaaaaaaaa", CONSUMER = "repository-consumer-bbbbbbbbbbbb";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

test("[AB-IMPACT-020] inverse Refresh suggestions disclose uncertain names, bounds and existing relations", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-suggestions-"));
  const base = path.join(root, "base"), proposed = path.join(root, "proposed");
  try {
    write(base, "index.md", "---\nokf_version: '0.2'\n---\n# Hub\n");
    write(base, "repositories/producer.md", `---\ntype: Repository\ntitle: Producer\nagentbase:\n  repository:\n    id: ${OWNER}\n    display_name: Producer\n    aliases: { remotes: [], root_commits: [] }\n---\n# Producer\n`);
    const parent = `---\ntype: Function\ntitle: Publisher\nsources:\n  - id: queue\n    resource: repository://${OWNER}/main.tf#L1-L2\n---\n# Publisher\n\n# Embedded Knowledge\n\n| Name | Role | Kind | Technology | Evidence |\n|---|---|---|---|---|\n| Shared queue | Event transport | message-queue | aws / sqs | \x60queue\x60 |\n\n## Exact Evidence\n\n* \x60queue\x60 - \x60repository://${OWNER}/main.tf#L1-L2\x60\n`;
    write(base, "components/publisher.md", parent);
    fs.cpSync(base, proposed, { recursive: true });
    const resource = "---\ntype: Resource\ntitle: SHARED   queue\n---\n# Shared queue\n";
    write(proposed, "resources/shared-queue.md", resource);
    const suggest = () => buildHubRefreshSuggestions(base, proposed, [CONSUMER]);
    const result = suggest();
    assert.equal(result.items.length, 1);
    assert.deepEqual(result, suggest(), "suggestions have stable ordering and content");
    assert.deepEqual({ repository: result.items[0]?.repositoryIdentity, parent: result.items[0]?.parentIdentity,
      resource: result.items[0]?.resourceIdentity, name: result.items[0]?.embeddedItem },
    { repository: "repositories/producer", parent: "components/publisher", resource: "resources/shared-queue", name: "Shared queue" });
    assert.match(result.items[0]!.reason, /Name-only.*verify ownership.*publishes-to\/writes-to/);
    assert.equal(buildHubRefreshSuggestions(base, proposed, [OWNER]).items.length, 0);
    write(proposed, "resources/shared-queue.md", resource.replace("SHARED   queue", "Other queue"));
    assert.equal(suggest().items.length, 0, "unrelated titles do not match");
    write(proposed, "resources/shared-queue.md", resource);
    write(base, "resources/shared-queue.md", resource);
    assert.equal(suggest().items.length, 0, "already Published Resources are not new promotions");
    fs.unlinkSync(path.join(base, "resources/shared-queue.md"));
    for (const kind of ["publishes-to", "writes-to"]) {
      write(proposed, "components/publisher.md", parent.replace("---\n# Publisher", `relationships:\n  - { kind: ${kind}, target: resources/shared-queue, evidence: [queue] }\n---\n# Publisher`)
        + "\n[Shared queue](../resources/shared-queue.md)\n");
      assert.equal(suggest().items.length, 0, "an existing inverse relation needs no suggestion");
    }
    write(proposed, "components/publisher.md", parent);
    for (let index = 1; index <= 17; index += 1) write(base, `components/publisher-${index}.md`, parent);
    assert.equal(suggest().items.length, 16);
    assert.equal(suggest().omitted, 2);
    assert.deepEqual(suggest(), suggest());
    assert.equal(fs.readFileSync(path.join(base, "components/publisher.md"), "utf8"), parent);
    assert.equal(fs.readFileSync(path.join(proposed, "components/publisher.md"), "utf8"), parent);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
