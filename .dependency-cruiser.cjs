/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  extends: "dependency-cruiser/configs/recommended",
  forbidden: [
    {
      name: "no-orphans",
      severity: "ignore",
      from: { orphan: true },
      to: {},
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      to: {
        couldNotResolve: true,
        pathNot: "^@modelcontextprotocol/(?:client|server)/stdio$",
      },
    },
    {
      name: "core-must-not-import-upper-layers",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/(?:providers|app)/" },
    },
    {
      name: "providers-must-not-import-app",
      severity: "error",
      from: { path: "^src/providers/" },
      to: { path: "^src/app/" },
    },
    {
      name: "cross-capability-private-import",
      severity: "error",
      from: { path: "^src/(core|providers|app)/([^/]+)/" },
      to: {
        path: "^src/(?:core|providers|app)/[^/]+/(?!index[.]ts$)",
        pathNot: "^src/$1/$2/",
      },
    },
    {
      name: "composition-root-must-use-public-entrypoints",
      severity: "error",
      from: { path: "^src/cli[.]ts$" },
      to: { path: "^src/(?:core|providers|app)/[^/]+/(?!index[.]ts$)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^(?:dist|node_modules)/|^src/app/hub-okf/visualization/domain-site-assets/" },
  },
};
