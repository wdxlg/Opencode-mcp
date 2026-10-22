// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/base/common/processes.ts



// src/vs/base/common/processes.ts
function removeDangerousEnvVariables(env2) {
  if (!env2) {
    return;
  }
  const dangerousEnvVariables = /* @__PURE__ */ new Set([
    "DEBUG",
    "NODE_OPTIONS",
    "VSCODE_NODE_OPTIONS",
    "LD_PRELOAD",
    "DYLD_INSERT_LIBRARIES"
  ]);
  for (const key of Object.keys(env2)) {
    if (dangerousEnvVariables.has(key.toUpperCase())) {
      delete env2[key];
    }
  }
}
export { removeDangerousEnvVariables };
