#!/usr/bin/env node
import process from "node:process";

import { createHubIdentity, hubProfileId } from "../../src/core/hub/identity.ts";
import { writeHubProfileToken } from "../../src/app/hub-okf/configuration/credential-file.ts";
import { normalizeGitHubHubUrl } from "../../src/app/hub-okf/workspace/setup.ts";

function argument(name) {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`${name} is required`);
  return value;
}

async function maskedPrompt() {
  if (!process.stdin.isTTY || !process.stderr.isTTY) throw new Error("token configuration requires an interactive terminal");
  process.stderr.write("GitHub token (input hidden): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let token = "";
  try {
    for await (const chunk of process.stdin) {
      for (const byte of chunk) {
        if (byte === 3) throw new Error("token configuration cancelled");
        if (byte === 13 || byte === 10) return token;
        if (byte === 127 || byte === 8) token = token.slice(0, -1);
        else if (byte >= 32 && byte <= 126) token += String.fromCharCode(byte);
      }
    }
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stderr.write("\n");
  }
  return token;
}

try {
  const normalized = normalizeGitHubHubUrl(argument("--repository-url"));
  const identity = createHubIdentity(normalized.repository, argument("--target-branch"), normalized.host);
  const result = writeHubProfileToken(hubProfileId(identity), await maskedPrompt(), process.env, { replace: true });
  process.stdout.write(`Hub profile credential ${result}. You may now run configure_hub.\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "token configuration failed"}\n`);
  process.exitCode = 1;
}
