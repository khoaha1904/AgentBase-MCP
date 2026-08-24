import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  HUB_CI_MANIFEST_PATH,
  HUB_CI_VALIDATOR_PATH,
  HUB_CI_VALIDATOR_VERSION,
  HUB_CI_WORKFLOW_PATH,
  hubCiBytesDigest,
  renderHubCiManifest,
  renderHubCiWorkflow,
} from "./workflow.ts";

export type HubCiBundle = Readonly<{
  digest: string;
  files: Readonly<Record<string, Buffer>>;
}>;

function validatorBytes(): Buffer {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../");
  return fs.readFileSync(path.join(root, "assets", "hub-ci", "hub-validator.mjs"));
}

export function renderHubCiBundle(targetBranch = "main"): HubCiBundle {
  const validator = validatorBytes();
  const validatorDigest = hubCiBytesDigest(validator);
  const files: Readonly<Record<string, Buffer>> = {
    [HUB_CI_WORKFLOW_PATH]: Buffer.from(renderHubCiWorkflow(validatorDigest, targetBranch)),
    [HUB_CI_VALIDATOR_PATH]: validator,
    [HUB_CI_MANIFEST_PATH]: Buffer.from(renderHubCiManifest({
      version: HUB_CI_VALIDATOR_VERSION,
      sha256: validatorDigest,
    }, targetBranch)),
  };
  const digest = hubCiBytesDigest(Buffer.concat(Object.entries(files).flatMap(([name, bytes]) => [
    Buffer.from(`${name}\0${bytes.length}\0`), bytes, Buffer.from("\0"),
  ])));
  return { digest, files };
}
