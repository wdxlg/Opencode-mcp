// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatPetWidgetService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { $, getWindow, getWindowId, onWillUnregisterWindow } from "./module-0075.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { constObservable } from "./module-0061.mjs";
import { ChatPetWidget } from "./module-2145.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatPetWidgetService.ts
var IChatPetWidgetService = createDecorator("chatPetWidgetService");

var ChatPetWidgetCoordinator = class extends Disposable {
  constructor(createPet, chatWidgetService, onWillUnregisterWindow2 = Event2.None) {
    super();
    this.createPet = createPet;
    this.chatWidgetService = chatWidgetService;
    this.hosts = /* @__PURE__ */ new Map();
    this.windows = /* @__PURE__ */ new Map();
    this._register(this.chatWidgetService.onDidChangeFocusedWidget((widget) => {
      const host = widget ? this.hosts.get(widget) : void 0;
      if (host) {
        this.activate(host);
      }
    }));
    this._register(onWillUnregisterWindow2((windowId) => this.disposeWindow(windowId)));
  }
  register(owner, host, preferred, onDidFocus) {
    if (this.hosts.has(owner)) {
      throw new Error("Cannot register the same chat pet host multiple times");
    }
    const windowId = getWindowId(getWindow(host.parent));
    const entry = {
      owner,
      host,
      windowId,
      preferred,
      active: observableValue(this, false),
      store: new DisposableStore()
    };
    this.hosts.set(owner, entry);
    if (onDidFocus) {
      entry.store.add(onDidFocus(() => this.activate(entry)));
    }
    if (preferred) {
      entry.store.add(autorun((reader) => {
        if (preferred.read(reader)) {
          this.activate(entry);
        } else if (entry.active.read(reader)) {
          const replacement = this.findPreferredHost(windowId);
          if (replacement) {
            this.activate(replacement);
          }
        }
      }));
    }
    if (this.chatWidgetService.lastFocusedWidget === owner || !preferred && !this.windows.has(windowId)) {
      this.activate(entry);
    }
    return {
      active: entry.active,
      dispose: () => this.unregister(entry)
    };
  }
  activate(entry) {
    const current = this.windows.get(entry.windowId);
    if (current?.activeHost === entry) {
      return;
    }
    if (current) {
      current.pet.setHost(entry.host);
      transaction((tx) => {
        current.activeHost?.active.set(false, tx);
        entry.active.set(true, tx);
      });
      current.activeHost = entry;
      return;
    }
    const pet = this.createPet(entry.host);
    entry.active.set(true, void 0);
    this.windows.set(entry.windowId, {
      pet,
      dormantHost: this.createDormantHost(),
      activeHost: entry
    });
  }
  unregister(entry) {
    if (this.hosts.get(entry.owner) !== entry) {
      return;
    }
    entry.store.dispose();
    this.hosts.delete(entry.owner);
    const windowEntry = this.windows.get(entry.windowId);
    if (windowEntry?.activeHost !== entry) {
      return;
    }
    entry.active.set(false, void 0);
    const replacement = this.findReplacementHost(entry.windowId);
    if (replacement) {
      this.activate(replacement);
    } else {
      windowEntry.pet.setHost(windowEntry.dormantHost);
      windowEntry.activeHost = void 0;
    }
  }
  createDormantHost() {
    const parent = $("div");
    return {
      parent,
      dragBounds: parent,
      movementBounds: parent,
      model: constObservable(void 0),
      hasInput: constObservable(false),
      inputChanged: Event2.None,
      getPlatformTop: () => void 0,
      onDidChangePlatform: Event2.None
    };
  }
  disposeWindow(windowId) {
    const windowEntry = this.windows.get(windowId);
    if (!windowEntry) {
      return;
    }
    windowEntry.activeHost?.active.set(false, void 0);
    windowEntry.pet.dispose();
    this.windows.delete(windowId);
  }
  findPreferredHost(windowId) {
    return this.getWindowHosts(windowId).find((entry) => entry.preferred?.get());
  }
  findReplacementHost(windowId) {
    const hosts = this.getWindowHosts(windowId);
    const preferred = hosts.find((entry) => entry.preferred?.get());
    if (preferred) {
      return preferred;
    }
    const focused = this.chatWidgetService.lastFocusedWidget;
    return hosts.find((entry) => entry.owner === focused) ?? hosts[0];
  }
  getWindowHosts(windowId) {
    return Array.from(this.hosts.values()).filter((entry) => entry.windowId === windowId);
  }
  dispose() {
    for (const entry of this.hosts.values()) {
      entry.store.dispose();
    }
    this.hosts.clear();
    for (const entry of this.windows.values()) {
      entry.pet.dispose();
    }
    this.windows.clear();
    super.dispose();
  }
};

var ChatPetWidgetService = class extends Disposable {
  constructor(instantiationService, chatWidgetService) {
    super();
    this.coordinator = this._register(new ChatPetWidgetCoordinator(
      (host) => instantiationService.createInstance(ChatPetWidget, host, void 0),
      chatWidgetService,
      Event2.map(onWillUnregisterWindow, (window2) => getWindowId(window2))
    ));
  }
  register(owner, host, preferred, onDidFocus) {
    return this.coordinator.register(owner, host, preferred, onDidFocus);
  }
};

ChatPetWidgetService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IChatWidgetService)
], ChatPetWidgetService);
export { IChatPetWidgetService, ChatPetWidgetCoordinator, ChatPetWidgetService };
