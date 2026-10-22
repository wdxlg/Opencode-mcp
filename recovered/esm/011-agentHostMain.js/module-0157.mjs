// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/customizationEnablement.ts



// src/vs/platform/agentHost/common/customizationEnablement.ts
var DEFAULT_CUSTOMIZATION_ENABLED = true;

function getCustomizationEnablementDecision(customization) {
  return customization.enablement?.[0];
}

function isCustomizationEnabled(customization) {
  return getCustomizationEnablementDecision(customization)?.enabled ?? DEFAULT_CUSTOMIZATION_ENABLED;
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
  return enablement.map((decision, index) => ({ decision, index })).sort((a, b) => customizationEnablementOrder(a.decision.kind) - customizationEnablementOrder(b.decision.kind) || a.index - b.index).map(({ decision }) => decision);
}

function withCustomizationEnablement(current, kind, entry) {
  const replacement = entry === void 0 ? [] : Array.isArray(entry) ? entry : [entry];
  return sortCustomizationEnablement([
    ...current?.filter((decision) => decision.kind !== kind) ?? [],
    ...replacement
  ]);
}
export { getCustomizationEnablementDecision, isCustomizationEnabled, customizationEnablementOrder, sortCustomizationEnablement, withCustomizationEnablement, DEFAULT_CUSTOMIZATION_ENABLED };
