// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/customizationEnablement.ts



// src/vs/platform/agentHost/common/customizationEnablement.ts
var DEFAULT_CUSTOMIZATION_ENABLED = true;

function getCustomizationEnablementDecision(customization) {
  return customization.enablement?.[0];
}

function isCustomizationEnabled(customization) {
  return getCustomizationEnablementDecision(customization)?.enabled ?? DEFAULT_CUSTOMIZATION_ENABLED;
}

function getCustomizationScopeEnablement(customization) {
  const global = customization.enablement?.find((decision) => decision.kind === "global" /* Global */)?.enabled ?? DEFAULT_CUSTOMIZATION_ENABLED;
  const workspace = customization.enablement?.find((decision) => decision.kind === "workspace" /* Workspace */)?.enabled ?? global;
  return {
    global,
    workspace,
    session: isCustomizationEnabled(customization)
  };
}

function getCustomizationDisabledReason(customization, plugin) {
  if (plugin && !isCustomizationEnabled(plugin)) {
    return {
      source: "plugin",
      plugin: {
        id: plugin.id,
        name: plugin.name,
        uri: plugin.uri,
        ...plugin.clientId === void 0 ? void 0 : { clientId: plugin.clientId },
        enablement: plugin.enablement
      }
    };
  }
  const decision = getCustomizationEnablementDecision(customization);
  return decision?.enabled === false ? { source: "scope", scope: decision.kind } : void 0;
}

function customizationEnablementOrder(kind) {
  switch (kind) {
    case "session" /* Session */:
      return 0;
    case "workspace" /* Workspace */:
      return 1;
    case "global" /* Global */:
      return 2;
    default: {
      const exhaustiveKind = kind;
      return exhaustiveKind;
    }
  }
}

function sortCustomizationEnablement(enablement) {
  return enablement.map((decision, index2) => ({ decision, index: index2 })).sort((a, b) => customizationEnablementOrder(a.decision.kind) - customizationEnablementOrder(b.decision.kind) || a.index - b.index).map(({ decision }) => decision);
}

function withCustomizationEnablement(current, kind, entry) {
  const replacement = entry === void 0 ? [] : Array.isArray(entry) ? entry : [entry];
  return sortCustomizationEnablement([
    ...current?.filter((decision) => decision.kind !== kind) ?? [],
    ...replacement
  ]);
}
export { getCustomizationEnablementDecision, isCustomizationEnabled, getCustomizationScopeEnablement, getCustomizationDisabledReason, customizationEnablementOrder, sortCustomizationEnablement, withCustomizationEnablement, DEFAULT_CUSTOMIZATION_ENABLED };
