// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/editorFeatures.ts



// src/vs/editor/common/editorFeatures.ts
var editorFeatures = [];

function registerEditorFeature(ctor) {
  editorFeatures.push(ctor);
}

function getEditorFeatures() {
  return editorFeatures.slice(0);
}
export { registerEditorFeature, getEditorFeatures, editorFeatures };
