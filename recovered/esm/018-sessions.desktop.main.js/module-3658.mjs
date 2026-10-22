// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/annotationsUri.ts



// src/vs/platform/agentHost/common/annotationsUri.ts
var ANNOTATIONS_PATH_SEGMENT = "/annotations";

function buildAnnotationsUri(sessionUri) {
  return `${sessionUri}${ANNOTATIONS_PATH_SEGMENT}`;
}
export { buildAnnotationsUri, ANNOTATIONS_PATH_SEGMENT };
