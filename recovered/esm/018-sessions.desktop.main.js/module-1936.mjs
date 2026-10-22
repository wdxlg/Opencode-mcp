// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webview.contribution.ts
import { IWebviewService } from "./module-1043.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { IEditorService } from "./module-0935.mjs";
import { WebviewInput } from "./module-1117.mjs";
import { RedoCommand, SelectAllCommand, UndoCommand } from "./module-0097.mjs";
import { CopyAction, CutAction, PasteAction } from "./module-0556.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { WebviewFindAccessibilityHelp } from "./module-1935.mjs";


// src/vs/workbench/contrib/webview/browser/webview.contribution.ts
var PRIORITY = 100;

function overrideCommandForWebview(command4, f) {
  command4?.addImplementation(PRIORITY, "webview", (accessor) => {
    const webviewService = accessor.get(IWebviewService);
    const webview = webviewService.activeWebview;
    if (webview?.isFocused) {
      f(webview);
      return true;
    }
    if (getActiveElement()?.classList.contains("action-menu-item")) {
      const editorService = accessor.get(IEditorService);
      if (editorService.activeEditor instanceof WebviewInput) {
        f(editorService.activeEditor.webview);
        return true;
      }
    }
    return false;
  });
}

overrideCommandForWebview(UndoCommand, (webview) => webview.undo());

overrideCommandForWebview(RedoCommand, (webview) => webview.redo());

overrideCommandForWebview(SelectAllCommand, (webview) => webview.selectAll());

overrideCommandForWebview(CopyAction, (webview) => webview.copy());

overrideCommandForWebview(PasteAction, (webview) => webview.paste());

overrideCommandForWebview(CutAction, (webview) => webview.cut());

var PreventDefaultContextMenuItemsContextKeyName = "preventDefaultContextMenuItems";

if (CutAction) {
  MenuRegistry.appendMenuItem(MenuId.WebviewContext, {
    command: {
      id: CutAction.id,
      title: localize(21824, null)
    },
    group: "5_cutcopypaste",
    order: 1,
    when: ContextKeyExpr.not(PreventDefaultContextMenuItemsContextKeyName)
  });
}

if (CopyAction) {
  MenuRegistry.appendMenuItem(MenuId.WebviewContext, {
    command: {
      id: CopyAction.id,
      title: localize(21823, null)
    },
    group: "5_cutcopypaste",
    order: 2,
    when: ContextKeyExpr.not(PreventDefaultContextMenuItemsContextKeyName)
  });
}

if (PasteAction) {
  MenuRegistry.appendMenuItem(MenuId.WebviewContext, {
    command: {
      id: PasteAction.id,
      title: localize(21825, null)
    },
    group: "5_cutcopypaste",
    order: 3,
    when: ContextKeyExpr.not(PreventDefaultContextMenuItemsContextKeyName)
  });
}

AccessibleViewRegistry.register(new WebviewFindAccessibilityHelp());
export { overrideCommandForWebview, PRIORITY, PreventDefaultContextMenuItemsContextKeyName };
