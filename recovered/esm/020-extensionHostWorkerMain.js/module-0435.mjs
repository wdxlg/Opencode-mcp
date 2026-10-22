// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostBrowsers.ts
import { URI } from "./module-0023.mjs";
import { ThemeIcon2 } from "./module-0238.mjs";
import { Codicon } from "./module-0069.mjs";
import { generateUuid } from "./module-0062.mjs";
import { Emitter } from "./module-0019.mjs";
import { Disposable, DisposableMap } from "./module-0011.mjs";
import { MainContext } from "./module-0025.mjs";
import { ViewColumn2 } from "./module-0239.mjs";


// src/vs/workbench/api/common/extHostBrowsers.ts
var ExtHostBrowserTab = class {
  constructor(id2, _proxy, _sessions, data2) {
    this.id = id2;
    this._proxy = _proxy;
    this._sessions = _sessions;
    this._url = data2.url;
    this._title = data2.title;
    this._favicon = data2.favicon;
    const that = this;
    this.value = {
      get url() {
        return that._url;
      },
      get title() {
        return that._title;
      },
      get icon() {
        return that._favicon ? URI.parse(that._favicon) : new ThemeIcon2(Codicon.globe.id);
      },
      startCDPSession() {
        return that._startCDPSession();
      },
      close() {
        return that._close();
      }
    };
  }
  update(data2) {
    let changed = false;
    if (data2.url !== this._url) {
      this._url = data2.url;
      changed = true;
    }
    if (data2.title !== this._title) {
      this._title = data2.title;
      changed = true;
    }
    if (data2.favicon !== this._favicon) {
      this._favicon = data2.favicon;
      changed = true;
    }
    return changed;
  }
  async _startCDPSession() {
    const sessionId = generateUuid();
    await this._proxy.$startCDPSession(sessionId, this.id);
    const session = new ExtHostBrowserCDPSession(sessionId, this._proxy);
    this._sessions.set(sessionId, session);
    return session.value;
  }
  async _close() {
    await this._proxy.$closeBrowserTab(this.id);
  }
};

var ExtHostBrowserCDPSession = class {
  constructor(id2, _proxy) {
    this.id = id2;
    this._proxy = _proxy;
    this._onDidReceiveMessage = new Emitter();
    this._onDidClose = new Emitter();
    this._closed = false;
    const that = this;
    this.value = {
      get onDidReceiveMessage() {
        return that._onDidReceiveMessage.event;
      },
      get onDidClose() {
        return that._onDidClose.event;
      },
      sendMessage(message) {
        return that._sendMessage(message);
      },
      close() {
        return that._close();
      }
    };
  }
  dispose() {
    this._onDidReceiveMessage.dispose();
    this._onDidClose.dispose();
  }
  async _sendMessage(message) {
    if (this._closed) {
      throw new Error("Session is closed");
    }
    if (!message || typeof message !== "object") {
      throw new Error("Message must be an object");
    }
    if (typeof message.id !== "number") {
      throw new Error("Message must have a numeric id");
    }
    if (typeof message.method !== "string") {
      throw new Error("Message must have a method string");
    }
    if (message.params !== void 0 && typeof message.params !== "object") {
      throw new Error("Message params must be an object");
    }
    if (message.sessionId !== void 0 && typeof message.sessionId !== "string") {
      throw new Error("Message sessionId must be a string");
    }
    await this._proxy.$sendCDPMessage(this.id, { id: message.id, method: message.method, params: message.params, sessionId: message.sessionId });
  }
  async _close() {
    this._closed = true;
    await this._proxy.$closeCDPSession(this.id);
  }
  // Called from main thread
  _acceptMessage(message) {
    this._onDidReceiveMessage.fire(message);
  }
  _acceptClosed() {
    this._closed = true;
    this._onDidClose.fire();
  }
};

var ExtHostBrowsers = class extends Disposable {
  constructor(mainContext) {
    super();
    this._browserTabs = /* @__PURE__ */ new Map();
    this._sessions = this._register(new DisposableMap());
    this._onDidOpenBrowserTab = this._register(new Emitter());
    this.onDidOpenBrowserTab = this._onDidOpenBrowserTab.event;
    this._onDidCloseBrowserTab = this._register(new Emitter());
    this.onDidCloseBrowserTab = this._onDidCloseBrowserTab.event;
    this._onDidChangeActiveBrowserTab = this._register(new Emitter());
    this.onDidChangeActiveBrowserTab = this._onDidChangeActiveBrowserTab.event;
    this._onDidChangeBrowserTabState = this._register(new Emitter());
    this.onDidChangeBrowserTabState = this._onDidChangeBrowserTabState.event;
    this._proxy = mainContext.getProxy(MainContext.MainThreadBrowsers);
  }
  // #region Public API (called from extension code)
  get browserTabs() {
    return [...this._browserTabs.values()].map((t) => t.value);
  }
  get activeBrowserTab() {
    if (this._activeBrowserTabId) {
      return this._browserTabs.get(this._activeBrowserTabId)?.value;
    }
    return void 0;
  }
  async openBrowserTab(url, options2) {
    const viewColumn = ViewColumn2.from(options2?.viewColumn);
    const dto = await this._proxy.$openBrowserTab(url, viewColumn, {
      preserveFocus: options2?.preserveFocus,
      inactive: options2?.background
    });
    return this._getOrCreateTab(dto).value;
  }
  // #endregion
  // #region Internal helpers
  _getOrCreateTab(dto) {
    let tab = this._browserTabs.get(dto.id);
    if (!tab) {
      tab = new ExtHostBrowserTab(dto.id, this._proxy, this._sessions, dto);
      this._browserTabs.set(dto.id, tab);
      this._onDidOpenBrowserTab.fire(tab.value);
    } else {
      tab.update(dto);
    }
    return tab;
  }
  // #endregion
  // #region Main thread callbacks
  $onDidOpenBrowserTab(dto) {
    this._getOrCreateTab(dto);
  }
  $onDidCloseBrowserTab(browserId) {
    const tab = this._browserTabs.get(browserId);
    if (tab) {
      this._browserTabs.delete(browserId);
      if (this._activeBrowserTabId === browserId) {
        this._activeBrowserTabId = void 0;
      }
      this._onDidCloseBrowserTab.fire(tab.value);
    }
  }
  $onDidChangeActiveBrowserTab(browserId) {
    this._activeBrowserTabId = browserId;
    this._onDidChangeActiveBrowserTab.fire(this.activeBrowserTab);
  }
  $onDidChangeBrowserTabState(data2) {
    const tab = this._browserTabs.get(data2.id);
    if (tab && tab.update(data2)) {
      this._onDidChangeBrowserTabState.fire(tab.value);
    }
  }
  $onCDPSessionMessage(sessionId, message) {
    const session = this._sessions.get(sessionId);
    if (session) {
      session._acceptMessage(message);
    }
  }
  $onCDPSessionClosed(sessionId) {
    const session = this._sessions.get(sessionId);
    if (session) {
      session._acceptClosed();
      this._sessions.deleteAndDispose(sessionId);
    }
  }
  // #endregion
};
export { ExtHostBrowserTab, ExtHostBrowserCDPSession, ExtHostBrowsers };
