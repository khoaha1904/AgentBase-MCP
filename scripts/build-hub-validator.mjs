import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "assets", "hub-ci", "hub-validator.mjs");
const result = await build({
  entryPoints: [path.join(root, "src", "app", "hub-okf", "ci", "standalone.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node24",
  write: false,
  legalComments: "none",
  banner: { js: "import { createRequire as __agentbaseCreateRequire } from 'node:module'; const require = __agentbaseCreateRequire(import.meta.url);" },
});
const bytes = result.outputFiles[0].contents;

if (process.argv.includes("--check")) {
  if (!fs.existsSync(output) || !fs.readFileSync(output).equals(bytes)) {
    process.stderr.write("Hub validator artifact is stale; run npm run build:hub-validator\n");
    process.exitCode = 1;
  }
} else {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, bytes, { mode: 0o755 });
}
