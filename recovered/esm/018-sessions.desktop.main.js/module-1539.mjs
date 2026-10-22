// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewView/browser/webviewViewPane.ts
import { ViewPane } from "./module-1334.mjs";
import { MenuId } from "./module-0092.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Memento } from "./module-1042.mjs";
import { ExtensionKeyedWebviewOriginStore, IWebviewService } from "./module-1043.mjs";
import { EventType, addDisposableListener, findParentWithClass, getWindow } from "./module-0075.mjs";
import { WebviewWindowDragMonitor } from "./module-1116.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { IActivityService, NumberBadge } from "./module-1448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IWebviewViewService } from "./module-1306.mjs";


// src/vs/workbench/contrib/webviewView/browser/webviewViewPane.ts
var storageKeys = {
  webviewState: "webviewState"
};

var WebviewViewPane = class extends ViewPane {
  constructor(options3, configurationService, contextKeyService, contextMenuService, instantiationService, keybindingService, openerService, hoverService, themeService, viewDescriptorService, activityService, extensionService, progressService, storageService, viewService, webviewService, webviewViewService) {
    super({ ...options3, titleMenuId: MenuId.ViewTitle, showActions: 1 /* WhenExpanded */ }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.activityService = activityService;
    this.extensionService = extensionService;
    this.progressService = progressService;
    this.storageService = storageService;
    this.viewService = viewService;
    this.webviewService = webviewService;
    this.webviewViewService = webviewViewService;
    this._webview = this._register(new MutableDisposable());
    this._webviewDisposables = this._register(new DisposableStore());
    this._activated = false;
    this.activity = this._register(new MutableDisposable());
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onDispose = this._register(new Emitter());
    this.onDispose = this._onDispose.event;
    this.extensionId = options3.fromExtensionId;
    this.defaultTitle = this.title;
    this.memento = new Memento(`webviewView.${this.id}`, storageService);
    this.viewState = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
    this._register(this.webviewViewService.onNewResolverRegistered((e4) => {
      if (e4.viewType === this.id) {
        this.updateTreeVisibility();
      }
    }));
    this.updateTreeVisibility();
  }
  static getOriginStore(storageService) {
    this._originStore ??= new ExtensionKeyedWebviewOriginStore("webviewViews.origins", storageService);
    return this._originStore;
  }
  dispose() {
    this._onDispose.fire();
    super.dispose();
  }
  focus() {
    super.focus();
    this._webview.value?.focus();
  }
  renderBody(container2) {
    super.renderBody(container2);
    this._container = container2;
    this._rootContainer = void 0;
    container2.tabIndex = 0;
    container2.setAttribute("role", "document");
    this._register(addDisposableListener(container2, "focus", (e4) => {
      if (e4.target === container2 && this._webview.value) {
        this._webview.value.focus();
      }
    }));
    this.layoutWebview();
  }
  saveState() {
    if (this._webview.value) {
      this.viewState[storageKeys.webviewState] = this._webview.value.state;
    }
    this.memento.saveMemento();
    super.saveState();
  }
  updateTreeVisibility() {
    if (this.isBodyVisible()) {
      this.activate();
      this._webview.value?.claim(this, getWindow(this.element), void 0);
    } else {
      this._webview.value?.release(this);
    }
  }
  activate() {
    if (this._activated) {
      return;
    }
    this._activated = true;
    const origin = this.extensionId ? WebviewViewPane.getOriginStore(this.storageService).getOrigin(this.id, this.extensionId) : void 0;
    const webview = this.webviewService.createWebviewOverlay({
      origin,
      providedViewType: this.id,
      title: this.title,
      options: { purpose: "webviewView" /* WebviewView */ },
      contentOptions: {},
      extension: this.extensionId ? { id: this.extensionId } : void 0
    });
    webview.state = this.viewState[storageKeys.webviewState];
    this._webview.value = webview;
    this.layoutWebview();
    this._webviewDisposables.add(toDisposable(() => {
      this._webview.value?.release(this);
    }));
    this._webviewDisposables.add(webview.onDidUpdateState(() => {
      this.viewState[storageKeys.webviewState] = webview.state;
    }));
    for (const event of [EventType.DRAG, EventType.DRAG_END, EventType.DRAG_ENTER, EventType.DRAG_LEAVE, EventType.DRAG_START]) {
      this._webviewDisposables.add(addDisposableListener(this._webview.value.container, event, (e4) => {
        e4.preventDefault();
        e4.stopImmediatePropagation();
        this.dropTargetElement.dispatchEvent(new DragEvent(e4.type, e4));
      }));
    }
    this._webviewDisposables.add(new WebviewWindowDragMonitor(getWindow(this.element), () => this._webview.value));
    const source = this._webviewDisposables.add(new CancellationTokenSource());
    this._webviewDisposables.add(toDisposable(() => source.cancel()));
    this.withProgress(async () => {
      await this.extensionService.activateByEvent(`onView:${this.id}`);
      const self2 = this;
      const webviewView = {
        webview,
        onDidChangeVisibility: this.onDidChangeBodyVisibility,
        onDispose: this.onDispose,
        get title() {
          return self2.setTitle;
        },
        set title(value2) {
          self2.updateTitle(value2);
        },
        get description() {
          return self2.titleDescription;
        },
        set description(value2) {
          self2.updateTitleDescription(value2);
        },
        get badge() {
          return self2.badge;
        },
        set badge(badge) {
          self2.updateBadge(badge);
        },
        dispose: () => {
          this._activated = false;
          this._webview.clear();
          this._webviewDisposables.clear();
        },
        show: (preserveFocus) => {
          this.viewService.openView(this.id, !preserveFocus);
        }
      };
      await this.webviewViewService.resolve(this.id, webviewView, source.token);
    });
  }
  updateTitle(value2) {
    this.setTitle = value2;
    super.updateTitle(typeof value2 === "string" ? value2 : this.defaultTitle);
  }
  updateBadge(badge) {
    if (this.badge?.value === badge?.value && this.badge?.tooltip === badge?.tooltip) {
      return;
    }
    this.badge = badge;
    if (badge) {
      const activity = {
        badge: new NumberBadge(badge.value, () => badge.tooltip),
        priority: 150
      };
      this.activity.value = this.activityService.showViewActivity(this.id, activity);
    }
  }
  async withProgress(task) {
    return this.progressService.withProgress({ location: this.id, delay: 500 }, task);
  }
  layoutWebview() {
    const webviewEntry = this._webview.value;
    if (!this._container || !webviewEntry) {
      return;
    }
    if (!this._rootContainer || !this._rootContainer.isConnected) {
      this._rootContainer = this.findRootContainer(this._container);
    }
    webviewEntry.setAnchorElement(this._container, this._rootContainer);
  }
  findRootContainer(container2) {
    return findParentWithClass(container2, "monaco-scrollable-element") ?? void 0;
  }
};

WebviewViewPane = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IActivityService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IProgressService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IViewsService),
  __decorateParam(15, IWebviewService),
  __decorateParam(16, IWebviewViewService)
], WebviewViewPane);
export { storageKeys, WebviewViewPane };
