// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/controller/common.ts



// src/vs/editor/contrib/inlineCompletions/browser/controller/common.ts
var _getInlineCompletionsController;

function getInlineCompletionsController(editor) {
  return _getInlineCompletionsController?.(editor) ?? null;
}

function setInlineCompletionsControllerGetter(getter) {
  _getInlineCompletionsController = getter;
}
export { getInlineCompletionsController, setInlineCompletionsControllerGetter, _getInlineCompletionsController };
