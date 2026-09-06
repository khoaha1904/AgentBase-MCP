import fs from "node:fs";
import path from "node:path";

import type { AnyHubProposal } from "../../../core/hub/index.ts";
import {
  classifyAgentBaseHubProfile,
  loadOkfBundle,
} from "../../../core/knowledge/index.ts";
import {
  profileMigrationDigest,
  verifyRetainedProfileMigration,
  type ProfileMigrationManifest,
  type RetainedProfileMigrationManifest,
} from "../migration/profile-migration.ts";
import { validateHubCi } from "../ci/validation.ts";

export async function admitHubKnowledgeMutation(proposalRoot: string, proposal: AnyHubProposal): Promise<void> {
  const baseRoot = path.join(proposalRoot, "base"), proposedRoot = path.join(proposalRoot, "bundle");
  const base = loadOkfBundle(baseRoot, { requireAgentBaseRootIndex: true });
  const proposed = loadOkfBundle(proposedRoot, { requireAgentBaseRootIndex: true });
  const baseProfile = classifyAgentBaseHubProfile(base), proposedProfile = classifyAgentBaseHubProfile(proposed);
  if (proposal.mode !== "migration") {
    if (baseProfile.kind !== "profile-1.0" || proposedProfile.kind !== "profile-1.0") {
      throw new Error("Hub mutation requires admitted Profile 1.0 at both reviewed base and proposed tree");
    }
    const integrity = await validateHubCi(proposedRoot, () => new Date(0), { requireSupportCi: false });
    if (!integrity.passed) throw new Error(`reviewed Hub mutation failed final integrity admission: ${integrity.errors.join("; ")}`);
    return;
  }
  if (baseProfile.kind !== "legacy-unprofiled" || proposedProfile.kind !== "profile-1.0") {
    throw new Error("Profile migration must transition legacy-unprofiled to admitted Profile 1.0");
  }
  const value = JSON.parse(fs.readFileSync(path.join(proposalRoot, "profile-migration.json"), "utf8")) as RetainedProfileMigrationManifest;
  const { digest, ...manifest } = value;
  if (value.formatVersion !== 1 || value.fromProfile !== "legacy-unprofiled" || value.toProfile !== "profile-1.0"
    || value.rollbackCommit !== proposal.baseCommit || value.baseTreeDigest !== base.treeDigest
    || value.proposedTreeDigest !== proposed.treeDigest || value.sessionId === undefined
    || !Array.isArray(value.moves) || !Array.isArray(value.addedPaths)
    || !Array.isArray(value.updatedPaths) || !Array.isArray(value.removedPaths)
    || digest !== proposal.migrationDigest || digest !== proposal.evidenceDigest
    || profileMigrationDigest(manifest as ProfileMigrationManifest) !== digest) {
    throw new Error("retained Profile migration manifest does not match the reviewed proposal");
  }
  verifyRetainedProfileMigration(baseRoot, proposedRoot, value);
  const integrity = await validateHubCi(proposedRoot, () => new Date(0), { requireSupportCi: false });
  if (!integrity.passed) throw new Error(`reviewed Profile migration failed final integrity admission: ${integrity.errors.join("; ")}`);
}
