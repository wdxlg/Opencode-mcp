// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/openCodeManagedMcpEnvironment.ts



// src/vs/workbench/api/node/openCodeManagedMcpEnvironment.ts
var WINDOWS_BOOTSTRAP = /* @__PURE__ */ new Set([
  "APPDATA",
  "COMSPEC",
  "HOMEDRIVE",
  "HOMEPATH",
  "LOCALAPPDATA",
  "PATH",
  "PATHEXT",
  "PROCESSOR_ARCHITECTURE",
  "PROGRAMDATA",
  "PROGRAMFILES",
  "PROGRAMFILES(X86)",
  "SYSTEMDRIVE",
  "SYSTEMROOT",
  "TEMP",
  "TMP",
  "USERPROFILE",
  "WINDIR"
]);

var POSIX_BOOTSTRAP = /* @__PURE__ */ new Set([
  "HOME",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LOGNAME",
  "PATH",
  "SHELL",
  "TEMP",
  "TMP",
  "TMPDIR",
  "USER"
]);

function openCodeManagedMcpBaseEnvironment(host, platform3) {
  const selected = /* @__PURE__ */ Object.create(null);
  const allowed = platform3 === "win32" ? WINDOWS_BOOTSTRAP : POSIX_BOOTSTRAP;
  for (const [name, value] of Object.entries(host)) {
    const key = platform3 === "win32" ? name.toUpperCase() : name;
    if (allowed.has(key) && typeof value === "string") {
      selected[key] = value;
    }
  }
  return selected;
}
export { openCodeManagedMcpBaseEnvironment, WINDOWS_BOOTSTRAP, POSIX_BOOTSTRAP };
