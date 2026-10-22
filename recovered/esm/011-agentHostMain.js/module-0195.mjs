// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/terminal/common/environmentVariableShared.ts



// src/vs/platform/terminal/common/environmentVariableShared.ts
function deserializeEnvironmentVariableCollection(serializedCollection) {
  return new Map(serializedCollection);
}

function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
  return new Map(serializableEnvironmentDescription ?? []);
}

function deserializeEnvironmentVariableCollections(serializedCollection) {
  return new Map(serializedCollection.map((e) => {
    return [e[0], { map: deserializeEnvironmentVariableCollection(e[1]), descriptionMap: deserializeEnvironmentDescriptionMap(e[2]) }];
  }));
}
export { deserializeEnvironmentVariableCollection, deserializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollections };
