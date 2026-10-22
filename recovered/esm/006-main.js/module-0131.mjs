// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/processes.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/processes.ts
function sanitizeProcessEnvironment(env2, ...preserve) {
  const set = preserve.reduce((set2, key) => {
    set2[key] = true;
    return set2;
  }, {});
  const keysToRemove = [
    /^ELECTRON_.+$/,
    /^VSCODE_(?!(PORTABLE|SHELL_LOGIN|ENV_REPLACE|ENV_APPEND|ENV_PREPEND)).+$/,
    /^SNAP(|_.*)$/,
    /^GDK_PIXBUF_.+$/
  ];
  const envKeys = Object.keys(env2);
  envKeys.filter((key) => !set[key]).forEach((envKey) => {
    for (let i = 0; i < keysToRemove.length; i++) {
      if (envKey.search(keysToRemove[i]) !== -1) {
        delete env2[envKey];
        break;
      }
    }
  });
}

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

var init_processes = __esm({
  "src/vs/base/common/processes.ts"() {
  }
});
export { sanitizeProcessEnvironment, removeDangerousEnvVariables, init_processes };
