// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/diffEditorCommandsService.ts
import { createDecorator } from "./module-0077.mjs";
import { isDiffEditor } from "./module-0223.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { URI } from "./module-0032.mjs";
import { TextDiffEditor } from "./module-1534.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ActiveCustomEditorDiffCanToggleLayoutContext } from "./module-0949.mjs";
import { EditorResourceAccessor, isDiffEditorInput } from "./module-0925.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/browser/parts/editor/diffEditorCommandsService.ts
var IDiffEditorCommandsService = createDecorator("diffEditorCommandsService");

var DiffEditorCommandsService = class {
  constructor(editorService, textResourceConfigurationService, contextKeyService) {
    this.editorService = editorService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.contextKeyService = contextKeyService;
  }
  async toggleRenderSideBySide(args2) {
    const modifiedResource = this.getActiveDiffModifiedResource(args2);
    if (!modifiedResource) {
      return;
    }
    const key3 = "diffEditor.renderSideBySide";
    const value2 = this.textResourceConfigurationService.getValue(modifiedResource, key3);
    await this.textResourceConfigurationService.updateValue(modifiedResource, key3, !value2);
  }
  async openActiveDiffSide() {
    const activeEditor = this.editorService.activeEditor;
    const activeTextEditorControl = this.editorService.activeTextEditorControl;
    if (!isDiffEditor(activeTextEditorControl) || !(activeEditor instanceof DiffEditorInput)) {
      return;
    }
    let editor;
    const originalEditor = activeTextEditorControl.getOriginalEditor();
    if (originalEditor.hasTextFocus()) {
      editor = activeEditor.original;
    } else {
      editor = activeEditor.modified;
    }
    await this.editorService.openEditor(editor);
  }
  navigateInDiffEditor(args2, next) {
    const activeTextDiffEditor = this.getActiveTextDiffEditor(args2);
    if (activeTextDiffEditor) {
      activeTextDiffEditor.getControl()?.goToDiff(next ? "next" : "previous");
    }
  }
  focusInDiffEditor(args2, mode) {
    const activeTextDiffEditor = this.getActiveTextDiffEditor(args2);
    if (activeTextDiffEditor) {
      switch (mode) {
        case 0 /* Original */:
          activeTextDiffEditor.getControl()?.getOriginalEditor().focus();
          break;
        case 1 /* Modified */:
          activeTextDiffEditor.getControl()?.getModifiedEditor().focus();
          break;
        case 2 /* Toggle */:
          if (activeTextDiffEditor.getControl()?.getModifiedEditor().hasWidgetFocus()) {
            return this.focusInDiffEditor(args2, 0 /* Original */);
          } else {
            return this.focusInDiffEditor(args2, 1 /* Modified */);
          }
      }
    }
  }
  async toggleDiffIgnoreTrimWhitespace(args2) {
    const activeTextDiffEditor = this.getActiveTextDiffEditor(args2);
    const model = activeTextDiffEditor?.getControl()?.getModifiedEditor()?.getModel();
    if (!model) {
      return;
    }
    const key3 = "diffEditor.ignoreTrimWhitespace";
    const value2 = this.textResourceConfigurationService.getValue(model.uri, key3);
    await this.textResourceConfigurationService.updateValue(model.uri, key3, !value2);
  }
  async swapDiffSides(args2) {
    const diffEditor = this.getActiveTextDiffEditor(args2);
    const activeGroup = diffEditor?.group;
    const diffInput = diffEditor?.input;
    if (!diffEditor || typeof activeGroup === "undefined" || !(diffInput instanceof DiffEditorInput) || !diffInput.modified.resource) {
      return;
    }
    const untypedDiffInput = diffInput.toUntyped({ preserveViewState: activeGroup.id, preserveResource: true });
    if (!untypedDiffInput) {
      return;
    }
    if (diffInput.modified.isModified() && this.editorService.findEditors({ resource: diffInput.modified.resource, typeId: diffInput.modified.typeId, editorId: diffInput.modified.editorId }).length === 0) {
      const editorToOpen = { ...untypedDiffInput.modified };
      if (!editorToOpen.options) {
        editorToOpen.options = {};
      }
      editorToOpen.options.pinned = true;
      editorToOpen.options.inactive = true;
      await this.editorService.openEditor(editorToOpen, activeGroup);
    }
    await this.editorService.replaceEditors([
      {
        editor: diffInput,
        replacement: {
          ...untypedDiffInput,
          original: untypedDiffInput.modified,
          modified: untypedDiffInput.original,
          options: {
            ...untypedDiffInput.options,
            pinned: true
          }
        }
      }
    ], activeGroup);
  }
  getActiveTextDiffEditor(args2) {
    const resource = args2.length > 0 && args2[0] instanceof URI ? args2[0] : void 0;
    for (const editor of [this.editorService.activeEditorPane, ...this.editorService.visibleEditorPanes]) {
      if (editor instanceof TextDiffEditor && (!resource || editor.input instanceof DiffEditorInput && isEqual2(editor.input.primary.resource, resource))) {
        return editor;
      }
    }
    return void 0;
  }
  getActiveDiffModifiedResource(args2) {
    const activeTextDiffEditor = this.getActiveTextDiffEditor(args2);
    const model = activeTextDiffEditor?.getControl()?.getModifiedEditor()?.getModel();
    if (model) {
      return model.uri;
    }
    const resource = args2.length > 0 && args2[0] instanceof URI ? args2[0] : void 0;
    if (ActiveCustomEditorDiffCanToggleLayoutContext.getValue(this.contextKeyService)) {
      const activeCustomDiffModifiedResource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
      if (activeCustomDiffModifiedResource && (!resource || isEqual2(activeCustomDiffModifiedResource, resource))) {
        return activeCustomDiffModifiedResource;
      }
    }
    for (const editor of [this.editorService.activeEditor, ...this.editorService.visibleEditors]) {
      if (isDiffEditorInput(editor) && editor.modified.resource && (!resource || isEqual2(editor.modified.resource, resource))) {
        return editor.modified.resource;
      }
    }
    return void 0;
  }
};

DiffEditorCommandsService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITextResourceConfigurationService),
  __decorateParam(2, IContextKeyService)
], DiffEditorCommandsService);
export { IDiffEditorCommandsService, DiffEditorCommandsService };
