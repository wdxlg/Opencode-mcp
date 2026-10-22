// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatSelectedModel.ts



// src/vs/workbench/contrib/chat/common/chatSelectedModel.ts
var SELECTED_MODEL_STORAGE_SCOPE = 0 /* PROFILE */;

var SELECTED_MODEL_STORAGE_TARGET = 0 /* USER */;

function isByokModel(metadata) {
  return metadata.isBYOK === true || metadata.byokModelIdentifier !== void 0;
}
export { isByokModel, SELECTED_MODEL_STORAGE_SCOPE, SELECTED_MODEL_STORAGE_TARGET };
