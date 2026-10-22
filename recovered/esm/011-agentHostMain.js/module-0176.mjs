// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/customizationEnablementGate.ts
import { URI } from "./module-0023.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";


// src/vs/platform/agentHost/node/shared/customizationEnablementGate.ts
function targetForPlugin(plugin) {
  return {
    id: plugin.id,
    type: "plugin" /* Plugin */,
    name: plugin.name,
    source: URI.parse(plugin.uri),
    isClientBundled: true
  };
}

function targetForMcpServer(server, owningPluginUri, isClientBundled) {
  return {
    id: server.id,
    type: "mcpServer" /* McpServer */,
    name: server.name,
    source: URI.parse(server.uri),
    isClientBundled,
    ...owningPluginUri ? { owningPluginSource: URI.parse(owningPluginUri) } : {}
  };
}

function isClientBundledMcpServer(childEnablement, serverName) {
  return childEnablement !== void 0 && Object.hasOwn(childEnablement, serverName);
}

function applyResolution(customization, resolution) {
  if (resolution.kind === "pending") {
    return {
      // Publication must not fabricate a scope while the host's durable
      // decision is loading. SDK-boundary consumers use `pending` to fail
      // closed; step 5 republishes when the enablement service settles.
      customization,
      pending: true
    };
  }
  const { enablement: _enablement, ...withoutEnablement } = customization;
  return {
    customization: {
      ...withoutEnablement,
      ...resolution.enablement.length > 0 ? { enablement: [...resolution.enablement] } : {}
    },
    pending: false
  };
}

function applyClientGlobal(service, session, target, enablement) {
  if (enablement?.some((entry) => entry.kind === "global" /* Global */) !== true) {
    return service.resolve(session.toString(), target);
  }
  return service.applyClientGlobalEnablement(session.toString(), target, enablement);
}

function resolveCustomizationEnablement(service, session, customizations, clientChildEnablement, clientPlugins, mcpServerOwners) {
  let pending = false;
  const pendingCustomizationIds = /* @__PURE__ */ new Set();
  const result = customizations.map((customization) => {
    if (customization.type === "mcpServer" /* McpServer */) {
      const owningPluginUri = mcpServerOwners?.get(customization.name);
      const isClientBundled = isClientBundledMcpServer(
        owningPluginUri === void 0 ? void 0 : clientChildEnablement?.get(owningPluginUri),
        customization.name
      );
      const resolved = applyResolution(customization, service.resolve(session.toString(), targetForMcpServer(customization, owningPluginUri, isClientBundled)));
      pending ||= resolved.pending;
      if (resolved.pending) {
        pendingCustomizationIds.add(customization.id);
      }
      return resolved.customization;
    }
    if (customization.type !== "plugin" /* Plugin */) {
      return customization;
    }
    const pluginResolution = applyResolution(customization, applyClientGlobal(service, session, targetForPlugin(customization), clientPlugins?.get(customization.uri)?.enablement));
    pending ||= pluginResolution.pending;
    if (pluginResolution.pending) {
      pendingCustomizationIds.add(customization.id);
    }
    let changed = pluginResolution.customization !== customization;
    const childEnablement = clientChildEnablement?.get(customization.uri);
    const children = pluginResolution.customization.children?.map((child) => {
      if (child.type !== "mcpServer" /* McpServer */) {
        return child;
      }
      const isClientBundled = isClientBundledMcpServer(childEnablement, child.name);
      const resolution = applyClientGlobal(
        service,
        session,
        targetForMcpServer(child, pluginResolution.customization.uri, isClientBundled),
        isClientBundled ? childEnablement[child.name] : void 0
      );
      const resolved = applyResolution(child, resolution);
      pending ||= resolved.pending;
      if (resolved.pending) {
        pendingCustomizationIds.add(customization.id);
        pendingCustomizationIds.add(child.id);
      }
      changed ||= resolved.customization !== child;
      return resolved.customization;
    });
    return changed ? { ...pluginResolution.customization, children } : pluginResolution.customization;
  });
  return { customizations: result, pending, pendingCustomizationIds };
}

function isCustomizationSdkEligible(resolved, customization) {
  return !resolved.pendingCustomizationIds.has(customization.id);
}

function getSdkMcpServerEnablement(resolved) {
  const result = /* @__PURE__ */ new Map();
  for (const customization of resolved.customizations) {
    if (customization.type === "mcpServer" /* McpServer */) {
      result.set(customization.id, isCustomizationSdkEligible(resolved, customization) && isCustomizationEnabled(customization));
      continue;
    }
    const containerEnabled = isCustomizationSdkEligible(resolved, customization) && (customization.type === "directory" /* Directory */ ? customization.enabled : isCustomizationEnabled(customization));
    for (const child of customization.children ?? []) {
      if (child.type === "mcpServer" /* McpServer */) {
        result.set(child.id, containerEnabled && isCustomizationSdkEligible(resolved, child) && isCustomizationEnabled(child));
      }
    }
  }
  return result;
}
export { targetForPlugin, targetForMcpServer, isClientBundledMcpServer, applyResolution, applyClientGlobal, resolveCustomizationEnablement, isCustomizationSdkEligible, getSdkMcpServerEnablement };
