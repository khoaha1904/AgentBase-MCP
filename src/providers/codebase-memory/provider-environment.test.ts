import assert from "node:assert/strict";
import test from "node:test";

import { providerProcessEnvironment } from "./provider-environment.ts";

test("[AB-MCP-003][AB-MCP-009][AB-MCP-013] admits fixed system tools without inheriting caller authority", () => {
  assert.deepEqual(providerProcessEnvironment({
    CBM_ALLOWED_ROOT: "/repository", HOME: "/caller/home", LOGNAME: "caller",
    PATH: "/caller/bin", SHELL: "/caller/shell", TERM: "caller-term", USER: "caller",
  }), {
    CBM_ALLOWED_ROOT: "/repository", HOME: "", LOGNAME: "", PATH: "/usr/bin:/bin",
    SHELL: "", TERM: "", USER: "",
  });
});
