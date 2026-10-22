// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/action/common/action.ts



// src/vs/platform/action/common/action.ts
function isLocalizedString(thing) {
  return !!thing && typeof thing === "object" && typeof thing.original === "string" && typeof thing.value === "string";
}

function isICommandActionToggleInfo(thing) {
  return thing ? thing.condition !== void 0 : false;
}
export { isLocalizedString, isICommandActionToggleInfo };
