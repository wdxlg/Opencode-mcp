// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { WebviewInput } from "./module-1116.mjs";
import { DeferredPromise, createCancelablePromise } from "./module-0036.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { IThemeService } from "./module-0287.mjs";
import { Disposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CONTEXT_ACTIVE_WEBVIEW_PANEL_ID } from "./module-1119.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Iterable } from "./module-0011.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IWebviewService } from "./module-1042.mjs";


// src/vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService.ts
var IWebviewWorkbenchService = createDecorator("webviewEditorService");

function canRevive(reviver, webview) {
  return reviver.canResolve(webview);
}

var LazilyResolvedWebviewEditorInput = class extends WebviewInput {
  constructor(init, webview, themeService, _webviewWorkbenchService) {
    super(init, webview, themeService);
    this._webviewWorkbenchService = _webviewWorkbenchService;
    this._resolved = false;
  }
  dispose() {
    super.dispose();
    this._resolvePromise?.cancel();
    this._resolvePromise = void 0;
  }
  async resolve() {
    if (!this._resolved) {
      this._resolved = true;
      this._resolvePromise = createCancelablePromise((token) => this._webviewWorkbenchService.resolveWebview(this, token));
      try {
        await this._resolvePromise;
      } catch (e) {
        if (!isCancellationError(e)) {
          throw e;
        }
      }
    }
    return super.resolve();
  }
  transfer(other) {
    if (!super.transfer(other)) {
      return;
    }
    other._resolved = this._resolved;
    return other;
  }
};

__decorateClass([
  memoize
], LazilyResolvedWebviewEditorInput.prototype, "resolve", 1);

LazilyResolvedWebviewEditorInput = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IWebviewWorkbenchService)
], LazilyResolvedWebviewEditorInput);

var RevivalPool = class {
  constructor() {
    this._awaitingRevival = [];
  }
  enqueueForRestoration(input, token) {
    const promise = new DeferredPromise();
    const remove2 = () => {
      const index2 = this._awaitingRevival.findIndex((entry) => input === entry.input);
      if (index2 >= 0) {
        this._awaitingRevival.splice(index2, 1);
      }
    };
    const disposable = combinedDisposable(
      input.webview.onDidDispose(remove2),
      token.onCancellationRequested(() => {
        remove2();
        promise.cancel();
      })
    );
    this._awaitingRevival.push({ input, promise, disposable });
    return promise.p;
  }
  reviveFor(reviver, token) {
    const toRevive = this._awaitingRevival.filter(({ input }) => canRevive(reviver, input));
    this._awaitingRevival = this._awaitingRevival.filter(({ input }) => !canRevive(reviver, input));
    for (const { input, promise: resolve3, disposable } of toRevive) {
      reviver.resolveWebview(input, token).then((x) => resolve3.complete(x), (err) => resolve3.error(err)).finally(() => {
        disposable.dispose();
      });
    }
  }
};

var WebviewEditorService = class extends Disposable {
  constructor(editorGroupsService, _editorService, _instantiationService, _webviewService) {
    super();
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._webviewService = _webviewService;
    this._revivers = /* @__PURE__ */ new Set();
    this._revivalPool = new RevivalPool();
    this._onDidChangeActiveWebviewEditor = this._register(new Emitter());
    this.onDidChangeActiveWebviewEditor = this._onDidChangeActiveWebviewEditor.event;
    this._register(editorGroupsService.registerContextKeyProvider({
      contextKey: CONTEXT_ACTIVE_WEBVIEW_PANEL_ID,
      getGroupContextKeyValue: (group2) => this.getWebviewId(group2.activeEditor)
    }));
    this._register(_editorService.onDidActiveEditorChange(() => {
      this.updateActiveWebview();
    }));
    this._register(_webviewService.onDidChangeActiveWebview(() => {
      this.updateActiveWebview();
    }));
    this.updateActiveWebview();
  }
  getWebviewId(input) {
    let webviewInput;
    if (input instanceof WebviewInput) {
      webviewInput = input;
    } else if (input instanceof DiffEditorInput) {
      if (input.primary instanceof WebviewInput) {
        webviewInput = input.primary;
      } else if (input.secondary instanceof WebviewInput) {
        webviewInput = input.secondary;
      }
    }
    return webviewInput?.webview.providedViewType ?? "";
  }
  updateActiveWebview() {
    const activeInput = this._editorService.activeEditor;
    let newActiveWebview;
    if (activeInput instanceof WebviewInput) {
      newActiveWebview = activeInput;
    } else if (activeInput instanceof DiffEditorInput) {
      if (activeInput.primary instanceof WebviewInput && activeInput.primary.webview === this._webviewService.activeWebview) {
        newActiveWebview = activeInput.primary;
      } else if (activeInput.secondary instanceof WebviewInput && activeInput.secondary.webview === this._webviewService.activeWebview) {
        newActiveWebview = activeInput.secondary;
      }
    }
    if (newActiveWebview !== this._activeWebview) {
      this._activeWebview = newActiveWebview;
      this._onDidChangeActiveWebviewEditor.fire(newActiveWebview);
    }
  }
  openWebview(webviewInitInfo, viewType, title, iconPath, showOptions) {
    const webview = this._webviewService.createWebviewOverlay(webviewInitInfo);
    const webviewInput = this._instantiationService.createInstance(WebviewInput, { viewType, name: title, providedId: webviewInitInfo.providedViewType, iconPath }, webview);
    this._editorService.openEditor(webviewInput, {
      pinned: true,
      preserveFocus: showOptions.preserveFocus,
      // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
      // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
      activation: showOptions.preserveFocus ? 2 /* RESTORE */ : void 0
    }, showOptions.group);
    return webviewInput;
  }
  revealWebview(webview, group2, preserveFocus) {
    const topLevelEditor = this.findTopLevelEditorForWebview(webview);
    this._editorService.openEditor(topLevelEditor, {
      preserveFocus,
      // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
      // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
      activation: preserveFocus ? 2 /* RESTORE */ : void 0
    }, group2);
  }
  findTopLevelEditorForWebview(webview) {
    for (const editor of this._editorService.editors) {
      if (editor === webview) {
        return editor;
      }
      if (editor instanceof DiffEditorInput) {
        if (webview === editor.primary || webview === editor.secondary) {
          return editor;
        }
      }
    }
    return webview;
  }
  openRevivedWebview(options3) {
    const webview = this._webviewService.createWebviewOverlay(options3.webviewInitInfo);
    webview.state = options3.state;
    const webviewInput = this._instantiationService.createInstance(LazilyResolvedWebviewEditorInput, {
      viewType: options3.viewType,
      providedId: options3.webviewInitInfo.providedViewType,
      name: options3.title,
      iconPath: options3.iconPath
    }, webview);
    webviewInput.iconPath = options3.iconPath;
    if (typeof options3.group === "number") {
      webviewInput.updateGroup(options3.group);
    }
    return webviewInput;
  }
  registerResolver(reviver) {
    this._revivers.add(reviver);
    const cts = new CancellationTokenSource();
    this._revivalPool.reviveFor(reviver, cts.token);
    return toDisposable(() => {
      this._revivers.delete(reviver);
      cts.dispose(true);
    });
  }
  shouldPersist(webview) {
    if (webview instanceof LazilyResolvedWebviewEditorInput) {
      return true;
    }
    return Iterable.some(this._revivers.values(), (reviver) => canRevive(reviver, webview));
  }
  async tryRevive(webview, token) {
    for (const reviver of this._revivers.values()) {
      if (canRevive(reviver, webview)) {
        await reviver.resolveWebview(webview, token);
        return true;
      }
    }
    return false;
  }
  async resolveWebview(webview, token) {
    const didRevive = await this.tryRevive(webview, token);
    if (!didRevive && !token.isCancellationRequested) {
      return this._revivalPool.enqueueForRestoration(webview, token);
    }
  }
};

WebviewEditorService = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IWebviewService)
], WebviewEditorService);
export { canRevive, IWebviewWorkbenchService, LazilyResolvedWebviewEditorInput, RevivalPool, WebviewEditorService };
