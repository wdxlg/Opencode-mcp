// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserDevToolsFeature.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_HAS_ERROR, CONTEXT_BROWSER_HAS_URL } from "./module-4048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { Codicon } from "./module-0085.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserDevToolsFeature.ts
var CONTEXT_BROWSER_DEVTOOLS_OPEN = new RawContextKey("browserDevToolsOpen", false, localize(8007, null));

var BrowserEditorDevToolsContribution = class extends BrowserEditorContribution {
  constructor(editor, contextKeyService) {
    super(editor);
    this._devToolsOpenContext = CONTEXT_BROWSER_DEVTOOLS_OPEN.bindTo(contextKeyService);
  }
  onModelAttached(model, store) {
    this._devToolsOpenContext.set(model.isDevToolsOpen);
    store.add(model.onDidChangeDevToolsState((e) => {
      this._devToolsOpenContext.set(e.isDevToolsOpen);
    }));
  }
  onModelDetached() {
    this._devToolsOpenContext.reset();
  }
};

BrowserEditorDevToolsContribution = __decorateClass([
  __decorateParam(1, IContextKeyService)
], BrowserEditorDevToolsContribution);

BrowserEditor.registerContribution(BrowserEditorDevToolsContribution);

var ToggleDevToolsAction2 = class _ToggleDevToolsAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ToggleDevTools;
  }
  constructor() {
    super({
      id: _ToggleDevToolsAction.ID,
      title: localize2(8008, "Developer Tools"),
      category: BrowserActionCategory,
      icon: Codicon.developerTools,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      toggled: ContextKeyExpr.equals(CONTEXT_BROWSER_DEVTOOLS_OPEN.key, true),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_tools" /* Tools */,
        order: 2
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 70 /* F12 */
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.model?.toggleDevTools();
    }
  }
};

registerAction2(ToggleDevToolsAction2);
export { CONTEXT_BROWSER_DEVTOOLS_OPEN, BrowserEditorDevToolsContribution, ToggleDevToolsAction2 };
