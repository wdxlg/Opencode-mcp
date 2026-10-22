// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/customizationLockdown.ts



// src/vs/workbench/contrib/chat/common/customizationLockdown.ts
function isStrictPluginOnlyCustomizationEnabled(value2) {
  return value2 === true;
}

function isPromptTypeBlocked(value2, type) {
  switch (type) {
    case "skill" /* skill */:
    case "agent" /* agent */:
    case "hook" /* hook */:
    case "instructions" /* instructions */:
      return isStrictPluginOnlyCustomizationEnabled(value2);
    default:
      return false;
  }
}
export { isStrictPluginOnlyCustomizationEnabled, isPromptTypeBlocked };
