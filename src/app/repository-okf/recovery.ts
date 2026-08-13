import { recoverBundleSwitch, type RecoveryResult } from "../../core/knowledge/index.ts";

export function recoverRepositoryOkf(repositoryRoot: string, owner: string): RecoveryResult {
  return recoverBundleSwitch(repositoryRoot, owner);
}
