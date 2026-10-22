// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/editor/common/editor.ts
import { equals } from "./module-0007.mjs";


// src/vs/platform/editor/common/editor.ts
function isResolvedEditorModel(model) {
  const candidate = model;
  return typeof candidate?.resolve === "function" && typeof candidate?.isResolved === "function";
}

function isModalEditorOptionsProvider(obj) {
  return !!obj && typeof obj.getModalEditorOptions === "function";
}

function isTextEditorDiffInformationEqual(uriIdentityService, diff1, diff22) {
  return diff1?.documentVersion === diff22?.documentVersion && uriIdentityService.extUri.isEqual(diff1?.original, diff22?.original) && uriIdentityService.extUri.isEqual(diff1?.modified, diff22?.modified) && equals(diff1?.changes, diff22?.changes, (a, b) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  });
}
export { isResolvedEditorModel, isModalEditorOptionsProvider, isTextEditorDiffInformationEqual };
