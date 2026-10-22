// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/browser/codeEditorService.ts
import { AbstractCodeEditorService } from "./module-1641.mjs";
import { getCodeEditor, isCodeEditor, isCompositeEditor, isDiffEditor } from "./module-0223.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { applyTextEditorOptions } from "./module-1533.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/workbench/services/editor/browser/codeEditorService.ts
var CodeEditorService = class extends AbstractCodeEditorService {
  constructor(editorService, themeService, configurationService) {
    super(themeService);
    this.editorService = editorService;
    this.configurationService = configurationService;
    this._register(this.registerCodeEditorOpenHandler(this.doOpenCodeEditor.bind(this)));
    this._register(this.registerCodeEditorOpenHandler(this.doOpenCodeEditorFromDiff.bind(this)));
  }
  getActiveCodeEditor() {
    const activeTextEditorControl = this.editorService.activeTextEditorControl;
    if (isCodeEditor(activeTextEditorControl)) {
      return activeTextEditorControl;
    }
    if (isDiffEditor(activeTextEditorControl)) {
      return activeTextEditorControl.getModifiedEditor();
    }
    const activeControl = this.editorService.activeEditorPane?.getControl();
    if (isCompositeEditor(activeControl) && isCodeEditor(activeControl.activeCodeEditor)) {
      return activeControl.activeCodeEditor;
    }
    return null;
  }
  async doOpenCodeEditorFromDiff(input, source, sideBySide) {
    const activeTextEditorControl = this.editorService.activeTextEditorControl;
    if (!sideBySide && // we need the current active group to be the target
    isDiffEditor(activeTextEditorControl) && // we only support this for active text diff editors
    input.options && // we need options to apply
    input.resource && // we need a request resource to compare with
    source === activeTextEditorControl.getModifiedEditor() && // we need the source of this request to be the modified side of the diff editor
    activeTextEditorControl.getModel() && // we need a target model to compare with
    isEqual2(input.resource, activeTextEditorControl.getModel()?.modified.uri)) {
      const targetEditor = activeTextEditorControl.getModifiedEditor();
      applyTextEditorOptions(input.options, targetEditor, 0 /* Smooth */);
      return targetEditor;
    }
    return null;
  }
  // Open using our normal editor service
  async doOpenCodeEditor(input, source, sideBySide) {
    const enablePreviewFromCodeNavigation = this.configurationService.getValue().workbench?.editor?.enablePreviewFromCodeNavigation;
    if (!enablePreviewFromCodeNavigation && // we only need to do this if the configuration requires it
    source && // we need to know the origin of the navigation
    !input.options?.pinned && // we only need to look at preview editors that open
    !sideBySide && // we only need to care if editor opens in same group
    !isEqual2(source.getModel()?.uri, input.resource)) {
      for (const visiblePane of this.editorService.visibleEditorPanes) {
        if (getCodeEditor(visiblePane.getControl()) === source) {
          visiblePane.group.pinEditor();
          break;
        }
      }
    }
    const control = await this.editorService.openEditor(input, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
    if (control) {
      const widget = control.getControl();
      if (isCodeEditor(widget)) {
        return widget;
      }
      if (isCompositeEditor(widget) && isCodeEditor(widget.activeCodeEditor)) {
        return widget.activeCodeEditor;
      }
    }
    return null;
  }
};

CodeEditorService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IThemeService),
  __decorateParam(2, IConfigurationService)
], CodeEditorService);

registerSingleton(ICodeEditorService, CodeEditorService, 1 /* Delayed */);
export { CodeEditorService };
