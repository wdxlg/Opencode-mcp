// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/common/sessionConfig.ts



// src/vs/sessions/common/sessionConfig.ts
var DOCK_DETAIL_PANEL_SETTING = "sessions.layout.singlePaneDetailPanel";

function isSessionConfigComplete(config) {
  return (config.schema.required ?? []).every((property) => config.values[property] !== void 0);
}
export { isSessionConfigComplete, DOCK_DETAIL_PANEL_SETTING };
