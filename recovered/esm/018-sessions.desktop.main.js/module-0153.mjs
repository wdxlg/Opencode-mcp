// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/editorCommon.ts



// src/vs/editor/common/editorCommon.ts
function isThemeColor(o) {
  return !!o && typeof o.id === "string";
}

var EditorType = {
  ICodeEditor: "vs.editor.ICodeEditor",
  IDiffEditor: "vs.editor.IDiffEditor"
};
export { isThemeColor, EditorType };
