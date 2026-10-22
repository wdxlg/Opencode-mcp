// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/codexSessionConfigKeys.ts



// src/vs/platform/agentHost/common/codexSessionConfigKeys.ts
function narrowCodexPermissionsPreset(raw) {
  switch (raw) {
    case "default":
    case "auto-review":
    case "full-access":
      return raw;
    default:
      return void 0;
  }
}
export { narrowCodexPermissionsPreset };
