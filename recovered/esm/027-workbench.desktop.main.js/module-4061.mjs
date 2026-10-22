// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserDataStorageFeatures.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { BrowserActionCategory, BrowserEditor, BrowserEditorContribution } from "./module-4048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { Codicon } from "./module-0085.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IEditorService } from "./module-0934.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserDataStorageFeatures.ts
var CONTEXT_BROWSER_STORAGE_SCOPE = new RawContextKey("browserStorageScope", "", localize(8006, null));

var BrowserEditorStorageScopeContribution = class extends BrowserEditorContribution {
  constructor(editor, contextKeyService) {
    super(editor);
    this._storageScopeContext = CONTEXT_BROWSER_STORAGE_SCOPE.bindTo(contextKeyService);
  }
  onModelAttached(model, _store) {
    this._storageScopeContext.set(model.storageScope);
  }
  onModelDetached() {
    this._storageScopeContext.reset();
  }
};

BrowserEditorStorageScopeContribution = __decorateClass([
  __decorateParam(1, IContextKeyService)
], BrowserEditorStorageScopeContribution);

BrowserEditor.registerContribution(BrowserEditorStorageScopeContribution);

var ClearGlobalBrowserStorageAction = class _ClearGlobalBrowserStorageAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ClearGlobalStorage;
  }
  constructor() {
    super({
      id: _ClearGlobalBrowserStorageAction.ID,
      title: localize2(7998, "Clear Storage (Global)"),
      category: BrowserActionCategory,
      icon: Codicon.clearAll,
      f1: true,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 20,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "global" /* Global */),
        isHiddenByDefault: true
      }
    });
  }
  async run(accessor) {
    const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
    await browserViewWorkbenchService.clearGlobalStorage();
  }
};

var ClearWorkspaceBrowserStorageAction = class _ClearWorkspaceBrowserStorageAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ClearWorkspaceStorage;
  }
  constructor() {
    super({
      id: _ClearWorkspaceBrowserStorageAction.ID,
      title: localize2(8000, "Clear Storage (Workspace)"),
      category: BrowserActionCategory,
      icon: Codicon.clearAll,
      f1: true,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 20,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "workspace" /* Workspace */),
        isHiddenByDefault: true
      }
    });
  }
  async run(accessor) {
    const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
    await browserViewWorkbenchService.clearWorkspaceStorage();
  }
};

var ClearEphemeralBrowserStorageAction = class _ClearEphemeralBrowserStorageAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ClearEphemeralStorage;
  }
  constructor() {
    super({
      id: _ClearEphemeralBrowserStorageAction.ID,
      title: localize2(7997, "Clear Storage (Ephemeral)"),
      category: BrowserActionCategory,
      icon: Codicon.clearAll,
      f1: true,
      precondition: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "ephemeral" /* Ephemeral */),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 20,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "ephemeral" /* Ephemeral */),
        isHiddenByDefault: true
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.clearStorage();
    }
  }
};

registerAction2(ClearGlobalBrowserStorageAction);

registerAction2(ClearWorkspaceBrowserStorageAction);

registerAction2(ClearEphemeralBrowserStorageAction);

var ClearSecondAccountBrowserStorageAction = class _ClearSecondAccountBrowserStorageAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ClearSecondAccountStorage;
  }
  constructor() {
    super({
      id: _ClearSecondAccountBrowserStorageAction.ID,
      title: localize2(7999, "Clear Storage (Second Account)"),
      category: BrowserActionCategory,
      icon: Codicon.clearAll,
      f1: true,
      precondition: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "secondAccount" /* SecondAccount */),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "4_data" /* Data */,
        order: 20,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, "secondAccount" /* SecondAccount */),
        isHiddenByDefault: true
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.clearStorage();
    }
  }
};

registerAction2(ClearSecondAccountBrowserStorageAction);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.browser.dataStorage": {
      type: "string",
      enum: [
        "default",
        "global" /* Global */,
        "workspace" /* Workspace */,
        "ephemeral" /* Ephemeral */
      ],
      markdownEnumDescriptions: [
        localize(8002, null),
        localize(8004, null),
        localize(8005, null),
        localize(8003, null)
      ],
      restricted: true,
      default: "default",
      markdownDescription: localize(
        8001,
        null
      ),
      scope: 4 /* WINDOW */,
      order: 100
    }
  }
});
export { CONTEXT_BROWSER_STORAGE_SCOPE, BrowserEditorStorageScopeContribution, ClearGlobalBrowserStorageAction, ClearWorkspaceBrowserStorageAction, ClearEphemeralBrowserStorageAction, ClearSecondAccountBrowserStorageAction };
