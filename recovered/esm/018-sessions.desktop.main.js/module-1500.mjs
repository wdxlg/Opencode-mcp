// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/textInputActions.ts
import { Separator, toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { EventHelper, addDisposableListener, getActiveDocument, getWindow, isHTMLInputElement, isHTMLTextAreaElement } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { Event2 } from "./module-0017.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/browser/actions/textInputActions.ts
function createTextInputActions(clipboardService, logService) {
  return [
    toAction({ id: "undo", label: localize(6132, null), run: () => getActiveDocument().execCommand("undo") }),
    toAction({ id: "redo", label: localize(6130, null), run: () => getActiveDocument().execCommand("redo") }),
    new Separator(),
    toAction({
      id: "editor.action.clipboardCutAction",
      label: localize(6128, null),
      run: () => {
        logService.trace("TextInputActionsProvider#cut");
        getActiveDocument().execCommand("cut");
      }
    }),
    toAction({
      id: "editor.action.clipboardCopyAction",
      label: localize(6127, null),
      run: () => {
        logService.trace("TextInputActionsProvider#copy");
        getActiveDocument().execCommand("copy");
      }
    }),
    toAction({
      id: "editor.action.clipboardPasteAction",
      label: localize(6129, null),
      run: async (element) => {
        logService.trace("TextInputActionsProvider#paste");
        const clipboardText = await clipboardService.readText();
        if (isHTMLTextAreaElement(element) || isHTMLInputElement(element)) {
          const selectionStart = element.selectionStart || 0;
          const selectionEnd = element.selectionEnd || 0;
          element.value = `${element.value.substring(0, selectionStart)}${clipboardText}${element.value.substring(selectionEnd, element.value.length)}`;
          element.selectionStart = selectionStart + clipboardText.length;
          element.selectionEnd = element.selectionStart;
          element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        }
      }
    }),
    new Separator(),
    toAction({ id: "editor.action.selectAll", label: localize(6131, null), run: () => getActiveDocument().execCommand("selectAll") })
  ];
}

var TextInputActionsProvider = class extends Disposable {
  constructor(layoutService, contextMenuService, clipboardService, logService) {
    super();
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.clipboardService = clipboardService;
    this.logService = logService;
    this.textInputActions = new Lazy(() => createTextInputActions(this.clipboardService, this.logService));
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.textInputActionsProvider";
  }
  registerListeners() {
    this._register(Event2.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container: container2, disposables }) => {
      disposables.add(addDisposableListener(container2, "contextmenu", (e4) => this.onContextMenu(getWindow(container2), e4)));
    }, { container: this.layoutService.mainContainer, disposables: this._store }));
  }
  onContextMenu(targetWindow, e4) {
    if (e4.defaultPrevented) {
      return;
    }
    const target = e4.target;
    if (!isHTMLTextAreaElement(target) && !isHTMLInputElement(target)) {
      return;
    }
    EventHelper.stop(e4, true);
    const event = new StandardMouseEvent(targetWindow, e4);
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => this.textInputActions.value,
      getActionsContext: () => target
    });
  }
};

TextInputActionsProvider = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IClipboardService),
  __decorateParam(3, ILogService)
], TextInputActionsProvider);

registerWorkbenchContribution2(
  TextInputActionsProvider.ID,
  TextInputActionsProvider,
  WorkbenchPhase.BlockRestore
  // Block to allow right-click into input fields before restore finished
);
export { createTextInputActions, TextInputActionsProvider };
