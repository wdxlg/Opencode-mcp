// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/quickaccess/gotoLineQuickAccess.ts
import { AbstractGotoLineQuickAccessProvider } from "./module-3120.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";


// src/vs/workbench/contrib/codeEditor/browser/quickaccess/gotoLineQuickAccess.ts
var GotoLineQuickAccessProvider = class extends AbstractGotoLineQuickAccessProvider {
  constructor(editorService, configurationService, storageService) {
    super();
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
  }
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview
    };
  }
  get activeTextEditorControl() {
    return this.editorService.activeTextEditorControl;
  }
  gotoLocation(context2, options3) {
    if ((options3.keyMods.alt || this.configuration.openEditorPinned && options3.keyMods.ctrlCmd || options3.forceSideBySide) && this.editorService.activeEditor) {
      context2.restoreViewState?.();
      const editorOptions2 = {
        selection: options3.range,
        pinned: options3.keyMods.ctrlCmd || this.configuration.openEditorPinned,
        preserveFocus: options3.preserveFocus
      };
      this.editorService.openEditor(this.editorService.activeEditor, editorOptions2, SIDE_GROUP);
    } else {
      super.gotoLocation(context2, options3);
    }
  }
};

GotoLineQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], GotoLineQuickAccessProvider);

var GotoLineAction = class _GotoLineAction extends Action2 {
  static {
    this.ID = "workbench.action.gotoLine";
  }
  constructor() {
    super({
      id: _GotoLineAction.ID,
      title: localize2(13812, "Go to Line/Column..."),
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: null,
        primary: 2048 /* CtrlCmd */ | 37 /* KeyG */,
        mac: { primary: 256 /* WinCtrl */ | 37 /* KeyG */ }
      }
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoLineQuickAccessProvider.GO_TO_LINE_PREFIX);
  }
};

registerAction2(GotoLineAction);

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: GotoLineQuickAccessProvider,
  prefix: AbstractGotoLineQuickAccessProvider.GO_TO_LINE_PREFIX,
  placeholder: localize(13814, null),
  helpEntries: [{ description: localize(13813, null), commandId: GotoLineAction.ID }]
});

var GotoOffsetAction = class _GotoOffsetAction extends Action2 {
  static {
    this.ID = "workbench.action.gotoOffset";
  }
  constructor() {
    super({
      id: _GotoOffsetAction.ID,
      title: localize2(13815, "Go to Offset..."),
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoLineQuickAccessProvider.GO_TO_OFFSET_PREFIX);
  }
};

registerAction2(GotoOffsetAction);

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: GotoLineQuickAccessProvider,
  prefix: GotoLineQuickAccessProvider.GO_TO_OFFSET_PREFIX,
  placeholder: localize(13814, null),
  helpEntries: [{ description: localize(13816, null), commandId: GotoOffsetAction.ID }]
});
export { GotoLineQuickAccessProvider, GotoLineAction, GotoOffsetAction };
