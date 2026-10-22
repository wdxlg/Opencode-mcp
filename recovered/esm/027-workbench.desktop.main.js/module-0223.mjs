// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/editorBrowser.ts
import { EditorType } from "./module-0153.mjs";


// src/vs/editor/browser/editorBrowser.ts
function isCodeEditor(thing) {
  if (thing && typeof thing.getEditorType === "function") {
    return thing.getEditorType() === EditorType.ICodeEditor;
  } else {
    return false;
  }
}

function isDiffEditor(thing) {
  if (thing && typeof thing.getEditorType === "function") {
    return thing.getEditorType() === EditorType.IDiffEditor;
  } else {
    return false;
  }
}

function isCompositeEditor(thing) {
  return !!thing && typeof thing === "object" && typeof thing.onDidChangeActiveEditor === "function";
}

function getCodeEditor(thing) {
  if (isCodeEditor(thing)) {
    return thing;
  }
  if (isDiffEditor(thing)) {
    return thing.getModifiedEditor();
  }
  if (isCompositeEditor(thing) && isCodeEditor(thing.activeCodeEditor)) {
    return thing.activeCodeEditor;
  }
  return null;
}

function getIEditor(thing) {
  if (isCodeEditor(thing) || isDiffEditor(thing)) {
    return thing;
  }
  return null;
}
export { isCodeEditor, isDiffEditor, isCompositeEditor, getCodeEditor, getIEditor };
