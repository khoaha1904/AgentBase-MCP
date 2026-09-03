export type HubIdentity = Readonly<{ host: string; repository: string; targetBranch: string; canonicalHttpsUrl: string }>;
export class HubValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.name = "HubValidationError"; this.code = code; }
}
export function createHubIdentity(repository: string, targetBranch: string, host = "github.com"): HubIdentity {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || repository.includes(".."))
    throw new HubValidationError("HUB_REPOSITORY_INVALID", "Hub repository must be an exact GitHub owner/name");
  if (!/^[A-Za-z0-9_][A-Za-z0-9._/-]*$/.test(targetBranch) || targetBranch.includes("..")
    || targetBranch.includes("//") || targetBranch.includes("@{") || targetBranch.endsWith("/")
    || targetBranch.split("/").some((part) => !part || part.startsWith(".") || part.endsWith(".") || part.endsWith(".lock")))
    throw new HubValidationError("HUB_TARGET_INVALID", "Hub target branch is invalid");
  let admittedHost: string;
  try {
    const url = new URL(`https://${host}`);
    if (url.host !== host.toLowerCase() || url.pathname !== "/" || url.username || url.password || url.search || url.hash) throw new Error();
    admittedHost = url.host;
  } catch { throw new HubValidationError("HUB_HOST_INVALID", "Hub host must be an exact HTTPS GitHub host"); }
  return { host: admittedHost, repository, targetBranch, canonicalHttpsUrl: `https://${admittedHost}/${repository}.git` };
}
export function hubProfileId(identity: HubIdentity): string {
  return createHash("sha256")
    .update(`${identity.host}\0${identity.repository}\0${identity.targetBranch}`)
    .digest("hex")
    .slice(0, 24);
}
export function assertHubRemote(identity: HubIdentity, remote: string): void {
  if (remote !== identity.canonicalHttpsUrl)
    throw new HubValidationError("HUB_REMOTE_MISMATCH", "effective Hub remote does not match configured identity");
}
import { createHash } from "node:crypto";
