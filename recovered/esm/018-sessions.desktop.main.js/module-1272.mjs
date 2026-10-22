// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/environmentVariableShared.ts



// src/vs/platform/terminal/common/environmentVariableShared.ts
function serializeEnvironmentVariableCollection(collection) {
  return [...collection.entries()];
}

function serializeEnvironmentDescriptionMap(descriptionMap) {
  return descriptionMap ? [...descriptionMap.entries()] : [];
}

function deserializeEnvironmentVariableCollection(serializedCollection) {
  return new Map(serializedCollection);
}

function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
  return new Map(serializableEnvironmentDescription ?? []);
}

function serializeEnvironmentVariableCollections(collections) {
  return Array.from(collections.entries()).map((e4) => {
    return [e4[0], serializeEnvironmentVariableCollection(e4[1].map), serializeEnvironmentDescriptionMap(e4[1].descriptionMap)];
  });
}

function deserializeEnvironmentVariableCollections(serializedCollection) {
  return new Map(serializedCollection.map((e4) => {
    return [e4[0], { map: deserializeEnvironmentVariableCollection(e4[1]), descriptionMap: deserializeEnvironmentDescriptionMap(e4[2]) }];
  }));
}
export { serializeEnvironmentVariableCollection, serializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollection, deserializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollections, deserializeEnvironmentVariableCollections };
