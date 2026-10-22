// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/common/editorService.ts
import { createDecorator } from "./module-0077.mjs";
import { isEditorGroup } from "./module-0933.mjs";


// src/vs/workbench/services/editor/common/editorService.ts
var IEditorService = createDecorator("editorService");

var ACTIVE_GROUP = -1;

var SIDE_GROUP = -2;

var AUX_WINDOW_GROUP = -3;

var MODAL_GROUP = -4;

var USE_MODAL_EDITOR_SETTING = "workbench.editor.useModal";

function isPreferredGroup(obj) {
  const candidate = obj;
  return typeof obj === "number" || isEditorGroup(candidate);
}
export { isPreferredGroup, IEditorService, ACTIVE_GROUP, SIDE_GROUP, AUX_WINDOW_GROUP, MODAL_GROUP, USE_MODAL_EDITOR_SETTING };
