import assert from "node:assert/strict";
import test from "node:test";

import { resolveRepositoryIdentity, type RepositoryIdentityRecord } from "./repository-identity.ts";

const current: RepositoryIdentityRecord = {
  id: "repository-crawler-0123456789ab",
  displayName: "crawler",
  remotes: ["https://github.example/acme/crawler"],
  rootCommits: ["a".repeat(40)],
};

test("[AB-LOCAL-HUB-016] a remote alias reuses the canonical Hub Repository ID", () => {
  const result = resolveRepositoryIdentity({
    displayName: "renamed-crawler",
    remotes: ["https://github.example/acme/crawler"],
    rootCommits: ["a".repeat(40)],
  }, [current]);
  assert.equal(result.kind, "existing");
  if (result.kind === "existing") assert.equal(result.repository.id, current.id);
});

test("[AB-LOCAL-HUB-016] one lineage match survives an organization transfer and records the new alias", () => {
  const result = resolveRepositoryIdentity({
    displayName: "crawler",
    remotes: ["https://github.example/new-org/crawler"],
    rootCommits: ["a".repeat(40)],
  }, [current]);
  assert.equal(result.kind, "existing");
  if (result.kind === "existing") {
    assert.equal(result.repository.id, current.id);
    assert.deepEqual(result.repository.remotes, [
      "https://github.example/acme/crawler", "https://github.example/new-org/crawler",
    ]);
  }
});

test("[AB-LOCAL-HUB-016] shared fork lineage is ambiguous instead of auto-merged", () => {
  const fork = { ...current, id: "repository-crawler-fork-fedcba987654", remotes: ["https://github.example/acme/fork"] };
  const result = resolveRepositoryIdentity({ displayName: "copy", remotes: [], rootCommits: ["a".repeat(40)] }, [current, fork]);
  assert.equal(result.kind, "ambiguous");
});

test("[AB-LOCAL-HUB-016] initial assignment is stable but later resolution is owned by stored aliases", () => {
  const hints = { displayName: "crawler", remotes: ["https://github.example/acme/crawler"], rootCommits: ["a".repeat(40)] };
  const first = resolveRepositoryIdentity(hints, []);
  const second = resolveRepositoryIdentity(hints, []);
  assert.deepEqual(second, first);
  assert.equal(first.kind, "new");
});
