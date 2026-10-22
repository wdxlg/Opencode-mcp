// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewPanel/browser/webviewCommands.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { WebviewEditor } from "./module-1119.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IWebviewService, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE } from "./module-1042.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0934.mjs";
import { WebviewInput } from "./module-1116.mjs";


// src/vs/workbench/contrib/webviewPanel/browser/webviewCommands.ts
var webviewActiveContextKeyExpr = ContextKeyExpr.and(
  ContextKeyExpr.equals("activeEditor", WebviewEditor.ID),
  EditorContextKeys.focus.toNegated()
  /* https://github.com/microsoft/vscode/issues/58668 */
);

var ShowWebViewEditorFindWidgetAction = class _ShowWebViewEditorFindWidgetAction extends Action2 {
  static {
    this.ID = "editor.action.webvieweditor.showFind";
  }
  static {
    this.LABEL = localize(21863, null);
  }
  constructor() {
    super({
      id: _ShowWebViewEditorFindWidgetAction.ID,
      title: _ShowWebViewEditorFindWidgetAction.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED),
        primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.showFind();
  }
};

var HideWebViewEditorFindCommand = class _HideWebViewEditorFindCommand extends Action2 {
  static {
    this.ID = "editor.action.webvieweditor.hideFind";
  }
  static {
    this.LABEL = localize(21862, null);
  }
  constructor() {
    super({
      id: _HideWebViewEditorFindCommand.ID,
      title: _HideWebViewEditorFindCommand.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE),
        primary: 9 /* Escape */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.hideFind();
  }
};

var WebViewEditorFindNextCommand = class _WebViewEditorFindNextCommand extends Action2 {
  static {
    this.ID = "editor.action.webvieweditor.findNext";
  }
  static {
    this.LABEL = localize(21860, null);
  }
  constructor() {
    super({
      id: _WebViewEditorFindNextCommand.ID,
      title: _WebViewEditorFindNextCommand.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.runFindAction(false);
  }
};

var WebViewEditorFindPreviousCommand = class _WebViewEditorFindPreviousCommand extends Action2 {
  static {
    this.ID = "editor.action.webvieweditor.findPrevious";
  }
  static {
    this.LABEL = localize(21861, null);
  }
  constructor() {
    super({
      id: _WebViewEditorFindPreviousCommand.ID,
      title: _WebViewEditorFindPreviousCommand.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(webviewActiveContextKeyExpr, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
        primary: 1024 /* Shift */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.runFindAction(true);
  }
};

var ReloadWebviewAction = class _ReloadWebviewAction extends Action2 {
  static {
    this.ID = "workbench.action.webview.reloadWebviewAction";
  }
  static {
    this.LABEL = localize2(21864, "Reload Webviews");
  }
  constructor() {
    super({
      id: _ReloadWebviewAction.ID,
      title: _ReloadWebviewAction.LABEL,
      category: Categories.Developer,
      menu: [{
        id: MenuId.CommandPalette
      }]
    });
  }
  async run(accessor) {
    const webviewService = accessor.get(IWebviewService);
    for (const webview of webviewService.webviews) {
      webview.reload();
    }
  }
};

function getActiveWebviewEditor(accessor) {
  const editorService = accessor.get(IEditorService);
  const activeEditor = editorService.activeEditor;
  return activeEditor instanceof WebviewInput ? activeEditor.webview : void 0;
}
export { getActiveWebviewEditor, webviewActiveContextKeyExpr, ShowWebViewEditorFindWidgetAction, HideWebViewEditorFindCommand, WebViewEditorFindNextCommand, WebViewEditorFindPreviousCommand, ReloadWebviewAction };
