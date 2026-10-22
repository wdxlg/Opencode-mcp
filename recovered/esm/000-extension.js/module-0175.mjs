// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/model-provider-identifiers.mts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/model-provider-identifiers.mts
init_define_OPENCODE_BUILD_INFO();

var MODEL_ID_SEPARATOR = "::";

function encodedModelId(namespace, rawModelId) {
  return `${namespace.replaceAll(MODEL_ID_SEPARATOR, "-")}${MODEL_ID_SEPARATOR}${encodeURIComponent(rawModelId)}`;
}

function normalizeProviderModelId(modelId, vendorId) {
  let id = modelId;
  const vendorPrefix = `${vendorId}/`;
  if (id.startsWith(vendorPrefix)) {
    id = id.slice(vendorPrefix.length);
  }
  const slash = id.indexOf("/");
  if (slash > 0) {
    const rest = id.slice(slash + 1);
    if (rest.includes(MODEL_ID_SEPARATOR)) {
      id = rest;
    }
  }
  return id;
}

function deleteRuntimeModelsForNamespace(runtimeModels, namespace) {
  const prefix = encodedModelId(namespace, "");
  for (const id of [...runtimeModels.keys()]) {
    if (id.startsWith(prefix)) runtimeModels.delete(id);
  }
}
export { encodedModelId, normalizeProviderModelId, deleteRuntimeModelsForNamespace, MODEL_ID_SEPARATOR };
