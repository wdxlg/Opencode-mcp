// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadCodeInsets.ts
import { getWindow } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { reviveWebviewContentOptions } from "./module-1040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IWebviewService } from "./module-1042.mjs";


// src/vs/workbench/api/browser/mainThreadCodeInsets.ts
var EditorWebviewZone = class {
  // suppressMouseDown?: boolean | undefined;
  // heightInPx?: number | undefined;
  // minWidthInPx?: number | undefined;
  // marginDomNode?: HTMLElement | null | undefined;
  // onDomNodeTop?: ((top: number) => void) | undefined;
  // onComputedHeight?: ((height: number) => void) | undefined;
  constructor(editor, line, height, webview) {
    this.editor = editor;
    this.line = line;
    this.height = height;
    this.webview = webview;
    this.domNode = document.createElement("div");
    this.domNode.style.zIndex = "10";
    this.afterLineNumber = line;
    this.afterColumn = 1;
    this.heightInLines = height;
    editor.changeViewZones((accessor) => this._id = accessor.addZone(this));
    webview.mountTo(this.domNode, getWindow(editor.getDomNode()));
  }
  dispose() {
    this.editor.changeViewZones((accessor) => this._id && accessor.removeZone(this._id));
  }
};

var MainThreadEditorInsets = class {
  constructor(context2, _editorService, _webviewService) {
    this._editorService = _editorService;
    this._webviewService = _webviewService;
    this._disposables = new DisposableStore();
    this._insets = /* @__PURE__ */ new Map();
    this._proxy = context2.getProxy(ExtHostContext.ExtHostEditorInsets);
  }
  dispose() {
    this._disposables.dispose();
  }
  async $createEditorInset(handle2, id2, uri5, line, height, options3, extensionId, extensionLocation) {
    let editor;
    id2 = id2.substr(0, id2.indexOf(","));
    for (const candidate of this._editorService.listCodeEditors()) {
      if (candidate.getId() === id2 && candidate.hasModel() && isEqual2(candidate.getModel().uri, URI.revive(uri5))) {
        editor = candidate;
        break;
      }
    }
    if (!editor) {
      setTimeout(() => this._proxy.$onDidDispose(handle2));
      return;
    }
    const disposables = new DisposableStore();
    const webview = this._webviewService.createWebviewElement({
      title: void 0,
      options: {
        enableFindWidget: false
      },
      contentOptions: reviveWebviewContentOptions(options3),
      extension: { id: extensionId, location: URI.revive(extensionLocation) }
    });
    const webviewZone = new EditorWebviewZone(editor, line, height, webview);
    const remove2 = () => {
      disposables.dispose();
      this._proxy.$onDidDispose(handle2);
      this._insets.delete(handle2);
    };
    disposables.add(editor.onDidChangeModel(remove2));
    disposables.add(editor.onDidDispose(remove2));
    disposables.add(webviewZone);
    disposables.add(webview);
    disposables.add(webview.onMessage((msg) => this._proxy.$onDidReceiveMessage(handle2, msg.message)));
    this._insets.set(handle2, webviewZone);
  }
  $disposeEditorInset(handle2) {
    const inset = this.getInset(handle2);
    this._insets.delete(handle2);
    inset.dispose();
  }
  $setHtml(handle2, value2) {
    const inset = this.getInset(handle2);
    inset.webview.setHtml(value2);
  }
  $setOptions(handle2, options3) {
    const inset = this.getInset(handle2);
    inset.webview.contentOptions = reviveWebviewContentOptions(options3);
  }
  async $postMessage(handle2, value2) {
    const inset = this.getInset(handle2);
    inset.webview.postMessage(value2);
    return true;
  }
  getInset(handle2) {
    const inset = this._insets.get(handle2);
    if (!inset) {
      throw new Error("Unknown inset");
    }
    return inset;
  }
};

MainThreadEditorInsets = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadEditorInsets),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IWebviewService)
], MainThreadEditorInsets);
export { EditorWebviewZone, MainThreadEditorInsets };
