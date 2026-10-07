import fs from "node:fs";
import path from "node:path";

export function findCommand(name, environment = process.env, platform = process.platform) {
  const suffixes = platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const directory of String(environment.PATH ?? environment.Path ?? "").split(path.delimiter).filter(Boolean)) {
    for (const suffix of suffixes) {
      const file = path.resolve(directory, name + suffix);
      try {
        if (!fs.statSync(file).isFile()) continue;
        fs.accessSync(file, platform === "win32" ? fs.constants.R_OK : fs.constants.X_OK);
        return fs.realpathSync(file);
      } catch {}
    }
  }
  throw new Error("Required command is unavailable");
}

export function commandInvocation(file, args, platform = process.platform) {
  if (platform !== "win32" || /\.exe$/i.test(file)) return { command: file, args };
  const bytes = fs.readFileSync(file, "utf8");
  if (/^#!.*\bnode(?:\r?\n|$)/.test(bytes)) return { command: process.execPath, args: [file, ...args] };
  // Standard npm shims expose the adjacent JS entrypoint. Never evaluate .cmd text.
  const scripts = [...new Set([...bytes.matchAll(/"%dp0%[\\/]([^"\r\n]+\.(?:m?js|cjs))"/gi)].map((match) => match[1]))];
  if (scripts.length !== 1) throw new Error("Unsupported Windows command shim; use a native or standard npm client install");
  const script = path.resolve(path.dirname(file), ...scripts[0].split(/[\\/]/));
  if (!fs.statSync(script).isFile()) throw new Error("Windows command entrypoint is unavailable");
  return { command: process.execPath, args: [script, ...args] };
}
