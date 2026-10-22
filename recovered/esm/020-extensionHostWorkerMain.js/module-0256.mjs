// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/terminal/common/environmentVariableShared.ts



// src/vs/platform/terminal/common/environmentVariableShared.ts
function serializeEnvironmentVariableCollection(collection) {
  return [...collection.entries()];
}

function serializeEnvironmentDescriptionMap(descriptionMap) {
  return descriptionMap ? [...descriptionMap.entries()] : [];
}
export { serializeEnvironmentVariableCollection, serializeEnvironmentDescriptionMap };
