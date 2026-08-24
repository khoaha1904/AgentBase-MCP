import { createHash } from "node:crypto";

export const HUB_CI_WORKFLOW_PATH = ".github/workflows/agentbase-hub.yml" as const;
export const HUB_CI_VALIDATOR_PATH = ".agentbase/ci/hub-validator.mjs" as const;
export const HUB_CI_MANIFEST_PATH = ".agentbase/ci/manifest.json" as const;
export const HUB_CI_FORMAT_VERSION = 3 as const;
export const HUB_CI_VALIDATOR_VERSION = "0.1.0" as const;

const CHECKOUT_COMMIT = "11d5960a326750d5838078e36cf38b85af677262";
const SETUP_NODE_COMMIT = "49933ea5288caeca8642d1e84afbd3f7d6820020";

export function renderHubCiWorkflow(validatorSha256: string, targetBranch = "main"): string {
  if (!/^sha256:[a-f0-9]{64}$/.test(validatorSha256)) throw new Error("Hub CI validator digest is invalid");
  if (!/^[A-Za-z0-9_][A-Za-z0-9._/-]*$/.test(targetBranch) || targetBranch.includes("..")
    || targetBranch.includes("//") || targetBranch.includes("@{") || targetBranch.endsWith("/")) throw new Error("Hub CI target branch is invalid");
  return `name: AgentBase Hub CI

on:
  pull_request:
  push:
    branches: [${JSON.stringify(targetBranch)}]
  schedule:
    - cron: "17 3 * * 1"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Hub
        uses: actions/checkout@${CHECKOUT_COMMIT}
        with:
          path: hub
          persist-credentials: false
      - name: Use Node.js 24
        uses: actions/setup-node@${SETUP_NODE_COMMIT}
        with:
          node-version: "24.12.0"
      - name: Verify bundled validator
        run: |
          cd hub
          node --input-type=module <<'NODE'
          import { createHash } from "node:crypto";
          import fs from "node:fs";
          const manifest = JSON.parse(fs.readFileSync("${HUB_CI_MANIFEST_PATH}", "utf8"));
          const actual = "sha256:" + createHash("sha256").update(fs.readFileSync(manifest.validator.path)).digest("hex");
          const expected = "${validatorSha256}";
          if (manifest.format !== ${HUB_CI_FORMAT_VERSION} || manifest.validator.path !== "${HUB_CI_VALIDATOR_PATH}"
            || manifest.validator.sha256 !== expected || actual !== expected) throw new Error("bundled Hub validator checksum mismatch");
          NODE
      - name: Validate Hub and report freshness
        run: node hub/${HUB_CI_VALIDATOR_PATH} --root hub --format github >> "$GITHUB_STEP_SUMMARY"
`;
}

export function hubCiBytesDigest(bytes: string | Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function renderHubCiManifest(validator: Readonly<{ version: string; sha256: string }>, targetBranch = "main"): string {
  if (!/^[A-Za-z0-9_][A-Za-z0-9._/-]*$/.test(targetBranch) || targetBranch.includes("..")
    || targetBranch.includes("//") || targetBranch.includes("@{") || targetBranch.endsWith("/")) throw new Error("Hub CI target branch is invalid");
  return `${JSON.stringify({ format: HUB_CI_FORMAT_VERSION, target_branch: targetBranch, validator: {
    path: HUB_CI_VALIDATOR_PATH, version: validator.version, sha256: validator.sha256,
  } }, null, 2)}\n`;
}
