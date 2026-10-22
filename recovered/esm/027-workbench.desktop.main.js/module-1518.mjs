// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/quickaccess.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { Disposable } from "./module-0012.mjs";
import { getIEditor } from "./module-0223.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";


// src/vs/workbench/browser/quickaccess.ts
var inQuickPickContextKeyValue = "inQuickOpen";

var InQuickPickContextKey = new RawContextKey(inQuickPickContextKeyValue, false, localize(6991, null));

var inQuickPickContext = ContextKeyExpr.has(inQuickPickContextKeyValue);

var defaultQuickAccessContextKeyValue = "inFilesPicker";

var defaultQuickAccessContext = ContextKeyExpr.and(inQuickPickContext, ContextKeyExpr.has(defaultQuickAccessContextKeyValue));

function getQuickNavigateHandler(id2, next) {
  return (accessor) => {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(id2);
    const quickNavigate = { keybindings: keys };
    quickInputService.navigate(!!next, quickNavigate);
  };
}

var PickerEditorState = class extends Disposable {
  // editors that were opened between set and restore
  constructor(editorService, editorGroupsService) {
    super();
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.editorViewState = void 0;
    this.openedTransientEditors = /* @__PURE__ */ new Set();
  }
  set() {
    if (this.editorViewState) {
      return;
    }
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditorPane) {
      this.editorViewState = {
        group: activeEditorPane.group,
        editor: activeEditorPane.input,
        state: getIEditor(activeEditorPane.getControl())?.saveViewState() ?? void 0
      };
    }
  }
  /**
   * Open a transient editor such that it may be closed when the state is restored.
   * Note that, when the state is restored, if the editor is no longer transient, it will not be closed.
   */
  async openTransientEditor(editor, group2) {
    editor.options = { ...editor.options, transient: true };
    const editorPane = await this.editorService.openEditor(editor, group2);
    if (editorPane?.input && editorPane.input !== this.editorViewState?.editor && editorPane.group.isTransient(editorPane.input)) {
      this.openedTransientEditors.add(editorPane.input);
    }
    return editorPane;
  }
  async restore() {
    if (this.editorViewState) {
      for (const editor of this.openedTransientEditors) {
        if (editor.isDirty()) {
          continue;
        }
        for (const group2 of this.editorGroupsService.groups) {
          if (group2.isTransient(editor)) {
            await group2.closeEditor(editor, { preserveFocus: true });
          }
        }
      }
      await this.editorViewState.group.openEditor(this.editorViewState.editor, {
        viewState: this.editorViewState.state,
        preserveFocus: true
        // important to not close the picker as a result
      });
      this.reset();
    }
  }
  reset() {
    this.editorViewState = void 0;
    this.openedTransientEditors.clear();
  }
  dispose() {
    super.dispose();
    this.reset();
  }
};

PickerEditorState = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService)
], PickerEditorState);
export { getQuickNavigateHandler, inQuickPickContextKeyValue, InQuickPickContextKey, inQuickPickContext, defaultQuickAccessContextKeyValue, defaultQuickAccessContext, PickerEditorState };
