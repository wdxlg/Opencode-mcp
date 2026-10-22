// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/tunnelGatewaySelection.ts
import { hasKey } from "./module-0010.mjs";
import { promptRemoteAgentHostLocationPreference } from "./module-3559.mjs";


// src/vs/platform/agentHost/common/tunnelGatewaySelection.ts
function sortedGatewayEndpoints(inventory, type) {
  return inventory.endpoints.filter((endpoint) => endpoint.type === type).sort((a, b) => a.instanceId.localeCompare(b.instanceId));
}

function selectEditorGatewayEndpoint(inventory) {
  return sortedGatewayEndpoints(inventory, "editor")[0];
}

function selectDedicatedGatewayFallback(inventory) {
  const standalone2 = sortedGatewayEndpoints(inventory, "standalone")[0];
  return standalone2 ? { instanceId: standalone2.instanceId } : { newDedicated: true };
}

function selectGatewayFallbackAfterRejection(rejected, inventory) {
  if (inventory.delegatedInstanceId) {
    return { instanceId: inventory.delegatedInstanceId };
  }
  if (!hasKey(rejected, { instanceId: true })) {
    return void 0;
  }
  const standalone2 = sortedGatewayEndpoints(inventory, "standalone").find((endpoint) => endpoint.instanceId !== rejected.instanceId);
  return standalone2 ? { instanceId: standalone2.instanceId } : { newDedicated: true };
}

async function resolveGatewaySelection(locationPreferenceService, dialogService, request2) {
  const { hostKey, hostLabel, productName, inventory, userInitiated } = request2;
  const preference = locationPreferenceService.getPreference(hostKey);
  if (inventory.delegatedInstanceId) {
    if (!preference && userInitiated) {
      locationPreferenceService.setPreference(hostKey, "editor");
    }
    return { instanceId: inventory.delegatedInstanceId };
  }
  const editor = selectEditorGatewayEndpoint(inventory);
  if (preference === "editor") {
    return editor ? { instanceId: editor.instanceId } : selectDedicatedGatewayFallback(inventory);
  }
  if (preference === "dedicated") {
    return selectDedicatedGatewayFallback(inventory);
  }
  if (!editor) {
    if (userInitiated) {
      locationPreferenceService.setPreference(hostKey, "dedicated");
    }
    return selectDedicatedGatewayFallback(inventory);
  }
  if (!userInitiated) {
    return void 0;
  }
  const chosen = await promptRemoteAgentHostLocationPreference(dialogService, hostLabel, productName);
  if (!chosen) {
    return void 0;
  }
  locationPreferenceService.setPreference(hostKey, chosen);
  return chosen === "editor" ? { instanceId: editor.instanceId } : selectDedicatedGatewayFallback(inventory);
}

function shouldNotifyTunnelFailover(previousServerType, newServerType, userInitiated, editorFallback = false) {
  if (editorFallback) {
    return newServerType === "standalone" && previousServerType !== "standalone";
  }
  return !userInitiated && previousServerType === "editor" && newServerType === "standalone";
}

var TunnelFailoverTracker = class {
  constructor() {
    this._lastSelectedServerType = /* @__PURE__ */ new Map();
  }
  /**
   * Record a successful registration for `address` and report whether it
   * should trigger a failover notification. Always updates the retained
   * metadata, regardless of the returned value.
   */
  recordAndShouldNotify(address, newServerType, userInitiated, editorFallback = false) {
    const previousServerType = this._lastSelectedServerType.get(address);
    const notify = shouldNotifyTunnelFailover(previousServerType, newServerType, userInitiated, editorFallback);
    this._lastSelectedServerType.set(address, newServerType);
    return notify;
  }
};
export { sortedGatewayEndpoints, selectEditorGatewayEndpoint, selectDedicatedGatewayFallback, selectGatewayFallbackAfterRejection, resolveGatewaySelection, shouldNotifyTunnelFailover, TunnelFailoverTracker };
