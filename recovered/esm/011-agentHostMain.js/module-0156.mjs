// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostByokLm.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostByokLm.ts
function getByokLmSelectionModelId(model) {
  const vendorPrefix = `${model.vendor}/`;
  return model.modelIdentifier?.startsWith(vendorPrefix) ? model.modelIdentifier.slice(vendorPrefix.length) : model.id;
}

function getByokLmAgentModelId(model) {
  return `${model.vendor}/${getByokLmSelectionModelId(model)}`;
}

function resolveByokLmEnablement(rootConfigValue) {
  const enabled = rootConfigValue === true;
  return {
    enabled,
    trace: `enabled: ${enabled} (root config: ${rootConfigValue ?? "unset"})`
  };
}

var IAgentHostByokLmHandler = createDecorator("agentHostByokLmHandler");
export { getByokLmSelectionModelId, getByokLmAgentModelId, resolveByokLmEnablement, IAgentHostByokLmHandler };
