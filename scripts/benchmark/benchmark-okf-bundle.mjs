import fs from "node:fs";
import path from "node:path";

import { computeOkfTreeDigest, loadOkfBundle, parseConceptDocument } from "../../src/core/knowledge/index.ts";

export function loadScorableBundle(root) {
  try {
    return loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  } catch (error) {
    const failures = [`OKF conformance failed: ${error instanceof Error ? error.message : "unknown error"}`];
    const concepts = new Map(), files = [];
    const walk = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(absolute);
        else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join("/"));
      }
    };
    walk(root);
    for (const relative of files.filter((file) => file.endsWith(".md")
      && !["index.md", "log.md", "README.md"].includes(path.posix.basename(file)))) {
      try {
        const concept = parseConceptDocument(relative, fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
        concepts.set(concept.conceptId, concept);
      } catch (conceptError) {
        failures.push(`${relative}: ${conceptError instanceof Error ? conceptError.message : "concept could not be parsed"}`);
      }
    }
    return { root, concepts, files, warnings: failures, treeDigest: computeOkfTreeDigest(root) };
  }
}
