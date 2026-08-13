import { inspectWorkspace, renderInspection } from "./index.ts";

const result = inspectWorkspace(process.cwd());
process.stdout.write(`${renderInspection(result.root, result.modules)}\n`);
