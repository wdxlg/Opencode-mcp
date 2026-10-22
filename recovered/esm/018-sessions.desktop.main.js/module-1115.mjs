// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/common/customEditor.ts
import { createDecorator } from "./module-0077.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { globMatchesResource, priorityToRank } from "./module-1114.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/workbench/contrib/customEditor/common/customEditor.ts
var ICustomEditorService = createDecorator("customEditorService");

var CONTEXT_ACTIVE_CUSTOM_EDITOR_ID = new RawContextKey("activeCustomEditorId", "", {
  type: "string",
  description: localize(14084, null)
});

var CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE = new RawContextKey("focusedCustomEditorIsEditable", false);

var CustomEditorInfo = class {
  constructor(descriptor) {
    this.id = descriptor.id;
    this.displayName = descriptor.displayName;
    this.providerDisplayName = descriptor.providerDisplayName;
    this.priority = descriptor.priority;
    this.selector = descriptor.selector;
  }
  matches(resource) {
    return this.selector.some((selector) => selector.filenamePattern && globMatchesResource(selector.filenamePattern, resource));
  }
};

var CustomEditorInfoCollection = class {
  constructor(editors) {
    this.allEditors = distinct(editors, (editor) => editor.id);
  }
  get length() {
    return this.allEditors.length;
  }
  /**
   * Find the single default editor to use (if any) by looking at the editor's priority and the
   * other contributed editors.
   */
  get defaultEditor() {
    return this.allEditors.find((editor) => {
      switch (editor.priority.editor) {
        case "default" /* default */:
        case "builtin" /* builtin */:
          return this.allEditors.every((otherEditor) => otherEditor === editor || isLowerPriority(otherEditor, editor));
        default:
          return false;
      }
    });
  }
  /**
   * Find the best available editor to use.
   *
   * Unlike the `defaultEditor`, a bestAvailableEditor can exist even if there are other editors with
   * the same priority.
   */
  get bestAvailableEditor() {
    const editors = Array.from(this.allEditors).sort((a, b) => {
      return priorityToRank(a.priority.editor) - priorityToRank(b.priority.editor);
    });
    return editors[0];
  }
};

function isLowerPriority(otherEditor, editor) {
  return priorityToRank(otherEditor.priority.editor) < priorityToRank(editor.priority.editor);
}
export { isLowerPriority, ICustomEditorService, CONTEXT_ACTIVE_CUSTOM_EDITOR_ID, CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE, CustomEditorInfo, CustomEditorInfoCollection };
