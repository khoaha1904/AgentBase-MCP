import assert from "node:assert/strict";
import test from "node:test";

import { checkRepositoryLanguageEntries } from "./check-specs.mjs";

test("[AB-LANG-006] repository language check rejects Vietnamese prose and allows other Unicode", () => {
  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "docs/example.md", source: "English with café and Bézier.\n" },
  ]), []);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "docs/example.md", source: "English first.\nKh\u00f4ng \u0111\u01b0\u1ee3c ghi ti\u1ebfng Vi\u1ec7t.\n" },
  ]), [{
    code: "SPEC-NON-ENGLISH",
    message: "docs/example.md:2 contains Vietnamese text",
  }]);

  assert.deepEqual(checkRepositoryLanguageEntries([
    { relative: "vendor/example.md", source: "Kh\u00f4ng \u0111\u01b0\u1ee3c ghi ti\u1ebfng Vi\u1ec7t.\n" },
  ]), []);
});
