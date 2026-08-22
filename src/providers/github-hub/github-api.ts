import type { HubIdentity } from "../../core/hub/index.ts";

export type GitHubRepository = Readonly<{ fullName: string; defaultBranch: string }>;
export type GitHubRef = Readonly<{ branch: string; commit: string }>;
export type GitHubPullRequest = Readonly<{
  number: number;
  url: string;
  headBranch: string;
  headCommit: string;
  headRepository: string;
  baseBranch: string;
}>;
export type GitHubHttp = typeof fetch;

export class GitHubApiError extends Error {
  readonly code: "HTTP" | "PERMISSION" | "RESPONSE" | "TIMEOUT";
  readonly status?: number;
  constructor(code: GitHubApiError["code"], message: string, status?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.code = code;
    if (status !== undefined) this.status = status;
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new GitHubApiError("RESPONSE", "GitHub returned an invalid object");
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) throw new GitHubApiError("RESPONSE", `GitHub response is missing ${field}`);
  return value;
}

function integer(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new GitHubApiError("RESPONSE", `GitHub response has invalid ${field}`);
  return Number(value);
}

function encodeBranch(branch: string): string {
  return branch.split("/").map(encodeURIComponent).join("/");
}

export class GitHubHubApi {
  readonly #hub: HubIdentity;
  readonly #token: string;
  readonly #http: GitHubHttp;
  readonly #timeoutMs: number;
  readonly #maximumResponseBytes: number;

  constructor(hub: HubIdentity, token: string, http: GitHubHttp = fetch, timeoutMs = 15_000, maximumResponseBytes = 1024 * 1024) {
    if (!token) throw new GitHubApiError("PERMISSION", "dedicated Hub token is missing");
    this.#hub = hub;
    this.#token = token;
    this.#http = http;
    this.#timeoutMs = timeoutMs;
    this.#maximumResponseBytes = maximumResponseBytes;
  }

  async #request(method: "GET" | "POST" | "PATCH", route: string, body?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.#timeoutMs);
    try {
      const response = await this.#http(`https://api.github.com/repos/${this.#hub.repository}${route}`, {
        method,
        redirect: "error",
        signal: controller.signal,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.#token}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        const code = response.status === 401 || response.status === 403 ? "PERMISSION" : "HTTP";
        throw new GitHubApiError(code, `GitHub ${method} request failed with status ${response.status}`, response.status);
      }
      const length = Number(response.headers.get("content-length") ?? "0");
      if (length > this.#maximumResponseBytes) throw new GitHubApiError("RESPONSE", "GitHub response exceeded its byte limit");
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > this.#maximumResponseBytes) throw new GitHubApiError("RESPONSE", "GitHub response exceeded its byte limit");
      try { return JSON.parse(bytes.toString("utf8")) as unknown; }
      catch { throw new GitHubApiError("RESPONSE", "GitHub returned malformed JSON"); }
    } catch (error) {
      if (error instanceof GitHubApiError) throw error;
      if (controller.signal.aborted) throw new GitHubApiError("TIMEOUT", "GitHub request timed out");
      throw new GitHubApiError("HTTP", "GitHub request failed");
    } finally { clearTimeout(timer); }
  }

  async getRepository(): Promise<GitHubRepository> {
    const value = object(await this.#request("GET", ""));
    const fullName = text(value.full_name, "full_name");
    if (fullName !== this.#hub.repository) throw new GitHubApiError("RESPONSE", "GitHub repository identity mismatch");
    return { fullName, defaultBranch: text(value.default_branch, "default_branch") };
  }

  async getBranchRef(branch: string): Promise<GitHubRef> {
    const value = object(await this.#request("GET", `/git/ref/heads/${encodeBranch(branch)}`));
    const commit = text(object(value.object).sha, "object.sha");
    if (!/^[a-f0-9]{40}$/.test(commit)) throw new GitHubApiError("RESPONSE", "GitHub ref commit is invalid");
    return { branch, commit };
  }

  async findBranchRef(branch: string): Promise<GitHubRef | undefined> {
    try { return await this.getBranchRef(branch); }
    catch (error) {
      if (error instanceof GitHubApiError && error.code === "HTTP" && error.status === 404) return undefined;
      throw error;
    }
  }

  async listOpenPullRequests(
    headBranch: string,
    baseBranch = this.#hub.targetBranch,
  ): Promise<readonly GitHubPullRequest[]> {
    return this.listPullRequests(headBranch, baseBranch, "open");
  }

  async listPullRequests(
    headBranch: string,
    baseBranch = this.#hub.targetBranch,
    state: "open" | "all" = "open",
  ): Promise<readonly GitHubPullRequest[]> {
    const owner = this.#hub.repository.split("/")[0] ?? "";
    const query = new URLSearchParams({ state, head: `${owner}:${headBranch}`, base: baseBranch });
    const values = await this.#request("GET", `/pulls?${query.toString()}`);
    if (!Array.isArray(values)) throw new GitHubApiError("RESPONSE", "GitHub pulls response is invalid");
    return values.map((value) => this.#pullRequest(value, headBranch, undefined, baseBranch));
  }

  async listPullRequestsForHead(
    headBranch: string,
    state: "open" | "all" = "open",
  ): Promise<readonly GitHubPullRequest[]> {
    const owner = this.#hub.repository.split("/")[0] ?? "";
    const query = new URLSearchParams({ state, head: `${owner}:${headBranch}` });
    const values = await this.#request("GET", `/pulls?${query.toString()}`);
    if (!Array.isArray(values)) throw new GitHubApiError("RESPONSE", "GitHub pulls response is invalid");
    return values.map((value) => this.#pullRequest(value, headBranch));
  }

  async createPullRequest(
    headBranch: string,
    headCommit: string,
    title: string,
    body: string,
    baseBranch = this.#hub.targetBranch,
  ): Promise<GitHubPullRequest> {
    const value = await this.#request("POST", "/pulls", { title, body, head: headBranch, base: baseBranch });
    return this.#pullRequest(value, headBranch, headCommit, baseBranch);
  }

  async updatePullRequestBase(
    number: number,
    headBranch: string,
    headCommit: string,
    baseBranch: string,
  ): Promise<GitHubPullRequest> {
    if (!Number.isSafeInteger(number) || number < 1) throw new GitHubApiError("RESPONSE", "pull request number is invalid");
    const value = await this.#request("PATCH", `/pulls/${number}`, { base: baseBranch });
    return this.#pullRequest(value, headBranch, headCommit, baseBranch);
  }

  #pullRequest(value: unknown, expectedHead: string, expectedCommit?: string, expectedBase?: string): GitHubPullRequest {
    const pull = object(value), head = object(pull.head), base = object(pull.base);
    const headBranch = text(head.ref, "head.ref"), headCommit = text(head.sha, "head.sha");
    const headRepository = text(object(head.repo).full_name, "head.repo.full_name");
    const baseBranch = text(base.ref, "base.ref");
    if (headRepository !== this.#hub.repository || headBranch !== expectedHead
      || (expectedCommit && headCommit !== expectedCommit) || (expectedBase && baseBranch !== expectedBase)) {
      throw new GitHubApiError("RESPONSE", "GitHub pull request identity mismatch");
    }
    const number = integer(pull.number, "number");
    const url = text(pull.html_url, "html_url");
    if (url !== `https://github.com/${this.#hub.repository}/pull/${number}`) {
      throw new GitHubApiError("RESPONSE", "GitHub pull request URL mismatch");
    }
    return { number, url, headBranch, headCommit, headRepository, baseBranch };
  }
}
