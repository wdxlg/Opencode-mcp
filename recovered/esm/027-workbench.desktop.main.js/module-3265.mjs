// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/processes.ts



// src/vs/base/common/processes.ts
function sanitizeProcessEnvironment(env2, ...preserve) {
  const set = preserve.reduce((set2, key3) => {
    set2[key3] = true;
    return set2;
  }, {});
  const keysToRemove = [
    /^ELECTRON_.+$/,
    /^VSCODE_(?!(PORTABLE|SHELL_LOGIN|ENV_REPLACE|ENV_APPEND|ENV_PREPEND)).+$/,
    /^SNAP(|_.*)$/,
    /^GDK_PIXBUF_.+$/
  ];
  const envKeys = Object.keys(env2);
  envKeys.filter((key3) => !set[key3]).forEach((envKey) => {
    for (let i2 = 0; i2 < keysToRemove.length; i2++) {
      if (envKey.search(keysToRemove[i2]) !== -1) {
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
  for (const key3 of Object.keys(env2)) {
    if (dangerousEnvVariables.has(key3.toUpperCase())) {
      delete env2[key3];
    }
  }
}
export { sanitizeProcessEnvironment, removeDangerousEnvVariables };
