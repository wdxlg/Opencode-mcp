// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeSettingTarget.ts



// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeSettingTarget.ts
function bridgeSettingWriteTarget(inspected) {
  return isBridgeSettingProjectOverride(inspected) ? 5 /* WORKSPACE */ : 2 /* USER */;
}

function isBridgeSettingProjectOverride(inspected) {
  return inspected?.workspaceValue !== void 0;
}
export { bridgeSettingWriteTarget, isBridgeSettingProjectOverride };
