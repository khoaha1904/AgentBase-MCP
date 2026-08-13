export type HubIdentity = Readonly<{ repository: string; targetBranch: string; canonicalHttpsUrl: string }>;
export class HubValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.name = "HubValidationError"; this.code = code; }
}
export function createHubIdentity(repository: string, targetBranch: string): HubIdentity {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || repository.includes(".."))
    throw new HubValidationError("HUB_REPOSITORY_INVALID", "Hub repository must be an exact GitHub owner/name");
  if (!/^(?!\/)(?!.*\.\.)(?!.*\/\/)[A-Za-z0-9._/-]+$/.test(targetBranch))
    throw new HubValidationError("HUB_TARGET_INVALID", "Hub target branch is invalid");
  return { repository, targetBranch, canonicalHttpsUrl: `https://github.com/${repository}.git` };
}
export function assertHubRemote(identity: HubIdentity, remote: string): void {
  if (remote !== identity.canonicalHttpsUrl)
    throw new HubValidationError("HUB_REMOTE_MISMATCH", "effective Hub remote does not match configured identity");
}
